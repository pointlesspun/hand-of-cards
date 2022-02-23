"use strict";

import { contract } from "../framework/contract.js";
import { CardDefinition } from "./card-definition.js";
import { pickRandomCards } from "./card-util.js";
import { Deck } from "./deck.js";
import { Hand } from "./hand.js";

export const DECK_NAME = {
    /**
     * Contains all card definitions available to a player
     */
    LIBRARY: "library",

    /**
     * Contains a subset of cards available to a player.
     */
    DECK: "deck",

    /**
     * Contains all the cards this player discarded.
     */
    DISCARD_PILE: "discard pile",
};

export class Player {
    /**
     *
     * @param {String} name name of the player
     * @param {number} index id of the player in the context of a game model
     * @param {[CardDefinition]} cardLibrary an array of card definitions
     * @param {Deck} deck the deck to draw cards from
     * @param {Deck} discardPile the deck to discard cards to
     * @param {Hand} hand the cards currently in the hand of the player
     */
    constructor(name = "plr", index = -1, cardLibrary = [], deck = null, discardPile = null, hand = null) {
        this.index = index;
        this.name = name;
        this.cardLibrary = cardLibrary;
        /**
         * @type {Deck}
         * @public
         */
        this.deck = deck;

        /**
         * @type {Deck}
         * @public
         */
        this.discardPile = discardPile;

        /**
         * @type {Hand}
         * @public
         */
        this.hand = hand;
    }

    getDeck = () => this.deck;

    getDiscardPile = () => this.discardPile;

    getLibrary = () => this.cardLibrary;

    canSelectMoreCards = () => this.hand.canSelectMoreCards();

    getCards = () => this.hand.cards;

    setCards(cards, focusIndex) {
        this.hand.setCards(cards, focusIndex);
    }

    addCards(cards) {
        this.hand.addCards(cards);
    }

    /**
     * Returns the card at the given index
     * @param {number} idx
     * @returns {Card}
     */
    getCard = (idx) => this.hand.cards[idx];

    isCardSelected = (idx) => this.hand.cards[idx].isCardSelected();

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

    setMaxSelectedCards(max) {
        this.hand.setMaxSelectedCards(max);
    }

    getMaxSelectedCards = () => this.hand.getMaxSelectedCards();

    getMaxCards = () => this.hand.getMaxCards();

    /**
     * Draw random cards and put them in the hand of the players
     * 
     * @param {number} cardCount 
     * @param {string} drawPile 
     * @returns {[Card]|null}
     */
    drawRandomCards(cardCount, drawPile = DECK_NAME.LIBRARY) {
        contract.isString(drawPile);

        const newCardCount =
            cardCount === undefined ? this.getMaxCards() - this.getCards().length : cardCount;

        if (newCardCount > 0) {
            const newCards = this.getCardsFrom(newCardCount, drawPile);
            this.addCards(newCards);
            return newCards;
        }

        return null;
    }

    /**
     * Gets cards from the given pile and updates the contents of that pile.
     * 
     * @param {number} cardCount number of cards to get
     * @param {string} drawPile name of the pile (see DECK_NAME) 
     * @returns [Card] may be empty if the given drawPile does not contain enough cards
     */
    getCardsFrom(cardCount, drawPile) {
        contract.isNumber(cardCount);
        contract.isString(drawPile);
        
        switch (drawPile) {
            case DECK_NAME.LIBRARY:
                return pickRandomCards(this.getLibrary(0), cardCount);
            case DECK_NAME.DISCARD_PILE: 
                return this.discardPile ? this.discardPile.drawCards(0, cardCount) : [];
            case DECK_NAME.DECK: 
                return this.deck ? this.deck.drawCards(0, cardCount) : [];
        }

        throw new Error(`Trying to obtain cards from unknown pile ${drawPile}.`);
    }      
}
