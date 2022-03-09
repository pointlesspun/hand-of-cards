"use strict";

import { Size } from "../framework/size.js";
import { Transform } from "../framework/transform.js";
import { Vector3 } from "../framework/vector3.js";


/**
 * Values defining how layout is applied to the cards in the hands of a player.
 * See CardLayout.calculateTransform for more details.
 */
export class CardLayout {

    /**
     * Layouts apply up to a certain number of cards (when this value is -1 there is no maximum)
     * above this value applying the layout may not be optimal for the screen space.
     */
    maxCardCount = -1; 

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
        maxCardCount = -1,
        innerHeight = 0.845,
        playAnimationY = 0.4,
        cardSize = new Size(360, 540),
        baseScale = 0.75,
        dynamicScale = 0.25,
        rotation = 4,
        xTranslation = 180,
        yTranslation = 4,
        yBaseOffset = 0,
        ySelectedOffset = -60,
        yActiveOffset = -82,
    } = {}) {
        this.maxCardCount = maxCardCount;
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

    /**
     * Calculates the transformation (translation, rotation, scale) of the card on screen
     * @public
     * @param {PlatformConfiguration} config contains the settings relevant to the current media/device
     * @param {number} cardCount represents to the total number of cards in hand
     * @param {number} focusIndex index of the card the player is currently looking at
     * @param {number} centerCardIndex index of the card which is the center of the hand
     * @param {boolean} isSelected indicates if the card is selected or not
     * @returns {Transform}
     */
    calculateTransform(clientSize, cardCount, index, focusIndex, centerCardIndex, isSelected) {
        // size of the div containing these cards
        const parentHeight = clientSize.height /** this.innerHeight*/;

        // is the current card active (the one in the center which the user is working with) ?
        const hasFocus = index === focusIndex;

        // center of the parent x axis
        const parentCenterX = clientSize.width / 2;

        // how far is this card from the center cards ?
        const deltaCenterIdx = index - centerCardIndex;

        const maxDeltaIdx = Math.abs(deltaCenterIdx) / cardCount;

        // try to scale down items further away from the center somewhat more
        const itemScale = this.baseScale + this.dynamicScale * (1 - maxDeltaIdx);

        // if the item is selected raise the y position
        const itemSelectedOffset = isSelected ? this.ySelectedOffset : 0;

        // if the item is active raise the y position
        const itemActiveOffset = hasFocus ? this.yActiveOffset : 0;

        // move the card to the bottom of the parent
        const yOffset = parentHeight - this.cardSize.height + this.yBaseOffset;

        // move the card further away, the further it is from the center card to produce a curved hand illusion
        const yOffsetWrtFocus = hasFocus
            ? 0
            : Math.abs(deltaCenterIdx) * Math.abs(deltaCenterIdx) * this.yTranslation;

        const cardCenterX = this.cardSize.width / 2;

        return new Transform(
            new Vector3(
                parentCenterX - cardCenterX + deltaCenterIdx * this.xTranslation,
                yOffset + itemSelectedOffset + itemActiveOffset + yOffsetWrtFocus,
                // make sure the cards closer to the center overlap cards further away
                hasFocus ? 200 : 100 - index
            ),
            new Vector3(itemScale, itemScale, itemScale),
            hasFocus ? new Vector3() : new Vector3(0, 0, this.rotation * deltaCenterIdx)
        );
    }
}
