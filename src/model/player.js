"use strict";

import { CardDefinition } from "./card-definition.js";
import { Deck } from "./deck.js";
import { Hand } from "./hand.js";

export class Player {

    /**
     * 
     * @param {String} name name of the player
     * @param {number} index id of the player in the context of a game model
     * @param {[CardDefinition]} cardLibrary an array of card definitions 
     * @param {Deck} deck the deck to draw cards from 
     * @param {Hand} hand the cards currently in the hand of the player 
     */
    constructor(name = "plr", index = -1, cardLibrary = [], deck = null, hand = null) {
        this.index = index;
        this.name = name;
        this.cardLibrary = cardLibrary;
        this.deck = deck;

        /**
         * @type {Hand}
         * @public
         */
        this.hand = hand;
    }

    clone = ({ index, name, cardLibrary, deck, hand } = {}) =>
        new Player(
            index === undefined ? this.index : index,
            name ?? this.name,
            cardLibrary ?? this.cardLibrary,
            deck ?? this.deck,
            hand ?? this.hand
        );

    canSelectMoreCards = () => this.hand.canSelectMoreCards();

    getCards = () => this.hand.cards;

    setCards(cards) {
        this.hand.setCards(cards);
    }

    /**
     * Returns the card at the given index
     * @param {number} idx
     * @returns {Card}
     */
    getCard = (idx) => this.hand.cards[idx];

    isCardSelected = (idx) => this.hand.cards[idx].isSelected();

    /**
     *
     * @param {number} idx CardIndex to change the selection state of
     * @param {boolean} isSelected new selection state
     */
    setCardSelected(idx, isSelected) {
        this.hand.cards[idx].setSelected(isSelected);
    }

    /**
     *
     * @returns {Card} the card in the hand which was selected first relative to
     * the other selected cards in the hand.
     */
    getFirstSelectedCard = () => this.hand.getFirstSelectedCard();

    countSelectedCards = () => this.hand.countSelectedCards();

    getFocusIndex = () => this.hand.getFocusIndex();

    setFocusIndex(idx) {
        this.hand.setFocusIndex(idx);
    }
}
