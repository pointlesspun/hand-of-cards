
'use strict';

export class CardGameModel {

    constructor(players) {
        this.players = players;
    }      

    clone({players} = {}) {
        return new CardGameModel( players ?? this.players);
    }
}
