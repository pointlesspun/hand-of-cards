import { expect, test } from "@jest/globals";
import { CardGameModel, MAX_SELECTION_REACHED_POLICY } from "../src/model/card-game-model.js";
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

test("Test createCardGameModel with the default parameters.", () => {
    const model = createCardGameModel();
    expect(model.getPlayerCount()).toBe(1);
    expect(model.getPlayer(0).index === 0);
    expect(model.getPlayer(0).name === "plr1");
    expect(model.getPlayer(0).deck.cards.length === 52);
    expect(model.getPlayer(0).hand.length === 7);
    expect(model.getPlayer(0).hand.focusIdx === 3);    
});

test("Test count selected cards with initial model.", () => {
    const model = createCardGameModel();
    
    expect(model.countSelectedCards(0)).toBe(0);    
});

test("Select & test count selected cards with initial model.", () => {
    const model = createCardGameModel();
    
    model.updateCardSelection(0, 0, true);
    expect(model.countSelectedCards(0)).toBe(1);    

    model.updateCardSelection(0, 6, true);
    expect(model.countSelectedCards(0)).toBe(2);    

    model.updateCardSelection(0, 6, false);
    expect(model.countSelectedCards(0)).toBe(1);    

    model.updateCardSelection(0, 2, false);
    expect(model.countSelectedCards(0)).toBe(1);    

    model.updateCardSelection(0, 0, false);
    expect(model.countSelectedCards(0)).toBe(0);    
});

test("Test focus index using the default model.", () => {
    const model = createCardGameModel();

    expect(model.getFocusIndex(0)).toBeGreaterThan(-1);
    expect(model.getFocusIndex(0)).toBeLessThan(model.getCards(0).length);

    const focusedCard = model.getCards(0)[model.getFocusIndex(0)];
    expect(focusedCard.hasCardFocus()).toBe(true);

    model.setFocusIndex(0, 0);

    expect(model.getCards(0)[model.getFocusIndex(0)].hasCardFocus()).toBe(true);
    expect(focusedCard.hasCardFocus()).toBe(false);
});

test("Remove selected cards with no cards selected.", () => {
    const model = createCardGameModel();
    const selectedCardCount = model.countSelectedCards(0);
    const cardCount = model.getCards(0).length;

    expect(selectedCardCount).toBe(0);

    const removedCards = model.removeSelectedCards(0);

    expect(removedCards).toEqual([]);

    expect(model.getCards(0).length).toBe(cardCount);
});

test("Remove selected cards with cards selected ahead of the focus index.", () => {
    const model = createCardGameModel();
    
    model.setFocusIndex(0, 3);
    
    expect(model.getFocusIndex(0)).toBe(3);

    model.updateCardSelection(0, 0, true);
    model.updateCardSelection(0, 1, true);
    
    const selectedCardCount = model.countSelectedCards(0);
    
    expect(selectedCardCount).toBe(2);

    const cardCount = model.getCards(0).length;

    const removedCards = model.removeSelectedCards(0);

    expect(removedCards.length).toEqual(2);
    expect(removedCards[0].getIndex()).toBe(0);
    expect(removedCards[1].getIndex()).toBe(1);

    expect(model.getFocusIndex(0)).toBe(1);
    expect(model.getCards(0).length).toBe(cardCount - 2);
});

test("Remove selected cards with cards selected after of the focus index.", () => {
    const model = createCardGameModel();
    
    model.setFocusIndex(0, 3);
    
    expect(model.getFocusIndex(0)).toBe(3);

    model.updateCardSelection(0, 4, true);
    model.updateCardSelection(0, 5, true);
    
    const selectedCardCount = model.countSelectedCards(0);
    
    expect(selectedCardCount).toBe(2);

    const cardCount = model.getCards(0).length;

    const removedCards = model.removeSelectedCards(0);

    expect(removedCards.length).toEqual(2);
    expect(removedCards[0].getIndex()).toBe(4);
    expect(removedCards[1].getIndex()).toBe(5);

    expect(model.getFocusIndex(0)).toBe(3);
    expect(model.getCards(0).length).toBe(cardCount - 2);
});

test("Remove selected cards with cards selected being the focus index.", () => {
    const model = createCardGameModel();
    
    model.setFocusIndex(0, 3);
    
    expect(model.getFocusIndex(0)).toBe(3);

    model.updateCardSelection(0, 3, true);
        
    const selectedCardCount = model.countSelectedCards(0);
    
    expect(selectedCardCount).toBe(1);

    const cardCount = model.getCards(0).length;

    const removedCards = model.removeSelectedCards(0);

    expect(removedCards.length).toEqual(1);
    expect(removedCards[0].getIndex()).toBe(3);

    expect(model.getFocusIndex(0)).toBe(3);
    expect(model.getCards(0).length).toBe(cardCount - 1);
});

test("Remove selected cards with cards selected being the focus index and focus being the last element.", () => {
    const model = createCardGameModel();
    const cardCount = model.getCards(0).length;
    
    model.setFocusIndex(0, cardCount- 1);
    
    expect(model.getFocusIndex(0)).toBe(cardCount - 1);

    model.updateCardSelection(0, cardCount - 1, true);
        
    const selectedCardCount = model.countSelectedCards(0);
    
    expect(selectedCardCount).toBe(1);

    const removedCards = model.removeSelectedCards(0);

    expect(removedCards.length).toEqual(1);
    expect(removedCards[0].getIndex()).toBe(cardCount - 1);

    expect(model.getFocusIndex(0)).toBe(cardCount - 2);
    expect(model.getCards(0).length).toBe(cardCount - 1);
});

test("Remove selected cards with cards selected being the focus index and focus being the first element.", () => {
    const model = createCardGameModel();
    const cardCount = model.getCards(0).length;
    
    model.setFocusIndex(0, 0);
    
    expect(model.getFocusIndex(0)).toBe(0);

    model.updateCardSelection(0, 0, true);
        
    const selectedCardCount = model.countSelectedCards(0);
    
    expect(selectedCardCount).toBe(1);

    const removedCards = model.removeSelectedCards(0);

    expect(removedCards.length).toEqual(1);
    expect(removedCards[0].getIndex()).toBe(0);

    expect(model.getFocusIndex(0)).toBe(0);
    expect(model.getCards(0).length).toBe(cardCount - 1);
});

test("Remove selected cards with all cards selected.", () => {
    const model = createCardGameModel();
    const cardCount = model.getCards(0).length;
    
    model.setFocusIndex(0, 0);
    model.setMaxSelectedCards(0, cardCount);
    
    expect(model.getFocusIndex(0)).toBe(0);

    for (let i = 0; i < cardCount; i++) {
        model.updateCardSelection(0, i, true);
    }
        
    const selectedCardCount = model.countSelectedCards(0);
    
    expect(selectedCardCount).toBe(cardCount);

    const removedCards = model.removeSelectedCards(0);

    expect(removedCards.length).toEqual(cardCount);
    
    expect(model.getFocusIndex(0)).toBe(-1);
    expect(model.getCards(0).length).toBe(0);
});

// xxx to do test cycle selection