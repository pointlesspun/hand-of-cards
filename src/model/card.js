"use strict";

export class Card {
    constructor(index, definition, hasFocus = false, isSelected = false) {
        this.index = index;
        this.isSelected = isSelected;
        this.hasFocus = hasFocus;
        this.definition = definition;
        this.lastSelectionChange = Date.now();
    }

    clone = ({ index, definition, hasFocus, isSelected } = {}) =>
        new Card(
            index === undefined ? this.index : index,
            definition ?? this.definition,
            hasFocus === undefined ? this.hasFocus : hasFocus,
            isSelected === undefined ? this.isSelected : isSelected
        );

    setSelected(isSelected) {
        this.isSelected = isSelected;
        this.lastSelectionChange = Date.now();   
    }

    isCardSelected = () => this.isSelected;

    setHasFocus(hasFocus) {
        this.hasFocus = hasFocus;
    }

    hasCardFocus = () => this.hasFocus;

    getIndex = () => this.index;

    setIndex(idx) {
        this.index = idx;
    }
}
