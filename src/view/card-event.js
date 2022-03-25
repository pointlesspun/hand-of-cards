export const CARD_EVENT_TYPES = {
    ANIMATION : "animation",
    TAP: "tapped",
    SWIPE: "swipe",
    // mouse enter 
    FOCUS: "focus",
    // mouse leave
    LOST_FOCUS: "lost focus"
}

export class CardEvent {
    constructor(card, type, parameters) {
        this.card = card;
        this.type = type;
        this.parameters = parameters;
    }
}
