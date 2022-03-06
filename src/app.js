"use strict";

/*
 * Main application which configures a HandOfCardsComponent and renders the component.
 */

import "./framework/math-extensions.js";

import { shuffleArray } from "./framework/arrays.js";
import { detectBrowser } from "./framework/platform-configuration.js";
import { allocAnimations } from "./framework/animation-utilities.js";
import { ToastComponent, ToastMessage } from "./framework/toast-component.js";

import { MAX_SELECTION_REACHED_POLICY } from "./model/card-game-model.js";
import { createCardGameModel } from "./app-card-model-factory.js";
import { createCardsFromLibrary } from "./model/card-util.js";

import { FOLD_CARDS_POLICY, CardGameComponent } from "./card-game/card-game-component.js";

import { ANIMATIONS } from "./app-animations.js";
import { DEFAULT_LIBRARY } from "./app-card-library.js";

import "./app-platform-configurations.js";
import "./app-card-rendering.js";

const version = "0.511";

console.log(`starting card component ${version}`);

const element = document.querySelector("#card-container");

// parse all properties from the html declaration
const maxCards = element.attributes?.maxCards?.value ? parseInt(element.attributes.maxCards.value) : 7;
const maxSelectedCards = element.attributes?.maxSelectedCards?.value ?? -1;
const selectionCyclePolicy = element.attributes?.maxCardsReachedPolicy?.value ?? MAX_SELECTION_REACHED_POLICY.BLOCK;
const foldCardsPolicy = element.attributes?.foldCardsPolicy?.value ?? FOLD_CARDS_POLICY.AFTER_ANIMATION;
const initialCardCount = element.attributes?.initialCardCount?.value
    ? parseInt(element.attributes.initialCardCount.value)
    : maxCards;

// create the model used in the application
const model = createCardGameModel({
    maxSelectedCards,
    selectionCyclePolicy,
    initialCardCount: 0,
    cardsInDeck: shuffleArray(createCardsFromLibrary(DEFAULT_LIBRARY)),
});

// allocate space in the css sheet for all the card animations
allocAnimations([ANIMATIONS.playCard.name, ANIMATIONS.drawCard.name], maxCards);

// set up the initial toast messages showing up when the application starts
const initialMessages = [`<h2><u>Hand of cards, version ${version}</u></h2>`];

// firefox is having issues with transitions see readme.md
if (detectBrowser().isFirefox) {
    const text =
        '<i class="material-icons">warning</i><span style="color: rgb(180, 0, 0)"> ' +
        "The current implementation is having transition issues in Firefox. " +
        "Please consider using Chrome, Opera or Edge.</span>";
    initialMessages.push(new ToastMessage(text, 20.0));
}

// render the main components, starting the application
ReactDOM.render(
    React.createElement(React.StrictMode, {}, [
        React.createElement(ToastComponent, {
            key: "toast-component",
            initialMessages,
        }),
        React.createElement(CardGameComponent, {
            key: "hand-of-cards-container",
            model,
            initialCardCount,
            foldCardsPolicy,
            initialIndex: Math.floor(model.getMaxCards(0).length / 2),
            isLocked: element.attributes?.isLocked?.value === "true" ?? false,
        }),
    ]),
    element
);
