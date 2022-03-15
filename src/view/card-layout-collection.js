"use strict";

import { Size } from "../framework/size.js";
import { CardLayout } from "./card-layout.js";

/**
 * Class acting as an interface to layout consumers (ie cards). Objects of this class contain
 * one or more cardlayouts and when requested for a transform for a card, this class will provide
 * the most applicable one.
 */
export class CardLayoutCollection {
    /**
     * Create a collection fronting for all the given layouts
     * @param {[CardLayout]} layouts
     * @param {number} initialCardCount are the number of cards the initial layout will be chosen for
     */
    constructor(layouts, initialCardCount = 5) {
        /**
         * @type {[CardLayout]}
         */
        this.layouts = layouts;

        /**
         * @type {CardLayout}
         */
        this.selectedLayout = null;

        /**
         * For how many cards is the current layout selected/
         * @type {number}
         */

        this.cardCount = -1;

        this.selectLayout(initialCardCount);
    }

    /**
     *
     * @returns {Size} the card size for the currently selected layout.
     */
    getCardSize = () => this.selectedLayout.cardSize;

    /**
     *
     * @returns {number} the getPlayAnimationY for the currently selected layout.
     */
    getPlayAnimationY = () => this.selectedLayout.playAnimationY;

    /**
     * 
     * @returns {number} the innerHeight for the currently selected layout.
     */
    getInnerHeight = () => this.selectedLayout.innerHeight;

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
    calculateTransform(clientSize, cardCount, index, focusIndex, centerCardIndex, isSelected, isPlayerActive) {
        if (cardCount !== this.cardCount) {
            this.selectLayout(cardCount);
        }

        return this.selectedLayout.calculateTransform(
            clientSize,
            cardCount,
            index,
            focusIndex,
            centerCardIndex,
            isSelected,
            isPlayerActive
        );
    }

    /**
     * Select a layout appropriate for the given cardcount
     * @private
     * @param {number} cardCount
     */
    selectLayout(cardCount) {
        if (cardCount !== this.cardCount) {
            this.selectedLayout = null;

            for (let i = 0; i < this.layouts.length; i++) {
                const layout = this.layouts[i];

                if (layout.maxCardCount < 0 || cardCount <= layout.maxCardCount) {
                    if (this.selectedLayout === null || this.isMoreSpecific(layout, this.selectedLayout)) {
                        this.selectedLayout = layout;
                    }
                }
            }

            this.cardCount = cardCount;
        }
    }

    /**
     *
     * @private
     * @param {CardLayout} layoutA
     * @param {CardLayout} layoutB
     * @returns {boolean} true A is more specific than B, false otherwise
     */

    isMoreSpecific(layoutA, layoutB) {
        return layoutA.maxCardCount > 0 && layoutA.maxCardCount < layoutB.maxCardCount;
    }
}
