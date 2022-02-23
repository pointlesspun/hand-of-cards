'use strict';

import { CardDefinition } from "./card-definition.js";
import { Card } from "./card.js";

export const pickRandomCardDefinitions = (library, count) => {
    let result = [];

    for (let i = 0; i < count; i++) {
        result.push(library[Math.floor(Math.random() * library.length)]);
    }

    return result;
} 

/**
 * Creates cards based on a random definition.
 * @param {[CardDefinition]} library 
 * @param {number} count 
 * @returns [Card]
 */
export const pickRandomCards = (library, count) => 
    pickRandomCardDefinitions(library, count).map( (definition, idx) => new Card(idx, definition));
    
