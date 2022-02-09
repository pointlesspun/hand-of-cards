'use strict';

export class Hand {
    constructor(cards, focusIdx, maxCards, maxSelectedCards, selectionCyclePolicy) {        
        this.cards = cards;
        this.focusIdx = focusIdx === undefined ? Math.floor(cards.length / 2) : focusIdx;
        this.maxCards = maxCards;
        this.maxSelectedCards = maxSelectedCards;
        this.selectionCyclePolicy = selectionCyclePolicy;
    }

    clone = ({cards, focusIdx, maxCards, maxSelectedCards, selectionCyclePolicy} = {}) => 
        new Hand(
            cards ?? this.cards, 
            focusIdx === undefined ? this.focusIdx : focusIdx, 
            maxCards === undefined ? this.maxCards : maxCards, 
            maxSelectedCards === undefined ? this.maxSelectedCards : maxSelectedCards, 
            selectionCyclePolicy === undefined ? this.selectionCyclePolicy : selectionCyclePolicy);
}