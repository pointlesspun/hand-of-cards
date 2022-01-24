'use strict';

/*
 * Utility functions to build a deck of cards based on the sprite atlas in ../data.
 */

import { Size } from "./size.js";
import { CardDefinition } from "./card-definition.js";
import { SpriteAtlas } from "./sprite-atlas.js";

// There's a limitation on some handheld devices like phones in what image size they will load
// so the atlas is cut in two parts
const ATLAS_1_TO_6 = new SpriteAtlas('./data/Atlasnye-playing-cards-1-to-6.png', new Size(-32, -32), new Size(-(390), -(568)));
const ATLAS_7_TO_K = new SpriteAtlas('./data/Atlasnye-playing-cards-7-to-K.png', new Size(-32, -32), new Size(-(390), -(568)));

export const CARD_COLOR_NAMES = ["Hearts", "Diamonds", "Clovers", "Spades"];

const generateDeck = (names, maxCardsPerName, atlas) => {
    let result = [];

    for (let i = 0; i < names.length; i++) {
        for (let j = 0; j < maxCardsPerName; j++) {
            result.push(new CardDefinition(`{${names[i]}}-${j+1}`, atlas, i, j));
        }    
    }

    return result;
}

export const pickRandomCards = (deck, count) => {
    let result = [];

    for (let i = 0; i < count; i++) {
        result.push(deck[Math.floor(Math.random() * deck.length)]);
    }

    return result;
} 

export const DEFAULT_DECK = [
    ...generateDeck(CARD_COLOR_NAMES, 6, ATLAS_1_TO_6),
    ...generateDeck(CARD_COLOR_NAMES, 7, ATLAS_7_TO_K),
]
