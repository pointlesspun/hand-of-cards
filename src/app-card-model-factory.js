"use strict";

import { CardGameModel, MAX_SELECTION_REACHED_POLICY } from "./model/card-game-model.js";
import { DEFAULT_LIBRARY } from "./app-card-library.js";
import { pickRandomCards } from "./model/card-util.js";
import { Deck } from "./model/deck.js";
import { Hand } from "./model/hand.js";
import { Player } from "./model/player.js";
import { ModelEventProxy } from "./model/model-event-proxy.js";

/**
 * @typedef {Object} CardModelFactoryParameters 
 * @property {number} [playerCount=1]
 * @property {[CardDefinition]} [library=DEFAULT_LIBRARY] the set of all card definitions available to the players
 * @property {number} [cardCount=52] max cards in a deck
 * @property {number} [maxCards=7] max cards in a hand
 * @property {number} [maxSelectedCards=3] max cards that can be selected at the same time
 * @property {number} [initialCardCount=-1] how many cards should the player start with, if set to -1 it will be set to maxCards
 * @property {String} [selectionCyclePolicy=MAX_SELECTION_REACHED_POLICY.CYCLE_OLDEST] what to do when the player has 
 * selected max cards and then selects another (see MAX_SELECTION_REACHED_POLICY).
 */

/**
 * Create a cardGameModel with the given parameters.
 * 
 * @param {CardModelFactoryParameters} parameters used to create a game model
 * @returns {ModelEventProxy}
 */
export function createCardGameModel({
    playerCount = 1,
    library = DEFAULT_LIBRARY,
    cardCount = 52,
    cardsInDeck = null,
    maxCards = 7,
    maxSelectedCards = 3,
    initialCardCount = -1,
    selectionCyclePolicy = MAX_SELECTION_REACHED_POLICY.CYCLE_OLDEST,
} = {}) {
    const players = [];
    const handSize = initialCardCount < 0 ? maxCards : initialCardCount;
    const focusIndex = handSize > 0 ? Math.floor(maxCards / 2) : -1;

    for (let i = 0; i < playerCount; i++) {
        players.push(
            new Player(
                `plr${i}`,
                i,
                library,
                new Deck(cardsInDeck ?? pickRandomCards(library, cardCount)),
                new Deck([]),
                new Hand(
                    pickRandomCards(DEFAULT_LIBRARY, handSize),
                    focusIndex,
                    maxCards,
                    maxSelectedCards
                )
            )
        );
    }

    return new ModelEventProxy(players, 0, selectionCyclePolicy);
}
