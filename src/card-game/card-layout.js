"use strict";

import { Size } from "../framework/size.js";

/**
 * Values defining how layout is applied to the cards in the hands of a player.
 * See also CardCarouselComponent.calculateTransform.
 */
export class CardLayout {
    /**
     * Card container referred to as inner takes up % of the client height
     * @type {number}
     */
    innerHeight = 0;

    /**
     * Offset of the play card animation relative to card height.
     * @type {number}
     */
    playAnimationY = 0;

    /**
     * Size in pixels of the cards
     * @type {Size}
     */
    cardSize = null;

    /**
     * Base scale (both x and y) applied to the cards.
     * @type {number}
     */
    baseScale = 0;

    /**
     * Scale applied (both x and y) applied to the cards as they are positioned further
     * away from the focus. Cards become smaller as they are further away from the focused card.
     * @type {number}
     */
    dynamicScale = 0;

    /**
     * Rotation in degrees applied to cards relative to the transform origin.
     * Cards get rotated more as they are further away from the focused card.
     * @type {number}
     */
    rotation = 0;

    /**
     * Translate cards this amount relative to their distance to the
     * focused card (over the x axis).
     * @type {number}
     */
    xTranslation = 0;

    /**
     * Translate cards this amount relative to their distance to the
     * focused card (over the y axis).
     * @type {number}
     */
    yTranslation = 0;

    /**
     * Base y offset of a card relative to the bottom of the card container
     * (in addition of the card's height).
     * @type {number}
     */
    yBaseOffset = 0;

    /**
     * Y offset when a card is selected (ie a card is slight raised).
     * @type {number}
     */
    ySelectedOffset = 0;

    /**
     * Y offset when a card has focus.
     * @type {number}
     */
    yActiveOffset = 0;

    constructor({
        innerHeight = 0.845,
        playAnimationY = 0.4,
        cardSize = new Size(360, 540),
        baseScale = 0.75,
        dynamicScale = 0.25,
        rotation = 4,
        xTranslation = 180,
        yTranslation = 4,
        yBaseOffset = 80,
        ySelectedOffset = -60,
        yActiveOffset = -82,
    } = {}) {
        this.innerHeight = innerHeight;
        this.playAnimationY = playAnimationY;
        this.cardSize = cardSize;
        this.baseScale = baseScale;
        this.dynamicScale = dynamicScale;
        this.rotation = rotation;
        this.xTranslation = xTranslation;
        this.yTranslation = yTranslation;
        this.yBaseOffset = yBaseOffset;
        this.ySelectedOffset = ySelectedOffset;
        this.yActiveOffset = yActiveOffset;
    }
}
