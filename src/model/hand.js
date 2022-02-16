"use strict";

import { Card } from "./card.js";

export class Hand {
    constructor(cards = [], focusIdx = 0, maxCards = -1, maxSelectedCards = -1) {
        this.cards = cards;
        this.focusIdx = focusIdx === undefined ? Math.floor(cards.length / 2) : focusIdx;
        this.maxCards = maxCards;
        this.maxSelectedCards = maxSelectedCards;
    }

    clone = ({ cards, focusIdx, maxCards, maxSelectedCards} = {}) =>
        new Hand(
            cards ?? this.cards,
            focusIdx === undefined ? this.focusIdx : focusIdx,
            maxCards === undefined ? this.maxCards : maxCards,
            maxSelectedCards === undefined ? this.maxSelectedCards : maxSelectedCards,
        );

    getFocusIndex = () => this.focusIdx;

    setFocusIndex(idx) {
        this.focusIdx = Math.clamp(idx, 0, this.cards.length);
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
    setCards(cards) {
        this.cards = cards;

        cards.forEach( (card, idx) => card.setIndex(idx));
    }

    getFirstSelectedCard = () =>
        this.cards
            .filter((card) => card.isSelected())
            .reduce((card, prev) => (prev.lastSelectionChange < card.lastSelectionChange ? prev : card));
}
