"use strict";

/**
 * Main application which configures a HandOfCardsComponent and renders the component.
 */

import { MediaConfiguration } from "./framework/media-configuration.js";
import { allocAnimations } from "./framework/animation-utilities.js";

import { DEFAULT_LIBRARY } from "./model/card-library.js";
import { pickRandomCardDefinitions, pickRandomCards } from "./model/card-util.js";
import { CardGameModel } from "./model/card-game-model.js";
import { Player } from "./model/player.js";
import { Deck } from "./model/deck.js";
import { Hand } from "./model/hand.js";

import { FOLD_CARDS_POLICY, CardGameComponent, MAX_SELECTION_REACHED_POLICY } from "./card-game/card-game-component.js";

import { PLATFORM_CONFIGURATIONS } from "./platform-configurations.js";
import { ANIMATIONS } from "./animations.js";
import { ToastComponent } from "./framework/toast-component.js";

const version = '0.451';

console.log(`starting card component ${version}`);

const element = document.querySelector("#card-container");
const maxCards = element.attributes?.maxCards?.value ? parseInt(element.attributes.maxCards.value) : 7;
const maxSelectedCards = element.attributes?.maxSelectedCards?.value ?? -1;
const hand = pickRandomCardDefinitions(DEFAULT_LIBRARY, maxCards);
const maxCardsReachedPolicy = element.attributes?.maxCardsReachedPolicy?.value ?? MAX_SELECTION_REACHED_POLICY.BLOCK;
const foldCardsPolicy = element.attributes?.foldCardsPolicy?.value ?? FOLD_CARDS_POLICY.AFTER_ANIMATION;

const model = new CardGameModel([
    new Player(
        "plr1",
        0,
        DEFAULT_LIBRARY,
        new Deck(pickRandomCards(DEFAULT_LIBRARY, 52)),
        new Hand(
            pickRandomCards(DEFAULT_LIBRARY, maxCards),
            Math.floor(maxCards / 2),
            maxCards,
            maxSelectedCards,
            maxCardsReachedPolicy
        )
    ),
]);

const properties = {
    key: "hand-of-cards-container",
    model,
    hand,
    maxCards,
    maxCardsReachedPolicy,
    foldCardsPolicy,
    deck: DEFAULT_LIBRARY,
    initialIndex: Math.floor(hand.length / 2),
    isLocked: element.attributes?.isLocked?.value === "true" ?? false,
    maxSelectedCards,
    getLayoutConfiguration: (elementRef) => new MediaConfiguration(elementRef, PLATFORM_CONFIGURATIONS),
};

allocAnimations([ANIMATIONS.playCard.name, ANIMATIONS.drawCard.name], maxCards);

ReactDOM.render(
    React.createElement(React.StrictMode, {}, [
        React.createElement(ToastComponent, {
            key: "toast-component",
            initialMessages: [`<h2><u>Hand of cards, version ${version}</u></h2>`],
        }),
        React.createElement(CardGameComponent, properties),
    ]),
    element
);
