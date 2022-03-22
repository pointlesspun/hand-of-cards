"use strict";

import { InvariantEventSource } from "../framework/invariant-event-source.js";
import { CardGameModel, MAX_SELECTION_REACHED_POLICY } from "./card-game-model.js";
import { DECK_NAME } from "./player.js";

/**
 * @class
 */
export class ModelEventProxy extends CardGameModel {

    static EVENT_ID = {
        ACTIVE_PLAYER : 0,
        FOCUS_INDEX: 1,
        CARDS_SET: 2,
        CARDS_REMOVED: 3,
        CARDS_DRAWN: 4,
        DISCARD_PILE_SHUFFLED: 5
    };

    /**
     * @type {CardGameModel}
     */
    model = null;

    /**
     * @type {InvariantEventSource}
     */
    #eventSource = new InvariantEventSource();

    constructor(players, activePlayer = 0, maxCardsPolicy = MAX_SELECTION_REACHED_POLICY.BLOCK) {
        super(players, activePlayer, maxCardsPolicy);
    }

    hasListener = (listener) => this.#eventSource.hasListener(listener);

    addEventListener(listener) {
        this.#eventSource.addEventListener(listener);
    }

    removeEventListener(listener) {
        this.#eventSource.removeEventListener(listener);
    }

    setActivePlayer(playerIndex) {
        super.setActivePlayer(playerIndex);
        this.#eventSource.notifyListeners(ModelEventProxy.EVENT_ID.ACTIVE_PLAYER, this, {
            playerIndex
        });
    }

    setFocusIndex(playerIndex, focusIndex) {
        super.setFocusIndex(playerIndex, focusIndex);
        this.#eventSource.notifyListeners(ModelEventProxy.EVENT_ID.FOCUS_INDEX, this, {
            playerIndex,
            focusIndex
        });
    }

    setCards(playerIndex, cards, focusIndex) {
        super.setCards(playerIndex, cards, focusIndex);
        this.#eventSource.notifyListeners(ModelEventProxy.EVENT_ID.CARDS_SET, this, {
            playerIndex,
            cards,
            focusIndex
        });
    }

    removeSelectedCards(playerIndex, destinationPile = DECK_NAME.LIBRARY) {
        const cards = super.removeSelectedCards(playerIndex, destinationPile);
        this.#eventSource.notifyListeners(ModelEventProxy.EVENT_ID.CARDS_REMOVED, this, {
            playerIndex,
            destinationPile,
            cards
        });
        return cards;
    }

    drawRandomCards(playerIndex, cardCount, drawpile = DECK_NAME.LIBRARY) {
        const cards = super.drawRandomCards(playerIndex, cardCount, drawpile);
        this.#eventSource.notifyListeners(ModelEventProxy.EVENT_ID.CARDS_DRAWN, this, {
            playerIndex,
            cardCount,
            drawpile,
            cards
        });
        return cards;
    }

    shuffleDiscardPile(playerIndex) {
        super.shuffleDiscardPile(playerIndex);
        this.#eventSource.notifyListeners(ModelEventProxy.EVENT_ID.DISCARD_PILE_SHUFFLED, this, {
            playerIndex,
        });
    }

    updateCardSelection(playerIndex, cardIndex, isSelected) {
        const cards = super.updateCardSelection(playerIndex, cardIndex, isSelected);
        this.#eventSource.notifyListeners(ModelEventProxy.EVENT_ID.SELECTION_UPDATED, this, {
            playerIndex,
            cardIndex, 
            isSelected,
            cards
        });
        return cards;
    }
}

