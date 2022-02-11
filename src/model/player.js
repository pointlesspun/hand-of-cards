
'use strict';

export class Player {

    constructor(name, index, cardLibrary, deck, hand) {
        this.index = index;
        this.name = name;
        this.cardLibrary = cardLibrary;
        this.deck = deck;
        this.hand = hand;
    }

    clone = ({index, name, cardLibrary, deck, hand} = {}) => 
        new Player(
            index === undefined ? this.index : index,
            name ?? this.name,
            cardLibrary ?? this.cardLibrary,
            deck ?? this.deck,
            hand ?? this.hand
        );

    next( modifier ) {
        return modifier(this.clone());
    }
}