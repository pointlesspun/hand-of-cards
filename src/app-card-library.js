'use strict';

/*
 * Utility functions to build a deck of cards based on the sprite atlas in ../data.
 */

import { CardDefinition } from "./model/card-definition.js";

// names of the card colors
export const CARD_COLOR_NAMES = ["Hearts", "Diamonds", "Clovers", "Spades"];

// names of the card values
export const CARD_VALUE_NAMES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"];

const generateLibrary = (colorNames, valueNames) => {
    let result = [];
    let id = 0;

    for (let i = 0; i < colorNames.length; i++) {
        for (let j = 0; j < valueNames.length; j++) {
            result.push(new CardDefinition(id, `${valueNames[j]}-${colorNames[i]}`));
            id++;
        }    
    }

    return result;
}

export const DEFAULT_LIBRARY = generateLibrary(CARD_COLOR_NAMES, CARD_VALUE_NAMES);