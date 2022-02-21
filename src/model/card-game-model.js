"use strict";

import { countInArray, partitionArray } from "../framework/arrays.js";
import { contract } from "../framework/contract.js";
import { pickRandomCards } from "./card-util.js";
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

/**
 * Main model capturing all information regarding a multiplayer card game.
 */
export class CardGameModel {
    constructor(players, maxCardsPolicy = MAX_SELECTION_REACHED_POLICY.BLOCK) {
        /**
         * Players participating in this game
         * @type {[Player]}
         * @public
         */
        this.players = players;

        this.players.forEach((player, index) => (player.index = index));

        /**
         * Describes what the model should do when the maximum number of selected cards have been
         * reached.
         * @type {string}
         * @public
         */
        this.maxCardsReachedPolicy = maxCardsPolicy;
    }

    /**
     * Sets the maximum number of cards the player can select.
     *
     * @param {number} playerIndex
     * @param {number} max
     */
    setMaxSelectedCards(playerIndex, max) {
        contract.isInRange(playerIndex, 0, this.players.length);
        this.players[playerIndex].setMaxSelectedCards(max);
    }

    /**
     * Returns the maximum number of cards a player can select
     * @param {number} playerIndex
     * @returns {number}
     */
    getMaxSelectedCards = (playerIndex) => {
        contract.isInRange(playerIndex, 0, this.players.length);
        this.players[playerIndex].getMaxSelectedCards();
    }

    /**
     * Returns the maximum number of cards the player can have in hand.
     *
     * @param {number} playerIndex
     * @returns {number}
     */
    getMaxCards = (playerIndex) => {
        contract.isInRange(playerIndex, 0, this.players.length);
        return this.players[playerIndex].getMaxCards();
    }

    /**
     * Sets the model's card selection cycle policy (see MAX_SELECTION_REACHED_POLICY).
     *
     * @param {MAX_SELECTION_REACHED_POLICY} policy
     */
    setMaxSelectionCyclePolicy(policy) {
        this.maxCardsReachedPolicy = policy;
    }

    /**
     * Gets the model's card selection cycle policy.
     *
     * @returns {string}
     */
    getMaxSelectionCyclePolicy = () => this.maxCardsReachedPolicy;

    /**
     * Returns the number of players in this game.
     * @returns {number}
     */
    getPlayerCount = () => this.players.length;

    /**
     * Returns what card the given player is focused on
     * @param {number} playerIndex
     * @returns {number}
     */
    getFocusIndex = (playerIndex) => {
        contract.isInRange(playerIndex, 0, this.players.length);
        return this.players[playerIndex].getFocusIndex();
    };

    /**
     * Sets the card the player is currently focusing on
     * @param {number} playerIndex id of the player
     * @param {focusIdx} playerIndex index of the card
     */
    setFocusIndex(playerIndex, focusIdx) {
        contract.isNumber(focusIdx, "CardGameModel.setFocusIndex: focusIdx is not a number.");
        contract.isInRange(playerIndex, 0, this.players.length);

        this.players[playerIndex].setFocusIndex(focusIdx);
    }

    /**
     * Returns the player with the given index
     * @param {number} playerIndex player index
     * @returns {Player}
     */
    getPlayer = (playerIndex) => {
        contract.isInRange(playerIndex, 0, this.players.length);
        return this.players[playerIndex];
    }

    /**
     * Returns the cards belonging to the given player
     * @param {number} playerIndex
     * @returns {[Card]}
     */
    getCards = (playerIndex) => {
        contract.isInRange(playerIndex, 0, this.players.length);
        return this.players[playerIndex].getCards();
    }

    /**
     * Checks if the given player has any cards
     * @param {number} playerIndex
     * @returns {boolean}
     */
    hasCards = (playerIndex) => {
        contract.isInRange(playerIndex, 0, this.players.length);
        return this.players[playerIndex].getCards()?.length > 0;
    }

    /**
     * Sets the cards of the given player
     * @param {number} playerIndex
     * @param {[Card]} cards
     * @param {number} focusIndex
     */
    setCards(playerIndex, cards, focusIndex) {
        contract.isArray(cards, "CardGameModel.setCards: cards is not an array.");
        contract.isInRange(playerIndex, 0, this.players.length);

        this.players[playerIndex].setCards(cards, focusIndex);
    }

    /**
     * Returns the library of cards available to the player with the given index.
     * @param {number} playerIndex
     * @returns {[CardDefinition]} cardLibrary an array of card definitions available to the player.
     */
    getLibrary = (playerIndex) => {
        contract.isInRange(playerIndex, 0, this.players.length);

        return this.players[playerIndex].getLibrary();
    };

    /**
     * Checks if the player can select more cards or if the cycle policy is such that
     * the player can always select more cards
     * @param {number} playerIndex
     * @returns {boolean}
     */
    canPlayerSelectMoreCards = (playerIndex) => {
        contract.isInRange(playerIndex, 0, this.players.length);

        return this.players[playerIndex].canSelectMoreCards() ||
        this.maxCardsReachedPolicy === MAX_SELECTION_REACHED_POLICY.CYCLE_OLDEST;
    }

    /**
     * Remove all cards marked as selected
     * @param {number} playerIndex the index of the player to remove the cards from
     * @returns {[Card]} an array of all cards removed (may be empty).
     */
    removeSelectedCards(playerIndex) {
        contract.isInRange(playerIndex, 0, this.players.length);

        const selected = "selected";
        const deselected = "deselected";
        const cards = this.getCards(playerIndex);
        const partition = partitionArray(cards, (card) => (card.isSelected ? selected : deselected));

        const deselectedCards = partition[deselected];

        // are there any cards left ?
        if (deselectedCards === undefined) {
            this.setCards(playerIndex, [], -1);
            return partition[selected];
        }
        // is the hand still the same ?
        else if (deselectedCards.length !== cards.length) {
            // hand has changed
            const currentFocus = this.getFocusIndex(playerIndex);
            const cardCountInFrontOfFocus = countInArray(partition[selected], (card) => card.getIndex() < currentFocus);

            this.setCards(
                playerIndex,
                deselectedCards,
                Math.clamp(currentFocus - cardCountInFrontOfFocus, 0, deselected.length)
            );

            return partition[selected];
        }

        return [];
    }

    /**
     * Count the number of cards selected in the hand of the player with the given index
     * @param {number} playerIndex id of the player
     * @param {number} [maxIndex=-1] count cards up until maxIndex
     * @returns {number}
     */
    countSelectedCards = (playerIndex, maxIndex = -1) => {
        contract.isInRange(playerIndex, 0, this.players.length);

        return countInArray(this.getCards(playerIndex), (card) => card.isCardSelected(), maxIndex);
    };

    /**
     * Draw a number of random cards and add them to the hand of the player with the given index
     * @param {number} playerIndex id of the player
     * @param {number} [cardCount] number of cards to draw, if undefined cards until the hand is full
     * @returns {[Card]} the cards drawn or null when no cards can be drawn
     */
    drawRandomCards(playerIndex, cardCount) {
        contract.isInRange(playerIndex, 0, this.players.length);

        const newCardCount =
            cardCount === undefined ? this.getMaxCards(playerIndex) - this.getCards(playerIndex).length : cardCount;

        if (newCardCount > 0) {
            const newCards = pickRandomCards(this.getLibrary(0), newCardCount);

            this.players[playerIndex].addCards(newCards);

            return newCards;
        }

        return null;
    }

    /**
     * Checks if the card with the cardIndex of the given playerIndex is selected.
     *
     * @param {number} playerIndex
     * @param {number} cardIndex
     * @returns {boolean} true the card is selected, false otherwise.
     */
    isCardSelected = (playerIndex, cardIndex) => {
        contract.isNumber(cardIndex, "CardGameModel.isCardSelected: cardIndex is not defined.");
        contract.isInRange(playerIndex, 0, this.players.length);

        return this.players[playerIndex].isCardSelected(cardIndex);
    };

    /**
     *
     * @param {number} playerIndex which player's card is going to be selected
     * @param {number} cardIndex which card index selection state is going to be changed
     * @param {boolean} isSelected new selection state
     * @returns {[Card]|null} returns an array of all the cards affected by this method (can be empty) or null if no new
     * selection could be made (max selection reached)
     */
    updateCardSelection(playerIndex, cardIndex, isSelected) {
        contract.isNumber(cardIndex, "CardGameModel.updateCardSelection: cardIndex is not a number.");
        contract.isBoolean(isSelected, "CardGameModel.updateCardSelection: isSelected is not a boolean.");
        contract.isInRange(playerIndex, 0, this.players.length);

        const player = this.players[playerIndex];
        const card = player.getCard(cardIndex);

        // is there a state change ?
        if (card.isSelected !== isSelected) {
            // Trying to deselect a card or can still select more cards ?
            if (!isSelected || player.canSelectMoreCards()) {
                player.setCardSelected(cardIndex, isSelected);
                return [card];
                // Trying to select a card but the max selected card limit is reached. If the maxCardsReachedPolicy
                // is CYCLE_OLDEST, deselect the card which was selected first then select the current card.
            } else if (isSelected && this.maxCardsReachedPolicy === MAX_SELECTION_REACHED_POLICY.CYCLE_OLDEST) {
                const firstSelectedCard = player.getFirstSelectedCard();

                firstSelectedCard.setSelected(false);
                player.setCardSelected(cardIndex, isSelected);
                return [firstSelectedCard, card];
            }

            // cannot select anything
            return null;
        }

        // nothing changed
        return [];
    }

}
