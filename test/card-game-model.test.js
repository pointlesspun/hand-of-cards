import { expect, test } from "@jest/globals";
import { CardGameModel } from "../src/model/card-game-model.js";
import { DEFAULT_LIBRARY } from "../src/model/card-library.js";
import { createCardGameModel } from "../src/model/card-model-factory.js";
import { pickRandomCards } from "../src/model/card-util.js";
import { Card } from "../src/model/card.js";
import { Deck } from "../src/model/deck.js";
import { Hand } from "../src/model/hand.js";
import { Player } from "../src/model/player.js";

test("Test default CardGameModel constructor with no players.", () => {
    const model = new CardGameModel([]);
    expect(model.getPlayerCount()).toBe(0);
});

test("Test CardGameModel with one player.", () => {
    const model = new CardGameModel([new Player()]);
    expect(model.getPlayerCount()).toBe(1);
    expect(model.getPlayer(0).index === 0);
});

test("Test Deck.constructor.", () => {
    const count = 8;
    const deck = new Deck(pickRandomCards(DEFAULT_LIBRARY, count));
        
    expect(deck.cards.length).toBe(count);

    deck.cards.forEach( card => {
        expect(card).toBeDefined();
        expect(card instanceof Card);
    });
});

test("Test createCardGameModel with the default parameters .", () => {
    const model = createCardGameModel();
    expect(model.getPlayerCount()).toBe(1);
    expect(model.getPlayer(0).index === 0);
    expect(model.getPlayer(0).name === "plr1");
    expect(model.getPlayer(0).deck.cards.length === 52);
    expect(model.getPlayer(0).hand.length === 7);
    expect(model.getPlayer(0).hand.focusIdx === 3);    
});