'use strict';

export class Deck {

    constructor(cards = []) {
        this.cards = cards;
    }

    getLength = () => this.cards.length;

    drawCards(startIndex, count) {
        return this.cards.splice(startIndex, count);
    }

    addCards(cards) {
        this.cards = this.cards.concat(cards);
    }

    getCards = () => this.cards;

    clear() {
        this.cards = [];
    }
}