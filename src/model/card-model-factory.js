"use strict";

import { CardGameModel, MAX_SELECTION_REACHED_POLICY } from "./card-game-model";
import { DEFAULT_LIBRARY } from "./card-library.js";
import { pickRandomCards } from "./card-util.js";
import { Deck } from "./deck.js";
import { Hand } from "./hand.js";
import { Player } from "./player.js";

/**
 * @typedef {Object} CardModelFactoryParameters 
 * @property {number} [playerCount=1]
 * @property {[CardDefinition]} [library=DEFAULT_LIBRARY] the set of all card definitions available to the players
 * @property {number} [cardCount=52] max cards in a deck
 * @property {number} [maxCards=7] max cards in a hand
 * @property {number} [maxSelectedCards=3] max cards that can be selected at the same time
 * @property {String} [selectionCyclePolicy=MAX_SELECTION_REACHED_POLICY.CYCLE_OLDEST] what to do when the player has 
 * selected max cards and then selects another (see MAX_SELECTION_REACHED_POLICY).
 */

/**
 * Create a cardGameModel with the given parameters.
 * 
 * @param {CardModelFactoryParameters} parameters used to create a game model
 * @returns 
 */
export function createCardGameModel({
    playerCount = 1,
    library = DEFAULT_LIBRARY,
    cardCount = 52,
    maxCards = 7,
    maxSelectedCards = 3,
    selectionCyclePolicy = MAX_SELECTION_REACHED_POLICY.CYCLE_OLDEST,
} = {}) {
    const players = [];

    for (let i = 0; i < playerCount; i++) {
        players.push(
            new Player(
                `plr${i}`,
                i,
                library,
                new Deck(pickRandomCards(library, cardCount)),
                new Hand(
                    pickRandomCards(DEFAULT_LIBRARY, maxCards),
                    Math.floor(maxCards / 2),
                    maxCards,
                    maxSelectedCards
                )
            )
        );
    }

    return new CardGameModel(players, selectionCyclePolicy);
}
