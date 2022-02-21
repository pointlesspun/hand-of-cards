"use strict";

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
        this.focusIdx = focusIdx === undefined ? Math.floor(cards.length / 2) : focusIdx;
        this.maxCards = maxCards;
        this.maxSelectedCards = maxSelectedCards;

        this.cards[focusIdx].setHasFocus(true);
    }

    clone = ({ cards, focusIdx, maxCards, maxSelectedCards} = {}) =>
        new Hand(
            cards ?? this.cards,
            focusIdx === undefined ? this.focusIdx : focusIdx,
            maxCards === undefined ? this.maxCards : maxCards,
            maxSelectedCards === undefined ? this.maxSelectedCards : maxSelectedCards,
        );

    getMaxCards = () => this.maxCards;

    getFocusIndex = () => this.focusIdx;

    setFocusIndex(idx) {
        // check if the current focus is still in the hand
        if (this.focusIdx >= 0 && this.cards.length > this.focusIdx) {
            this.cards[this.focusIdx].setHasFocus(false);    
        }

        if (this.cards.length > 0) {
            this.focusIdx = Math.clamp(idx, 0, this.cards.length);
            this.cards[this.focusIdx].setHasFocus(true);    
        } else {
            this.focusIdx = -1;
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

        cards.forEach( (card, idx) => card.setIndex(idx));

        if (focusIndex !== undefined) {
            this.setFocusIndex(focusIndex);
        }
    }

    addCards(cards) {
        cards.forEach( (card, idx) => {
            card.setIndex(idx + this.cards.length);
            this.cards.push(card);
        });
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
