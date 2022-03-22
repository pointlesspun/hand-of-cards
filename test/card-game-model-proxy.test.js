import { expect, test } from "@jest/globals";
import { CardGameModel, MAX_SELECTION_REACHED_POLICY } from "../src/model/card-game-model.js";
import { DEFAULT_LIBRARY } from "../src/app-card-library.js";
import { createCardGameModel } from "../src/app-card-model-factory.js";
import { pickRandomCards } from "../src/model/card-util.js";
import { Card } from "../src/model/card.js";
import { Deck } from "../src/model/deck.js";
import { DECK_NAME, Player } from "../src/model/player.js";
import { ModelEventProxy } from "../src/model/model-event-proxy.js";

test("Can add and remove listeners.", () => {
    const proxy = new ModelEventProxy([]);
    const listener1 = (id, source, args) => {};
    const listener2 = (id, source, args) => {};
    proxy.addEventListener(listener1);

    expect(proxy.hasListener(listener1));
    expect(!proxy.hasListener(listener2));

    proxy.addEventListener(listener2);

    expect(proxy.hasListener(listener1));
    expect(proxy.hasListener(listener2));

    proxy.removeEventListener(listener1);

    expect(!proxy.hasListener(listener1));
    expect(proxy.hasListener(listener2));

    proxy.removeEventListener(listener2);

    expect(!proxy.hasListener(listener1));
    expect(!proxy.hasListener(listener2));
});

test("Can receive setActivePlayer change events.", () => {
    const model = new createCardGameModel({
        playerCount: 2
    });
    const evtsReceived = [];
    const listener = (id, source, args) => {
        evtsReceived.push({id, source, args});
    };
    
    model.addEventListener(listener);
    model.setActivePlayer(1);

    expect(evtsReceived.length).toBe(1);
});


test("Removed listener will receive event when removed as a response to an event.", () => {
    const model = new createCardGameModel({
        playerCount: 2
    });
    const evtsReceived = [];
    const listenerToRemove = (id, source, args) => {
        evtsReceived.push({id, source, args});
    };
    const listenerRemovingOther = (id, source, args) => {
        model.removeEventListener(listenerToRemove);
    };
    
    model.addEventListener(listenerRemovingOther);
    model.addEventListener(listenerToRemove);
    model.setActivePlayer(1);

    expect(evtsReceived.length).toBe(1);

    expect(!model.hasListener(listenerToRemove));
    expect(model.hasListener(listenerRemovingOther));
});

test("Added listener will NOT receive event when added as a response to an event.", () => {
    const model = new createCardGameModel({
        playerCount: 2
    });
    const evtsReceived = [];
    const listenerToAdd = (id, source, args) => {
        evtsReceived.push({id, source, args});
    };
    const listenerAddingOther = (id, source, args) => {
        model.addEventListener(listenerToAdd);
    };
    
    model.addEventListener(listenerAddingOther);
    model.setActivePlayer(1);

    expect(evtsReceived.length).toBe(0);

    expect(model.hasListener(listenerToAdd));
    expect(model.hasListener(listenerAddingOther));
});