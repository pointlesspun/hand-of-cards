import { expect, test } from "@jest/globals";
import { CardGameModel, MAX_SELECTION_REACHED_POLICY } from "../src/model/card-game-model.js";
import { DEFAULT_LIBRARY } from "../src/model/card-library.js";
import { createCardGameModel } from "../src/model/card-model-factory.js";
import { pickRandomCards } from "../src/model/card-util.js";
import { Card } from "../src/model/card.js";
import { Deck } from "../src/model/deck.js";
import { DECK_NAME, Player } from "../src/model/player.js";

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

test("Remove select cards with cycle policy set to BLOCK.", () => {
    const model = createCardGameModel();
    
    model.setMaxSelectionCyclePolicy(MAX_SELECTION_REACHED_POLICY.BLOCK);
    model.setMaxSelectedCards(0, 2);

    expect(model.getMaxSelectedCards(0)).toBe(2);
    expect(model.getMaxSelectionCyclePolicy(0)).toBe(MAX_SELECTION_REACHED_POLICY.BLOCK);
    expect(model.countSelectedCards(0)).toBe(0);

    model.updateCardSelection(0, 0, true);
    model.updateCardSelection(0, 1, true);

    expect(model.countSelectedCards(0)).toBe(2);

    expect(model.updateCardSelection(0, 2, true)).toBeNull();

    expect(model.countSelectedCards(0)).toBe(2);
    expect(model.getCards(0)[2].isCardSelected()).toBe(false);

    model.updateCardSelection(0, 1, false);

    expect(model.updateCardSelection(0, 2, true)[0]).toEqual(model.getCards(0)[2]);
    expect(model.countSelectedCards(0)).toBe(2);
    
    expect(model.getCards(0)[0].isCardSelected()).toBe(true);
    expect(model.getCards(0)[1].isCardSelected()).toBe(false);
    expect(model.getCards(0)[2].isCardSelected()).toBe(true);    
});

test("Remove select cards with cycle policy set to CYCLE_OLDEST.", () => {
    const model = createCardGameModel();
    
    model.setMaxSelectionCyclePolicy(MAX_SELECTION_REACHED_POLICY.CYCLE_OLDEST);
    model.setMaxSelectedCards(0, 2);

    expect(model.getMaxSelectedCards(0)).toBe(2);
    expect(model.getMaxSelectionCyclePolicy(0)).toBe(MAX_SELECTION_REACHED_POLICY.CYCLE_OLDEST);
    expect(model.countSelectedCards(0)).toBe(0);

    model.updateCardSelection(0, 0, true);
    model.updateCardSelection(0, 1, true);

    expect(model.countSelectedCards(0)).toBe(2);

    const updatedCards = model.updateCardSelection(0, 2, true);
   
    expect(updatedCards[0]).toEqual(model.getCards(0)[0]);
    expect(updatedCards[1]).toEqual(model.getCards(0)[2]);

    expect(model.getCards(0)[0].isCardSelected()).toBe(false);
    expect(model.getCards(0)[1].isCardSelected()).toBe(true);
    expect(model.getCards(0)[2].isCardSelected()).toBe(true);
});

function isCardDefined (card){
    expect(card).not.toBeNull();
    expect(card.definition).not.toBeNull();
    expect(card.isCardSelected()).toBe(false);
    expect(card.hasCardFocus()).toBe(false);
}

test("Get cards from player library.", () => {
    const model = createCardGameModel();
    const player = model.getPlayer(0);

    const cards = player.getCardsFrom(2, DECK_NAME.LIBRARY);

    expect(cards.length).toBe(2);

    cards.forEach(c => isCardDefined(c));
});

test("Get cards from player deck.", () => {
    const model = createCardGameModel({cardCount : 4});
    const player = model.getPlayer(0);

    expect(player.getDeck().getLength()).toBe(4);

    // draw more cards from the deck than there are in the deck
    const cards = player.getCardsFrom(8, DECK_NAME.DECK);

    expect(cards.length).toBe(4);

    expect(player.getDeck().getLength()).toBe(0);

    // expect the cards to have some value
    cards.forEach(c => isCardDefined(c));

});

test("Get cards from player discard pile.", () => {
    const model = createCardGameModel({cardCount : 4});
    const player = model.getPlayer(0); 

    expect(player.getDiscardPile().getLength()).toBe(0);

    // draw more cards from the deck than there are in the deck
    let cards = player.getCardsFrom(8, DECK_NAME.DISCARD_PILE);

    expect(cards.length).toBe(0);
    
    player.getDiscardPile().addCards(pickRandomCards(DEFAULT_LIBRARY, 12));
    expect(player.getDiscardPile().getLength()).toBe(12);

    cards = player.getCardsFrom(8, DECK_NAME.DISCARD_PILE);

    expect(player.getDiscardPile().getLength()).toBe(4);

    expect(cards.length).toBe(8);

    // expect the cards to have some value
    cards.forEach(c => isCardDefined(c));
});

test("Draw cards from player library.", () => {
    const model = createCardGameModel({initialCardCount: 0});
    const player = model.getPlayer(0);

    const cards = player.drawRandomCards(4, DECK_NAME.LIBRARY);

    expect(cards.length).toBe(4);

    cards.forEach(c => isCardDefined(c));

    cards.forEach((c,index) => expect(c).toEqual(player.getCards()[index]));
});

test("Move cards to draw pile.", () => {
    const model = createCardGameModel({cardCount: 0, initialCardCount: 0});
    
    expect(model.getDeck(0).getLength()).toBe(0);
    expect(model.getDiscardPile(0).getLength()).toBe(0);
    expect(model.getCards(0).length).toBe(0);

    model.getPlayer(0).moveCardsTo(pickRandomCards(DEFAULT_LIBRARY, 4), DECK_NAME.DECK);

    expect(model.getDeck(0).getLength()).toBe(4);
    expect(model.getCards(0).length).toBe(0);
    expect(model.getDiscardPile(0).getLength()).toBe(0);
})

test("Move cards to discard pile.", () => {
    const model = createCardGameModel({cardCount: 0, initialCardCount: 0});
    
    expect(model.getDeck(0).getLength()).toBe(0);
    expect(model.getCards(0).length).toBe(0);
    expect(model.getDiscardPile(0).getLength()).toBe(0);

    model.getPlayer(0).moveCardsTo(pickRandomCards(DEFAULT_LIBRARY, 4), DECK_NAME.DISCARD_PILE);

    expect(model.getDeck(0).getLength()).toBe(0);
    expect(model.getCards(0).length).toBe(0);
    expect(model.getDiscardPile(0).getLength()).toBe(4);
})