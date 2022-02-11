'use strict';

export class Card {
    constructor(index, definition, hasFocus = false, isSelected = false, animation = null) {
      this.index = index;
      this.isSelected = isSelected;
      this.hasFocus = hasFocus;
      this.definition = definition;
      this.animation = animation;
    }

    clone = ({
      index,
      definition,
      hasFocus,
      isSelected,
      animation,
    } = {}) =>
      new Card(
        index === undefined ? this.index : index,
        definition ?? this.definition,
        hasFocus === undefined ? this.hasFocus : hasFocus,
        isSelected === undefined ? this.isSelected : isSelected,
        animation ?? this.animation
        );

    next(modifier) {
      return modifier(this.clone());
    }
  }
  