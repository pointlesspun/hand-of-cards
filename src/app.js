'use strict';

/**
 * Main application which configures a HandOfCardsComponent and renders the component.
 */

import { MediaConfiguration} from "./framework/media-configuration.js";
import { allocAnimations } from "./framework/animation-utilities.js";

import { FOLD_CARDS_POLICY, HandComponent, MAX_SELECTION_REACHED_POLICY } from "./card-game/hand-component.js";
import { DEFAULT_DECK, pickRandomCards } from "./card-game/deck.js";

import { PLATFORM_CONFIGURATIONS } from "./platform-configurations.js";
import { ANIMATIONS } from "./animations.js";
import { ToastComponent } from "./card-game/toast-component.js";

console.log("starting card component 0.45");

const element = document.querySelector('#card-container');
const maxCards = element.attributes?.maxCards?.value ? parseInt(element.attributes.maxCards.value) : 7;
const hand = pickRandomCards(DEFAULT_DECK, maxCards);
const maxCardsReachedPolicy = element.attributes?.maxCardsReachedPolicy?.value ?? MAX_SELECTION_REACHED_POLICY.BLOCK;
const foldCardsPolicy = element.attributes?.foldCardsPolicy?.value ?? FOLD_CARDS_POLICY.AFTER_ANIMATION;

const properties = {
    key: "hand-of-cards-container",
    hand,
    maxCards,
    maxCardsReachedPolicy,
    foldCardsPolicy, 
    deck: DEFAULT_DECK,
    initialIndex: Math.floor(hand.length / 2),   
    isLocked: element.attributes?.isLocked?.value === "true" ?? false,
    maxSelectedCards: element.attributes?.maxSelectedCards?.value ?? -1,
    getLayoutConfiguration: (elementRef) => new MediaConfiguration(elementRef,PLATFORM_CONFIGURATIONS)            
};

allocAnimations([ANIMATIONS.playCard.name,ANIMATIONS.drawCard.name], maxCards);


ReactDOM.render(
    React.createElement(React.StrictMode, {}, [
        React.createElement(ToastComponent, {key: "toast-component", initialMessages: ["<h2><u>Hand of cards, version 0.45</u></h2>" ]}),
        React.createElement(HandComponent, properties),
    ]), element);