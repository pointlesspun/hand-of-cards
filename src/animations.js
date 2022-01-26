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

import { Transform } from "./framework/transform.js";
import { Vector3 } from "./framework/vector3.js";
import { updateKeyframes, createAnimationId } from "./framework/animation-utilities.js";

/**
 * All the animations used in the application
 */
export const ANIMATIONS = {
    playCard: {
        name: "playCard",
        // function which creates a play card animation
        createAnimation: createPlayCardAnimation
    },
    drawCard: {
        name: "drawCard",
        // function which creates a draw card animation
        createAnimation: createDrawCardAnimation
    }
};

/**
 * Create a custom play card animation. Starts at the current element position, goes slightly down
 * for a bounce then jumps up.
 * 
 * @param {*} param0 
 * @returns 
 */
function createPlayCardAnimation({idx, config, targetTransform} = {}) {
    const transform1 = targetTransform.clone();
    const transform2 = targetTransform.clone();
    const style = {};

    transform1.translation.y += 30 + Math.random() * 15;
    transform1.scale.x += 0.1;
    transform1.scale.y -= 0.1;
    transform2.translation.y = -2 * config.values.cardHeight;

    const text = `
        0% {transform: ${targetTransform.toCss()}}
        15% {transform: ${transform1.toCss()}}
        100% {transform: ${transform2.toCss()}}
    `;

    updateKeyframes(ANIMATIONS.playCard.name, idx, text);      

    const animationId = createAnimationId(ANIMATIONS.playCard.name, idx); 

    style.animationName = animationId;
    style.animationDuration = `${Math.random() * 0.2 + 0.2}s`;
    style.animationDelay = `${Math.random() * 0.3}s`;

    // maintain the last frame of the animation
    style.animationFillMode = 'forwards';
    style.WebkitAnimationFillMode = 'forwards';
    style.transform = targetTransform.toCss();

    return style;
}

function createDrawCardAnimation({idx, config, targetTransform} = {}) {
    const transform0 = new Transform(new Vector3(-2000, -19), new Vector3(1,1), -90);
    const transform1 = targetTransform.clone();
    const transform2 = targetTransform.clone();
    const style = {};

    transform1.translation.x += 155;
    transform1.translation.y = config.clientSize.height * 0.1;
    transform1.scale.x -= 0.2;
    transform1.scale.y += 0.2;
    transform1.rotation = 45;

    transform2.translation.x = targetTransform.translation.x;
    transform2.translation.y = transform1.translation.y;
    
    const text = `
        0% {transform: ${transform0.toCss()}}
        35% {transform: ${transform1.toCss()}}
        55% {transform: ${transform2.toCss()}}
        75% {transform: ${transform2.toCss()}}
        100% {transform: ${targetTransform.toCss()}}
    `;

    updateKeyframes(ANIMATIONS.drawCard.name, idx, text);      

    const animationId = createAnimationId(ANIMATIONS.drawCard.name, idx); 

    style.animationName = animationId;
    style.animationDuration = `${Math.random() * 0.2 + 0.7}s`;
    style.animationDelay = `${Math.random() * 0.3}s`;
    
    // set the initial transform to be off screen otherwise we will have one frame
    // where the card is in the hand
    style.transform = transform0.toCss();

    // maintain the last frame of the animation
    style.animationFillMode = 'forwards';
    style.WebkitAnimationFillMode = 'forwards';

    return style;
}