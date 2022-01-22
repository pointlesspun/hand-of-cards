'use strict';

/**
 * Main application which configures a HandOfCardsComponent and renders the component.
 */

import { MediaConfiguration} from "./media-configuration.js";
import { HandOfCardsComponent } from "./hand-of-cards-component.js";
import { PLATFORM_CONFIGURATIONS } from "./platform-configurations.js";
import { Size } from "./mathx.js";
import {CardDefinition} from "./card.js";

console.log("starting card component");


// There's a limitation on some handheld devices like phones in what image size they will load
// so the atlas is cut in two parts
const ATLAS_1_TO_6 = {
    url: './data/Atlasnye-playing-cards-1-to-6.png',
    spriteGridOffset: new Size(-32, -32),
    spriteGrid: new Size(-(390), -(600-32))
}

const ATLAS_7_TO_K = {
    url: './data/Atlasnye-playing-cards-7-to-K.png',
    spriteGridOffset: new Size(-32, -32),
    spriteGrid: new Size(-(390), -(600-32))
}


const CARD_COLOR_NAMES = ["Hearts", "Diamonds", "Clovers", "Spades"];

const generateDeck = (names, maxCardsPerName, atlas) => {
    let result = [];

    for (let i = 0; i < names.length; i++) {
        for (let j = 0; j < maxCardsPerName; j++) {
            result.push(new CardDefinition(`{${names[i]}}-${j+1}`, atlas, i, j));
        }    
    }

    return result;
}

const pickRandomCards = (deck, count) => {
    let result = [];

    for (let i = 0; i < count; i++) {
        result.push(deck[Math.floor(Math.random() * deck.length)]);
    }

    return result;
} 

const DEFAULT_DECK = [
    ...generateDeck(CARD_COLOR_NAMES, 6, ATLAS_1_TO_6),
    ...generateDeck(CARD_COLOR_NAMES, 7, ATLAS_7_TO_K),
]

const properties = {
    initialItems : pickRandomCards(DEFAULT_DECK, 7),
    initialIndex: 0,   
    getLayoutConfiguration: (elementRef) => new MediaConfiguration(elementRef,PLATFORM_CONFIGURATIONS)            
};

ReactDOM.render(React.createElement(HandOfCardsComponent, properties), document.querySelector('#card-container'));