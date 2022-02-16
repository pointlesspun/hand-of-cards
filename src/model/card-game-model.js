"use strict";

import { countInArray, partitionArray } from "../framework/array.js";
import { Card } from "./card.js";
import { Player } from "./player.js";

/**
 * What happens when the user selects a card when the max cards have been reached
 */
 export const MAX_SELECTION_REACHED_POLICY = {
    /** prevent the user from selecting more cards (default) */
    BLOCK: "block",

    /** de-select the card selected first, then select the current card */
    CYCLE_OLDEST: "cycle-oldest",
};
export class CardGameModel {
    constructor(players, maxCardsPolicy = MAX_SELECTION_REACHED_POLICY.BLOCK) {
        /**
         * Players participating in this game
         * @type {[Player]}
         * @public
         */
        this.players = players;

        this.players.forEach( (player, index) => player.index = index);

        /**
         * Describes what the model should do when the maximum number of selected cards have been
         * reached.
         * @type {string}
         * @public
         */
        this.maxCardsReachedPolicy = maxCardsPolicy;
    }

    clone({ players } = {}) {
        return new CardGameModel(players ?? this.players);
    }

    getPlayerCount = () => this.players.length;

    getFocusIndex = (playerIdx) => this.players[playerIdx].hand.getFocusIndex();

    setFocusIndex(playerIdx, focusIdx) {
        this.players[playerIdx].hand.setFocusIndex(focusIdx);
    }

    /**
     *
     * @param {number} idx player index
     * @returns {Player}
     */
    getPlayer = (idx) => this.players[idx];

    getCards = (playerIdx) => this.players[playerIdx].getCards();

    hasCards = (playerIdx) => this.players[playerIdx].getCards()?.length > 0;

    setCards(playerIdx, cards) {
        this.players[playerIdx].setCards(cards);
    }

    canPlayerSelectMoreCards = (playerIdx) =>
        this.players[playerIdx].canSelectMoreCards() ||
        this.maxCardsReachedPolicy === MAX_SELECTION_REACHED_POLICY.CYCLE_OLDEST;

    /**
     * 
     * @param {number} playerIdx the index of the player to remove the cards from
     * @returns {[Card]} an array of all cards removed (may be empty).
     */
    removeSelectedCards(playerIdx) {
        const selected = "selected";
        const deselected = "deselected";
        const cards = this.getCards(playerIdx);
        const partition = partitionArray(cards, (card) => (card.isSelected ? selected : deselected));

        const deselectedCards = partition[deselected];

        // is the hand still the same ?
        if (deselectedCards.length !== cards.length) {
            // hand has changed
            const currentFocus = this.getFocusIndex(playerIdx);
            const cardCountInFrontOfFocus = countInArray(partion[selected], (card) => card.getIndex() < currentFocus);
            
            this.setCards(playerIdx, deselectedCards);
            this.players[playerIdx].setFocusIndex(currentFocus - cardCountInFrontOfFocus);
        }

        return partition[selected];
    }

    countSelectedCards = (playerIdx, maxIndex = -1) => 
        countInArray(this.getCards(playerIdx), (card) => card.isSelected(), maxIndex);
    

    /**
     *
     * @param {number} playerIdx which player's card is going to be selected
     * @param {number} cardIdx which card index selection state is going to be changed
     * @param {boolean} isSelected new selection state
     * @returns {[Card]|null} returns an array of all the cards affected by this method (can be empty) or null if no new
     * selection could be made (max selection reached)
     */
    setCardSelected(playerIdx, cardIdx, isSelected) {
        const player = this.players[playerIdx];
        const card = player.getCard(cardIdx);

        // is there a state change ?
        if (card.isSelected !== isSelected) {
            // Trying to deselect a card or can still select more cards ?
            if (!isSelected || player.canSelectMoreCards()) {
                player.setCardSelected(cardIdx, isSelected);
                return [card];
                // Trying to select a card but the max selected card limit is reached. If the maxCardsReachedPolicy
                // is CYCLE_OLDEST, deselect the card which was selected first then select the current card.
            } else if (isSelected && this.maxCardsReachedPolicy === MAX_SELECTION_REACHED_POLICY.CYCLE_OLDEST) {
                const firstSelectedCard = player.getFirstSelectedCard();

                firstSelectedCard.setSelected(false);
                player.setCardSelected(cardIdx, isSelected);
                return [firstSelectedCard, card];
            }

            // cannot select anything
            return null;
        }

        // nothing changed
        return [];
    }
}
