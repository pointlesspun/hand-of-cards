"use strict";

export class Card {
    constructor(index, definition, hasFocus = false, isSelected = false) {
        this.index = index;
        this.isSelected = isSelected;
        this.hasFocus = hasFocus;
        this.definition = definition;
        this.lastSelectionChange = Date.now();
    }

    setSelected(isSelected) {
        this.isSelected = isSelected;
        this.lastSelectionChange = Date.now();   
    }

    isCardSelected = () => this.isSelected;

    setHasFocus(hasFocus) {
        this.hasFocus = hasFocus;
    }

    hasCardFocus = () => this.hasFocus;

    /**
     * 
     * @returns {number}
     */
    getIndex = () => this.index;

    setIndex(idx) {
        this.index = idx;
    }

    toString() {
        return `${this.index}: ${this.definition.toString()}`;
    }
}
