"use strict";

import { contract } from "../framework/contract.js";
import "../framework/math-extensions.js";
import { Card } from "./card.js";

export class Hand {
    /**
     *
     * @param {[Card]} cards cards currently in this hand
     * @param {*} focusIdx
     * @param {*} maxCards
     * @param {*} maxSelectedCards
     */
    constructor(cards = [], focusIdx = 0, maxCards = -1, maxSelectedCards = -1) {
        this.cards = cards;
        this.focusIndex = focusIdx === undefined ? Math.floor(cards.length / 2) : focusIdx;
        this.maxCards = maxCards;
        this.maxSelectedCards = maxSelectedCards;

        if (focusIdx >= 0) {
            this.cards[focusIdx].setHasFocus(true);
        }
    }

    getMaxCards = () => this.maxCards;

    getFocusIndex = () => this.focusIndex;

    setFocusIndex(index) {
        contract.requires(index === -1 || (index >= 0 && index < this.cards.length));

        // check if the current focus is still in the hand
        if (this.focusIndex >= 0 && this.cards.length > this.focusIndex) {
            this.cards[this.focusIndex].setHasFocus(false);
        }

        if (this.cards.length > 0) {
            this.focusIndex = Math.clamp(index, 0, this.cards.length);
            this.cards[this.focusIndex].setHasFocus(true);
        } else {
            this.focusIndex = -1;
        }
    }

    canSelectMoreCards = () =>
        // any cards to select ?
        this.cards.length > 0 &&
        // if negative there is no limit
        (this.maxSelectedCards < 0 ||
            // can still select more cards ?
            this.countSelectedCards() < this.maxSelectedCards);

    /**
     * Count the number of cards that have been selected.
     * @returns {number} number of cards selected
     */
    countSelectedCards = () => {
        let result = 0;
        for (let i = 0; i < this.cards.length; ++i) {
            if (this.cards[i].isSelected) {
                result++;
            }
        }
        return result;
    };

    /**
     * Replaces the cards in the hand with the given cards and updates
     * the provided card's indices
     * @param {[Card]} cards
     */
    setCards(cards, focusIndex) {
        this.cards = cards;

        cards.forEach((card, idx) => card.setIndex(idx));

        if (focusIndex !== undefined) {
            this.setFocusIndex(focusIndex);
        }
    }

    addCards(cards) {
        const baseIdx = this.cards.length;
        const newFocusIndex = this.focusIndex >= 0 ? this.focusIndex : Math.floor(cards.length / 2);

        cards.forEach((card, idx) => {
            card.setIndex(idx + baseIdx);
            this.cards.push(card);
        });

        this.focusIndex = newFocusIndex;
    }

    getFirstSelectedCard = () =>
        this.cards
            .filter((card) => card.isCardSelected())
            .reduce((card, prev) => (prev.lastSelectionChange < card.lastSelectionChange ? prev : card));

    setMaxSelectedCards(max) {
        this.maxSelectedCards = max;
    }

    getMaxSelectedCards = () => this.maxSelectedCards;
}
