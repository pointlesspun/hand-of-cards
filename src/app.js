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
import { createCardsFromLibrary } from "./model/card-util.js";

import { FOLD_CARDS_POLICY, CardGameComponent } from "./view/card-game-component.js";

import { createCardGameModel } from "./app-card-model-factory.js";
import { DEFAULT_LIBRARY } from "./app-card-library.js";

import "./app-platform-configurations.js";
import "./app-card-rendering.js";
import "./app-animations.js";
import { CardGameController } from "./view/card-game-controller.js";
import { ButtonPanelComponent } from "./view/button-panel-component.js";

const version = "0.52";

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
    playerCount: 2,
    maxSelectedCards,
    selectionCyclePolicy,
    initialCardCount: 0,
    cardsInDeck: shuffleArray(createCardsFromLibrary(DEFAULT_LIBRARY)),
});

// allocate space in the css sheet for all the card animations
allocAnimations([CardGameComponent.ANIMATIONS.playCard.name, CardGameComponent.ANIMATIONS.drawCard.name], maxCards);

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

const toast = React.createElement(ToastComponent, {
    key: "toast-component",
    initialMessages,
});

const carouselsRef = React.createRef();
const carouselsElement = React.createElement(CardGameComponent, {
    key: "hand-of-cards-container",
    ref: carouselsRef,
    model,
    initialCardCount,
    foldCardsPolicy,
    initialIndex: Math.floor(model.getMaxCards(0).length / 2),
    isLocked: element.attributes?.isLocked?.value === "true" ?? false,
});

const buttonPanelRef = React.createRef();
const buttonPanelElement = React.createElement(ButtonPanelComponent, {
    key: "cards-button-panel",
    ref: buttonPanelRef,
    isLocked: element.attributes?.isLocked?.value === "true" ?? false,
    playButtonEnabled: false,
    drawButtonEnabled: false,
});

// render the main components, starting the application
ReactDOM.render(
    React.createElement(React.StrictMode, {}, [
        toast,
        carouselsElement, 
        buttonPanelElement
    ]),
    element
);

const controller = new CardGameController(model, carouselsRef, buttonPanelRef);