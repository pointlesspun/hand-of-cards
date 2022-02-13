"use strict";

export const CAROUSEL_EVENT_NAME = "card-carousel-event";

export const CARD_CAROUSEL_EVENT_TYPES = {
    // focus on a certain card
    FOCUS: "focus",

    // hover over a card
    HOVER: "hover",

    // select a given card
    SELECT: "select",

    // focusses and selects a given card
    FOCUS_AND_SELECT: "focus-and-select",

    // deselect a given card
    DESELECT: "deselect",

    // remove the selected cards
    REMOVE_SELECTED_CARDS: "remove",

    // draw more cards
    DRAW_CARDS: "draw",

    // play the selected cards
    PLAY_SELECTED_CARDS: "play",

    // animation for draw or play has completed
    ANIMATION_COMPLETE: "animation-complete",
};

export class CardCarouselDetails {
    constructor(type, parameters) {
        this.type = type;
        this.parameters = parameters;
    }
}
