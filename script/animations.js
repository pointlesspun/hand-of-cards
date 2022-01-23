'use strict';

/*
 * Dynamic animations - ie animations that take the current state of the application in account - using CSS are a bit of PITA. CSS Animations are functional 
 * and easy to use when they use hard coded, unchanging values but when they have to take in account (for instance) the current position of
 * elements there is no easy way to get them to do comply (*). Hence this massive hack.
 * 
 * First, at the start of the application, we allocate N animations. N = animation types + number of elements using these animations. In the 
 * case of the cards there is currently only one animation: playing a card. The number of elements using this are the number of cards in
 * the hand. Each animations each has their own style element. 
 * 
 * Next when we know the parameters of the animation, we update the style element accordingly. 
 * 
 * (*) This assumes I'm not massively overlooking a more straightforward approach which is perfectly possible...
 */

import { ELEMENT_TYPES } from "./element-types.js";

/**
 * All the animations used in the application
 */
export const ANIMATIONS = {
    playCard: {
        name: "playCard",
        // function which creates a play card animation
        createAnimation: createPlayCardAnimation
    }
};

/**
 * Type of animation events
 */
export const ANIMATION_EVENT_TYPE = {
    START: "start",
    END: "end"
}

/**
 * Event emitted when an animation is started or stopped
 */
export class AnimationEvent {
    constructor( source, name, eventType) {
        this.source = source;
        this.name = name;
        this.type = eventType;
    }
}

/** Cached styles each containing an animation. */
const styles = {};

/**
 * For each animation (eg play card) and each element create a style in the head element
 * containing the animation specs.
 * 
 * @param {string[]} names 
 * @param {number} count 
 */
export function allocAnimations(names, count) {
    
    const head = document.getElementsByTagName('head')[0];

    for (let i = 0; i < count; i++) {
        
        for (let j = 0; j < names.length; j++) {
            let animationStyle = document.createElement(ELEMENT_TYPES.STYLE);
            animationStyle.id = createAnimationId(names[j], i);
            const keyFrameText = `@keyframes ${animationStyle.id} {}`;
            animationStyle.innerHTML = keyFrameText + "\n";
            styles[animationStyle.id] = animationStyle;
            head.appendChild(animationStyle);
        }
    }
}

/**
 * Update the keyframes for the animation with name 'name' and the element with index 'idx'.
 * @param {string} name 
 * @param {number}} idx 
 * @param {string} keyframeText 
 */
export function updateKeyframes(name, idx, keyframeText) {
    const animationId = createAnimationId(name, idx);
    const animationStyle = styles[animationId];
    animationStyle.innerHTML = `@keyframes ${animationId} {\n${keyframeText}\n}`;
}

export const createAnimationId = (name, idx) => `animations-${idx}-${name}`;

/**
 * Create a custom play card animation. Starts at the current element position, goes slightly down
 * for a bounce then jumps up.
 * 
 * @param {*} param0 
 * @returns 
 */
function createPlayCardAnimation({idx, cardHeight, transform0} = {}) {
    const transform1 = transform0.clone();
    const transform2 = transform0.clone();
    const style = {};

    transform1.translation.y += 30;
    transform1.scale.x += 0.1;
    transform1.scale.y -= 0.1;
    transform2.translation.y = -2 * cardHeight;

    const text = `
        0% {transform: ${transform0.toCss()}}
        15% {transform: ${transform1.toCss()}}
        100% {transform: ${transform2.toCss()}}
    `;

    updateKeyframes(ANIMATIONS.playCard.name, idx, text);      

    const animationId = createAnimationId(ANIMATIONS.playCard.name, idx); 

    style.animationName = animationId;
    style.animationDuration = `0.3s`;
    style.animationDelay = `${Math.random() * 0.2}s`;
    style.animationFillMode = 'forwards';
    style.WebkitAnimationFillMode = 'forwards';

    return style;
}