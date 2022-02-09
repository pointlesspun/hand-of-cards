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
          activeIndex: props.activeIndex,
          cardCount: props.cardCount,
          centerIndex: props.centerIndex,
          isSelected: props.isSelected ?? false,
          lastUpdate: Date.now(),
          mediaConfig: props.mediaConfig,
          eventHandler: props.eventHandler,
          animation: props.animation,
          isDeleted: false
        };       

        // transient properties
        this.swipeListener = (evt) => this.handleSwiped(evt);
        this.mouseListener = (evt) => this.handleMouseEvent(evt);
        this.touchListener = (evt) => this.handleTouch(evt);
        this.animationListener = (evt) => this.handleAnimationEnded(evt);
    }
    
    // --- React overrides --------------------------------------------------------------------------------------------

    render() {
        // no configuration known yet
        if (!this.state.mediaConfig) {
            return React.createElement(ELEMENT_TYPES.DIV, { 
                ref: this.ref,
            });
        }

        const isActive = this.state.index === this.state.activeIndex;
        
        const transform = this.calculateTransform(
            this.state.mediaConfig, 
            this.state.cardCount, 
            this.state.index, 
            this.state.activeIndex, 
            this.state.centerIndex, 
            this.state.isSelected
        );

        const properties = {
            id: this.props.keyReference,
            className : this.createClassName(isActive),
            ref: this.ref,
  
            style : {
                width : this.state.mediaConfig.values.cardWidth + "px",
                height : this.state.mediaConfig.values.cardHeight + "px",
                transformOrigin: "center bottom",
                background: this.props.definition.toCss()
            } 
        };
        
        // if an activation is playing don't play an animation or set the transform
        if (!properties.style.animationName) {
            // is an animation scheduled
            if (this.state.animation) {
                this.startAnimation(transform, properties, this.state.mediaConfig);
            } else {
                // no animation just define the intended position, scale & rotation of the card
                properties.style.transform = transform.toCss({});
            }
        }
        
        return React.createElement(ELEMENT_TYPES.DIV, properties, this.renderOverlay(isActive));
    }

    // --- Sub elements -----------------------------------------------------------------------------------------------

    /** 
     * color overlay giving the card some shadow depending on its state
     * @private
     */ 
    renderOverlay(isActive) {
        return React.createElement(ELEMENT_TYPES.DIV, { className : `card-overlay${isActive ? "-active" : ""}`});
    } 

    // --- Event handlers ---------------------------------------------------------------------------------------------
    
    componentDidMount() {
        const parameters =  { passive: false };
        
        this.ref.current.addEventListener('swiped', this.swipeListener);
        this.ref.current.addEventListener('mouseover', this.mouseListener, parameters );
        this.ref.current.addEventListener('mouseup', this.mouseListener, parameters );
        this.ref.current.addEventListener('touchstart', this.touchListener, parameters );
        this.ref.current.addEventListener('touchend', this.touchListener, parameters );
        this.ref.current.addEventListener('animationend', this.animationListener);
    }

    componentWillUnmount() {
        this.ref.current.removeEventListener('swiped', this.swipeListener);
        this.ref.current.removeEventListener('mouseover', this.mouseListener);
        this.ref.current.removeEventListener('mouseup', this.mouseListener);
        this.ref.current.removeEventListener('touchstart', this.touchListener);
        this.ref.current.removeEventListener('touchend', this.touchListener);
        this.ref.current.removeEventListener('animationend', this.animationListener);
    }

    handleTouch(evt) {
        // wait for the animations to finish
        if (evt.type === 'touchstart') {    
            this.touchStart = new Vector3(evt.changedTouches[0].clientX, evt.changedTouches[0].clientY);
        } else {
            const delta = new Vector3(evt.changedTouches[0].clientX - this.touchStart.x, 
                                            evt.changedTouches[0].clientY - this.touchStart.y);
            
            if (delta.length() < TAP_THRESHOLD && this.state.eventHandler) {
                // tap happened
                this.state.eventHandler(new CardEvent(this, CARD_EVENT_TYPES.TAP));
            }
        }

        if (evt.cancelable) {
            evt.preventDefault();
        }
    }  

    handleSwiped(evt) {
        if (this.state.eventHandler) {
            this.state.eventHandler(new CardEvent(this, CARD_EVENT_TYPES.SWIPE, evt));
        }
    }

    handleMouseEvent(evt) {
        if (evt.type === 'mouseover') {
            if (this.state.eventHandler) {
                this.state.eventHandler(new CardEvent(this, CARD_EVENT_TYPES.FOCUS));
            }
        } else if (evt.type === 'mouseup') {
            this.state.eventHandler(new CardEvent(this, CARD_EVENT_TYPES.TAP));
        }

        evt.preventDefault();
    }

    handleAnimationEnded(evt) {       
        if(this.state.eventHandler) {
            const animationEvent = new AnimationEvent(this, this.state.animation, ANIMATION_EVENT_TYPE.END);
            this.state.eventHandler(new CardEvent(this, CARD_EVENT_TYPES.ANIMATION, animationEvent));
        } 

        if (!this.state.isDeleted) {
            this.setAnimation(null);
        }
    }
    
    // --- State mutations & queries ----------------------------------------------------------------------------------
    
    shouldComponentUpdate( nextProps, nextState) {
        // do not re-render if this card is flagged for deletion. If this is omitted we end up with the last frame
        // of the animation being rendered with the default transform when the animation is cleared. 
        return nextState.isDeleted === false;
    }

    setMediaConfig = (mediaConfig) => this.setState({mediaConfig});

    setCardCount = (cardCount) => this.setState({cardCount});
    
    setActiveIndex = (activeIndex) => this.setState({activeIndex});

    setCenterIndex = (centerIndex) => this.setState({centerIndex});

    setActiveAndCenterIndices = (activeIndex, centerIndex) => {
        this.setActiveIndex(activeIndex);
        this.setCenterIndex(centerIndex);
    }

    setSelected = (isSelected) =>
        this.setState({
            lastUpdate: Date.now(),
            isSelected
        });
    
    setIndex = (index) => this.setState({index});

    setAnimation = (animation) => this.setState({animation});
    
    setDeleted = () => this.setState({isDeleted: true});

    isSelected = () => this.state.isSelected;

    // --- Utility methods  -------------------------------------------------------------------------------------------
    
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
        const yOffsetWrtActive = isActive 
            ? 0 
            : Math.abs(deltaCenterIdx) * Math.abs(deltaCenterIdx) * values.yTranslation;

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

        if (!this.state.animation) {
            if (isActive) {
                className += " card-item-active";
            }

            if (this.state.isSelected) {
                className += " card-item-selected";
            }
        }

        return className;
    }

    startAnimation(targetTransform, properties, config) {
        properties.style = {
            ...properties.style,
            ...this.state.animation.createAnimation({
                idx: this.state.index,
                config,
                targetTransform
            })
        }; 

        if (this.state.eventHandler) {
            const animationEvent = new AnimationEvent(this, properties.style.animationName, ANIMATION_EVENT_TYPE.START);
            this.state.eventHandler(new CardEvent(this, CARD_EVENT_TYPES.ANIMATION,animationEvent));
        }
    }
}   