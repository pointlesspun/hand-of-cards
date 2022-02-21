"use strict";

/**
 * Main application which configures a HandOfCardsComponent and renders the component.
 */

import { MediaConfiguration } from "./framework/media-configuration.js";
import { allocAnimations } from "./framework/animation-utilities.js";

import { DEFAULT_LIBRARY } from "./model/card-library.js";
import { pickRandomCardDefinitions } from "./model/card-util.js";
import { MAX_SELECTION_REACHED_POLICY } from "./model/card-game-model.js";

import { FOLD_CARDS_POLICY, CardGameComponent } from "./card-game/card-game-component.js";

import { PLATFORM_CONFIGURATIONS } from "./platform-configurations.js";
import { ANIMATIONS } from "./animations.js";
import { ToastComponent } from "./framework/toast-component.js";
import { createCardGameModel } from "./model/card-model-factory.js";

const version = "0.452";

console.log(`starting card component ${version}`);

const element = document.querySelector("#card-container");
const maxCards = element.attributes?.maxCards?.value ? parseInt(element.attributes.maxCards.value) : 7;
const maxSelectedCards = element.attributes?.maxSelectedCards?.value ?? -1;
const hand = pickRandomCardDefinitions(DEFAULT_LIBRARY, maxCards);
const selectionCyclePolicy = element.attributes?.maxCardsReachedPolicy?.value ?? MAX_SELECTION_REACHED_POLICY.BLOCK;
const foldCardsPolicy = element.attributes?.foldCardsPolicy?.value ?? FOLD_CARDS_POLICY.AFTER_ANIMATION;

const properties = {
    key: "hand-of-cards-container",
    model: createCardGameModel({ maxSelectedCards, selectionCyclePolicy, cardCount: maxCards }),
    hand,
    maxCards,
    maxCardsReachedPolicy: selectionCyclePolicy,
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
