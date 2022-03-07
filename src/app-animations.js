"use strict";

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


import { updateKeyframes, createAnimationId } from "./framework/animation-utilities.js";
import { CardGameComponent } from "./view/card-game-component.js";

/**
 * Create a custom play card animation. Starts at the current element position, goes slightly down
 * for a bounce then jumps up.
 *
 * @param {number} idx
 * @returns
 */
 CardGameComponent.ANIMATIONS.playCard.createAnimationStyle = function({ idx, config, targetTransform } = {}) {
    const transform1 = targetTransform.clone();
    const transform2 = targetTransform.clone();
    const style = {};

    transform1.translation.y += 30 + Math.random() * 15;
    transform1.scale.x += 0.09;
    transform1.scale.y -= 0.09;
    transform2.translation.y -= config.settings.getPlayAnimationY() * config.settings.getCardSize().height;
    transform2.rotation.y = 180;

    const text = `
        0% {transform: ${targetTransform.toCss()}; }
        15% {transform: ${transform1.toCss()}; }
        40% {transform: ${transform2.toCss()}; }
        70% {transform: ${transform2.toCss()}; }
        100% {transform: ${CardGameComponent.ANIMATIONS.playCard.endTransform.toCss()}; }
    `;

    updateKeyframes(CardGameComponent.ANIMATIONS.playCard.name, idx, text);

    const animationId = createAnimationId(CardGameComponent.ANIMATIONS.playCard.name, idx);

    style.animationName = animationId;
    style.animationDuration = `${Math.random() * 0.2 + 0.7}s`;
    style.animationDelay = `${Math.random() * 0.1}s`;

    // maintain the last frame of the animation
    style.animationFillMode = "forwards";
    style.WebkitAnimationFillMode = "forwards";
    style.transform = targetTransform.toCss();
    style.transformStyle = "preserve-3d";

    return style;
}

CardGameComponent.ANIMATIONS.drawCard.createAnimationStyle = function({ idx, config, targetTransform } = {}) {
    const transform0 = CardGameComponent.ANIMATIONS.drawCard.startTransform;
    const transform1 = targetTransform.clone();
    const transform3 = targetTransform.clone();
    const style = {};

    transform1.translation.y -= config.settings.getPlayAnimationY() * config.settings.getCardSize().height;
    transform1.rotation.y = 180;

    const transform2 = transform1.clone();
    transform2.rotation.y = 0;

    transform3.translation.y += 30 + Math.random() * 15;
    transform3.scale.x += 0.09;
    transform3.scale.y -= 0.09;

    // sadly opacity doesn't work
    // see https://dev.to/skymax/backface-visibility-doesn-t-work-when-used-together-with-an-animation-11hf
    const text = `
        0% {transform: ${transform0.toCss()}}
        20% {transform: ${transform1.toCss()}}
        30% {transform: ${transform1.toCss()}}
        50% {transform: ${transform2.toCss()}}
        60% {transform: ${transform2.toCss()}}
        80% {transform: ${transform3.toCss()}}
        100% {transform: ${targetTransform.toCss()}
    `;

    updateKeyframes(CardGameComponent.ANIMATIONS.drawCard.name, idx, text);

    const animationId = createAnimationId(CardGameComponent.ANIMATIONS.drawCard.name, idx);

    style.animationName = animationId;
    style.animationDuration = `${Math.random() * 0.2 + 0.8}s`;
    style.animationDelay = `${Math.random() * 0.1}s`;

    // set the initial transform to be off screen otherwise we will have one frame
    // where the card is in the hand
    style.transform = transform0.toCss();
    style.transformStyle = "preserve-3d";

    // maintain the last frame of the animation
    style.animationFillMode = "forwards";
    style.WebkitAnimationFillMode = "forwards";

    return style;
}
