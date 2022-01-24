'use strict';

/*
 * Implements a card and its tranformation given its position and state in the hand.
 */

import { Transform } from "./transform.js";
import { ELEMENT_TYPES } from "./element-types.js";
import { PlatformConfiguration } from "./media-configuration.js";
import { CardDefinition } from "./card-definition.js";
import { ANIMATION_EVENT_TYPE, AnimationEvent } from "./animation-utilities.js";
import { Vector3 } from "./vector3.js";

// number of pixels of movement allowed before a tap becomes a swipe
const TAP_THRESHOLD = 10;

/** Prefix to generate React cards */
export const CARD_KEY_PREFIX = "hoc-card";

/**
 * Implements the logic, state and element creation of a single card.
 */
export class Card {
    /**
     * 
     * @param {*} key a unique React key
     * @param {CardDefinition} definition containing immutable properties (graphics, name) of the card 
     * @param {number} index index of the card in the hand
     * @param {boolean} isSelected indicates if the card is selected by the player
     */
    constructor(key, definition, index, isSelected, animationCallback, tapCallback) {
        this.key = key;
        this.definition = definition;
        this.index = index;
        this.isSelected = isSelected;
        this.animation = "";
        this.activeAnimation = "";
        this.animationCallback = animationCallback;
        this.tappedCallback = tapCallback;
    }
    
    /**
     * Creates React Element for this card
     * 
     * @param {PlatformConfiguration} config contains the settings relevant to the current media/device 
     * @param {number} cardCount represents to the total number of cards in hand
     * @param {number} activeIndex index of the card the player is currently looking at
     * @param {number} centerCardIndex index of the card which is the center of the hand
     * @returns {react.element}
     */
    createElement(config,  cardCount, activeIndex, centerCardIndex) {

        if (this.index < 0) {
            return React.createElement(ELEMENT_TYPES.DIV, {key: this.key, visibility: "collapse", className: "card-item"});    
        }

        const isActive = this.index === activeIndex;
        const transform = this.calculateTransform(config, cardCount, activeIndex, centerCardIndex);

        const properties = {
            key: this.key,
            id: this.key,
            className : this.createClassName(isActive),
            style : {
                width : config.values.cardWidth + "px",
                height : config.values.cardHeight + "px",
                transformOrigin: "center bottom",
                transform:  transform ? transform.toCss({}) : "",
                background: this.definition.atlas.toCss(this.definition.row, this.definition.column),
            } ,
            onAnimationEnd: () => { 
                if(this.animationCallback) {
                    this.animationCallback(new AnimationEvent(this, this.activeAnimation, ANIMATION_EVENT_TYPE.END));
                } 

                this.activeAnimation = null;
                this.animation = null;               
            },
            onTouchStart: (evt) => this.handleTouch(evt),
            onTouchEnd: (evt) => this.handleTouch(evt)
        };
        
        if (this.animation) {
            properties.style = {
                ...properties.style,
                ...this.playAnimation(this.animation, config, transform)
            }; 

            this.activeAnimation = properties.style.animationName;

            if (this.animationCallback) {
                this.animationCallback(new AnimationEvent(this, this.activeAnimation, ANIMATION_EVENT_TYPE.START));
            }
        }

        // color overlay giving the card some shadow depending on its state
        const overlay = React.createElement(ELEMENT_TYPES.DIV, { className : `card-overlay${isActive ? "-active" : ""}`});

        return React.createElement(ELEMENT_TYPES.DIV, properties, overlay);
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
    calculateTransform(config, cardCount, activeIndex, centerCardIndex) {
        
        // short hand reference
        const values = config.values;

        // size of the div containing these cards
        const parentHeight = config.clientSize.height * values.innerHeight;

        // is the current card active (the one in the center which the user is working with) ?
        const isActive = this.index === activeIndex;

        // center of the parent x axis
        const parentCenterX = config.clientSize.width / 2;

        // how far is this card from the center cards ?
        const deltaCenterIdx = this.index - centerCardIndex;

        const maxDeltaIdx = Math.abs(deltaCenterIdx) / cardCount;

        // try to scale down items further away from the center somewhat more
        const itemScale = values.baseScale + values.dynamicScale * (1-maxDeltaIdx);

        // if the item is selected raise the y position
        const itemSelectedOffset = this.isSelected ? values.ySelectedOffset : 0;
        
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

            if (this.isSelected) {
                className += " card-item-selected";
            }
        }

        return className;
    }

    playAnimation(animation, config, targetTransform) {        

        
        return animation.createAnimation({
            idx: this.index,
            config,
            targetTransform
        });
    }

    handleTouch(evt) {
        // wait for the animations to finish
        if (evt.type === 'touchstart') {
            this.touchStart = new Vector3(evt.changedTouches[0].clientX, evt.changedTouches[0].clientY);
            } else {
            const delta = new Vector3(evt.changedTouches[0].clientX  - this.touchStart.x, evt.changedTouches[0].clientY - this.touchStart.y);
            
            if (delta.length() < TAP_THRESHOLD && this.tappedCallback) {
                // tap happened
                this.tappedCallback(this);      
            }
        }
      }  
}
