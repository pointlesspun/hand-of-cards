"use strict";

import { countInArray, partitionArray } from "../framework/arrays.js";
import { contract } from "../framework/contract.js";
import { Card } from "./card.js";
import { Player } from "./player.js";

/**
 * What happens when the user selects a card when the max cards have been reached
 * @enum {string}
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

    setMaxSelectedCards(playerIndex, max) {
        this.players[playerIndex].setMaxSelectedCards(max);
    }

    getMaxSelectedCards = (playerIndex) => this.players[playerIndex].getMaxSelectedCards();

    /**
     * 
     * @param {MAX_SELECTION_REACHED_POLICY} policy 
     */
    setMaxSelectionCyclePolicy(policy) {
        this.maxCardsReachedPolicy = policy;
    }

    getMaxSelectionCyclePolicy = () => this.maxCardsReachedPolicy;

    getPlayerCount = () => this.players.length;

    /**
     * Returns what card the given player is focused on
     * @param {number} playerIdx 
     * @returns {number}
     */
    getFocusIndex = (playerIdx) => {
        contract.isDefined(playerIdx, "CardGameModel.getFocusIndex: playerIdx is not defined.");
        contract.requires(playerIdx >= 0 || playerIdx < this.players.length, `CardGameModel.getFocusIndex: player index (${playerIdx}) is not in range (0-${this.players.length}).`);

        return this.players[playerIdx].getFocusIndex();
    }

    /**
     * Sets the card the player is currently focusing on
     * @param {number} playerIdx id of the player
     * @param {focusIdx} playerIdx index of the card
     */
    setFocusIndex(playerIdx, focusIdx) {
        contract.isDefined(playerIdx, "CardGameModel.setFocusIndex: playerIdx is not defined.");
        contract.isDefined(focusIdx, "CardGameModel.setFocusIndex: focusIdx is not defined.");
        contract.requires(playerIdx >= 0 || playerIdx < this.players.length, `CardGameModel.setFocusIndex: player index (${playerIdx}) is not in range (0-${this.players.length}).`);

        this.players[playerIdx].setFocusIndex(focusIdx);
    }

    /**
     * 
     * @param {number} idx player index
     * @returns {Player}
     */
    getPlayer = (idx) => this.players[idx];

    getCards = (playerIdx) => this.players[playerIdx].getCards();

    hasCards = (playerIdx) => this.players[playerIdx].getCards()?.length > 0;

    setCards(playerIdx, cards, focusIndex) {
        contract.isDefined(playerIdx, "CardGameModel.setCards: playerIdx is not defined.");
        contract.isDefined(cards, "CardGameModel.setCards: cards is not defined.");
        
        contract.requires(playerIdx >= 0 || playerIdx < this.players.length, `CardGameModel.setCards: player index (${playerIdx}) is not in range (0-${this.players.length}).`);
        
        this.players[playerIdx].setCards(cards, focusIndex);
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
        contract.isDefined(playerIdx, "CardGameModel.removeSelectedCards: playerIdx is not defined.");

        const selected = "selected";
        const deselected = "deselected";
        const cards = this.getCards(playerIdx);
        const partition = partitionArray(cards, (card) => (card.isSelected ? selected : deselected));

        const deselectedCards = partition[deselected];

        // are there any cards left ?
        if (deselectedCards === undefined) {
            this.setCards(playerIdx, [], -1);
            return partition[selected];
        }
        // is the hand still the same ?
        else if (deselectedCards.length !== cards.length) {
            // hand has changed
            const currentFocus = this.getFocusIndex(playerIdx);
            const cardCountInFrontOfFocus = countInArray(partition[selected], (card) => card.getIndex() < currentFocus);
            
            this.setCards(playerIdx, deselectedCards, Math.clamp(currentFocus - cardCountInFrontOfFocus, 0, deselected.length));

            return partition[selected];
        }

        return [];
    }

    countSelectedCards = (playerIdx, maxIndex = -1) => {
        contract.isDefined(playerIdx, "CardGameModel.countSelectedCards: playerIdx is not defined.");
        
        return countInArray(this.getCards(playerIdx), (card) => card.isCardSelected(), maxIndex);
    }
    
    /**
     *
     * @param {number} playerIdx which player's card is going to be selected
     * @param {number} cardIdx which card index selection state is going to be changed
     * @param {boolean} isSelected new selection state
     * @returns {[Card]|null} returns an array of all the cards affected by this method (can be empty) or null if no new
     * selection could be made (max selection reached)
     */
    updateCardSelection(playerIdx, cardIdx, isSelected) {
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
