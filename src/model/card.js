'use strict';

export class Card {
    constructor(index, definition, hasFocus = false, isSelected = false, animation = null) {
      this.index = index;
      this.isSelected = isSelected;
      this.hasFocus = hasFocus;
      this.definition = definition;
      this.animation = animation;
    }
  }
  