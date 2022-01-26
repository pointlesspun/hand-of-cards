'use strict';

/**
 * Main application which configures a HandOfCardsComponent and renders the component.
 */

import { MediaConfiguration} from "./framework/media-configuration.js";
import { allocAnimations } from "./framework/animation-utilities.js";

import { HandComponent } from "./card-game/hand-component.js";
import { DEFAULT_DECK, pickRandomCards } from "./card-game/deck.js";


import { PLATFORM_CONFIGURATIONS } from "./platform-configurations.js";
import { ANIMATIONS } from "./animations.js";

console.log("starting card component");

const element = document.querySelector('#card-container');
const maxCards = element.attributes?.maxCards?.value ? parseInt(element.attributes.maxCards.value) : 7;
const hand = pickRandomCards(DEFAULT_DECK, maxCards);

const properties = {
    hand,
    maxCards,
    deck: DEFAULT_DECK,
    initialIndex: Math.floor(hand.length / 2),   
    isLocked: element.attributes?.isLocked?.value === "true" ?? false,
    maxSelectedCards: element.attributes?.maxSelectedCards?.value ?? -1,
    getLayoutConfiguration: (elementRef) => new MediaConfiguration(elementRef,PLATFORM_CONFIGURATIONS)            
};

allocAnimations([ANIMATIONS.playCard.name,ANIMATIONS.drawCard.name], maxCards);

ReactDOM.render(
    React.createElement(React.StrictMode, {}, React.createElement(HandComponent, properties)), element);