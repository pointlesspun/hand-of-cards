'use strict';

import { Transform } from "../framework/transform.js";
import { Vector3 } from "../framework/vector3.js";
import { ELEMENT_TYPES } from "../framework/element-types.js";
import { ANIMATION_EVENT_TYPE, AnimationEvent } from "../framework/animation-utilities.js";

import { CardEvent, CARD_EVENT_TYPES } from "./card-event.js";

// number of pixels of movement allowed before a tap becomes a swipe
const TAP_THRESHOLD = 10;

/** Prefix to generate React cards */
export const CARD_KEY_PREFIX = "hoc-card";


export class CardComponent extends React.Component {
    constructor(props) {
        super(props);   
        
        // transient properties
        this.ref = React.createRef();
        this.isRefInitialized = false;
        this.animationCount = 0;
    
        this.state = {
          index: props.index,
          isSelected: props.isSelected,
          timeSelected: Date.now(),
          context: this.props.context,
          eventHandler: this.props.eventHandler
        };       

        // transient properties
        this.animation = props.animation;
        this.activeAnimation = null;
        this.swipeListener = (evt) => {
            if (this.state.eventHandler) {
                this.state.eventHandler(new CardEvent(this, CARD_EVENT_TYPES.SWIPE, evt));
            }
        };
        this.mouseListener = (evt) => {
            if (evt.type === 'mouseover') {
                if (this.state.eventHandler) {
                    this.state.eventHandler(new CardEvent(this, CARD_EVENT_TYPES.FOCUS));
                }
            } else if (evt.type === 'mouseup') {
                this.state.eventHandler(new CardEvent(this, CARD_EVENT_TYPES.TAP));
            }
        };
    }

    updateContext(context) {
        this.setState({
            ...this.state,
            context
        });
    }

    setSelected(isSelected) {
        this.setState({
            ...this.state,
            timeSelected: Date.now(),
            isSelected
        });
    }

    setIndex(index) {
        this.setState({
            ...this.state,
            index
        });
    }

    render() {
        if (this.index < 0) {
            return React.createElement(ELEMENT_TYPES.DIV, {visibility: "collapse", className: "card-item"});    
        }

        const cardContext = this.state.context;

        const config = cardContext.getMediaConfig();
        const activeIndex = cardContext.getActiveIndex();
        const cardCount = cardContext.getCardCount();
        const centerCardIndex = cardContext.getCenterCardIndex();
        
        const isActive = this.state.index === activeIndex;
        
        const transform = this.calculateTransform(config, cardCount, this.state.index, activeIndex, centerCardIndex, this.state.isSelected);

        const properties = {
            id: this.props.keyReference,
            className : this.createClassName(isActive),
            ref: this.ref,
            style : {
                width : config.values.cardWidth + "px",
                height : config.values.cardHeight + "px",
                transformOrigin: "center bottom",
                transform:  transform ? transform.toCss({}) : "",
                background: this.props.definition.toCss(),
            } ,
            onAnimationEnd: () => { 
                const completedAnimation = this.activeAnimation;

                this.activeAnimation = null;
                this.animation = null; 

                if(this.state.eventHandler) {
                    this.state.eventHandler(new CardEvent(this, CARD_EVENT_TYPES.ANIMATION, new AnimationEvent(this, completedAnimation, ANIMATION_EVENT_TYPE.END)));
                } 
            },
            onTouchStart: (evt) => this.handleTouch(evt),
            onTouchEnd: (evt) => this.handleTouch(evt),
        };
        
        // can only play one animation at the time
        if (this.animation && !this.activeAnimation) {
            properties.style = {
                ...properties.style,
                ...this.animation.createAnimation({
                    idx: this.state.index,
                    config,
                    targetTransform: transform
                })
            }; 

            this.activeAnimation = this.animation;

            if (this.state.eventHandler) {
                this.state.eventHandler(new CardEvent(this, CARD_EVENT_TYPES.ANIMATION, new AnimationEvent(this, this.activeAnimation, ANIMATION_EVENT_TYPE.START)));
            }
        }

        // color overlay giving the card some shadow depending on its state
        const overlay = React.createElement(ELEMENT_TYPES.DIV, { className : `card-overlay${isActive ? "-active" : ""}`});

        return React.createElement(ELEMENT_TYPES.DIV, properties, overlay);
    }

    componentDidMount() {
        this.ref.current.addEventListener('swiped', this.swipeListener);
        this.ref.current.addEventListener('mouseover', this.mouseListener);
        this.ref.current.addEventListener('mouseup', this.mouseListener);
    }

    componentWillUnmount() {
        this.ref.current.removeEventListener('swiped', this.swipeListener);
        this.ref.current.removeEventListener('mouseover', this.mouseListener);
        this.ref.current.removeEventListener('mouseup', this.mouseListener);
    }

    setAnimation(animation) {
        this.animation = animation;
        this.forceUpdate();
    }

    /**
     * Calculates the transformation (translation, rotation, scale) of the card on screen
     * @private
     * @param {PlatformConfiguration} config contains the settings relevant to the current media/device 
     * @param {number} cardCount represents to the total number of cards in hand
     * @param {number} activeIndex index of the card the player is currently looking at
     * @param {number} centerCardIndex index of the card which is the center of the hand
     * @returns {Transform}
     */
     calculateTransform(config, cardCount, index, activeIndex, centerCardIndex, isSelected) {
        
        // short hand reference
        const values = config.values;

        // size of the div containing these cards
        const parentHeight = config.clientSize.height * values.innerHeight;

        // is the current card active (the one in the center which the user is working with) ?
        const isActive = index === activeIndex;

        // center of the parent x axis
        const parentCenterX = config.clientSize.width / 2;

        // how far is this card from the center cards ?
        const deltaCenterIdx = index - centerCardIndex;

        const maxDeltaIdx = Math.abs(deltaCenterIdx) / cardCount;

        // try to scale down items further away from the center somewhat more
        const itemScale = values.baseScale + values.dynamicScale * (1-maxDeltaIdx);

        // if the item is selected raise the y position
        const itemSelectedOffset = isSelected ? values.ySelectedOffset : 0;
        
        // if the item is active raise the y position
        const itemActiveOffset = isActive ? values.yActiveOffset : 0;
        
        // move the card to the bottom of the parent
        const yOffset =  (parentHeight - values.cardHeight) + values.yBaseOffset;
        
        // move the card further down, the further it is from the center card to produce a curved hand illusion
        const yOffsetWrtActive = isActive ? 0 : Math.abs(deltaCenterIdx) * Math.abs(deltaCenterIdx) * values.yTranslation;

        const cardCenterX = values.cardWidth / 2;

        return new Transform(
            new Vector3(
                parentCenterX - cardCenterX + deltaCenterIdx * values.xTranslation,
                yOffset + itemSelectedOffset + itemActiveOffset + yOffsetWrtActive,
                // make sure the cards closer to the center overlap cards further away
                isActive ? 200 : 100 - Math.abs(deltaCenterIdx)
            ),
            new Vector3(itemScale, itemScale),
            isActive ? 0 :  values.rotation * deltaCenterIdx,
        );        
    }

    createClassName(isActive) {
        let className = `card-item`;

        if (!this.animation) {
            if (isActive) {
                className += " card-item-active";
            }

            if (this.state.isSelected) {
                className += " card-item-selected";
            }
        }

        return className;
    }

    handleTouch(evt) {
        // wait for the animations to finish
        if (evt.type === 'touchstart') {
            
            this.touchStart = new Vector3(evt.changedTouches[0].clientX, evt.changedTouches[0].clientY);
            } else {
            const delta = new Vector3(evt.changedTouches[0].clientX  - this.touchStart.x, evt.changedTouches[0].clientY - this.touchStart.y);
            
            if (delta.length() < TAP_THRESHOLD && this.state.eventHandler) {
                // tap happened
                this.state.eventHandler(new CardEvent(this, CARD_EVENT_TYPES.TAP));
            }
        }
      }  

      handleSwiped(evt) {
          if (this.state.eventHandler) {
            this.state.eventHandler(new CardEvent(this, CARD_EVENT_TYPES.SWIPE, evt.detail.dir));
          }
      }
}