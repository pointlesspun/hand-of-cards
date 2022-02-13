"use strict";

export class Hand {
  constructor(
    cards,
    focusIdx,
    maxCards,
    maxSelectedCards,
    selectionCyclePolicy
  ) {
    this.cards = cards;
    this.focusIdx =
      focusIdx === undefined ? Math.floor(cards.length / 2) : focusIdx;
    this.maxCards = maxCards;
    this.maxSelectedCards = maxSelectedCards;
    this.selectionCyclePolicy = selectionCyclePolicy;
  }

  clone = ({
    cards,
    focusIdx,
    maxCards,
    maxSelectedCards,
    selectionCyclePolicy,
  } = {}) =>
    new Hand(
      cards ?? this.cards,
      focusIdx === undefined ? this.focusIdx : focusIdx,
      maxCards === undefined ? this.maxCards : maxCards,
      maxSelectedCards === undefined ? this.maxSelectedCards : maxSelectedCards,
      selectionCyclePolicy === undefined
        ? this.selectionCyclePolicy
        : selectionCyclePolicy
    );

  canSelectMoreCards = () =>
    // any cards to select ?
    this.cards.length > 0 &&
    // if negative there is no limit
    (this.maxSelectedCards < 0 ||
      // can still select more cards ?
      this.countSelectedCards() < this.maxSelectedCards);

  /**
   * Count the number of cards that have been selected.
   * @returns {number} number of cards selected
   */
  countSelectedCards = () => {
    let result = 0;
    for (let i = 0; i < this.cards.length; ++i) {
      if (this.cards[i].isSelected) {
        result++;
      }
    }
    return result;
  }
}
