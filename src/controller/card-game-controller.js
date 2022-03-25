"use strict";

import { CardGameModel } from "../model/card-game-model.js";
import { ModelEventProxy } from "../model/model-event-proxy.js";
import { DECK_NAME } from "../model/player.js";
import { ButtonPanelComponent } from "../view/button-panel-component.js";
import { CardGameComponent } from "../view/card-game-component.js";

export class CardGameController {
    /**
     * @type {CardGameModel}
     */
    model = null;

    /**
     * @type {CardGameComponent}
     */
    carousels = null;

    /**
     * @type {ButtonPanelComponent}
     */
    buttons = null;

    
    /**
     *
     * @param {ModelEventProxy} model
     * @param {*} carousels
     * @param {*} buttons
     * @param {*} gameConfig
     */
    constructor(model, carousels, buttons, gameConfig) {
        /**
         * @type {CardGameComponent}
         */
        const currentCarousels = carousels.current;
        const currentButtons = buttons.current;

        this.model = model;
        this.carousels = carousels;
        this.buttons = buttons;
        this.gameConfig = gameConfig;

        // bind carousel actions
        currentCarousels.onCardSelected((playerIndex, cardIndex, isSelected) =>
            this.setCardSelected(playerIndex, cardIndex, isSelected)
        );
        currentCarousels.onFocusChanged((playerIndex, cardIndex, isHover) =>
            this.setFocusedCard(playerIndex, cardIndex)
        );
        currentCarousels.onRemoveSelectedCards((playerIndex) => this.removeSelectedCards(playerIndex));
        currentCarousels.onPlaySelectedCards((playerIndex) => this.playCards(playerIndex));
        currentCarousels.onDrawCards((playerIndex, count) => this.drawCards(playerIndex, count));
      
        // bind button actions
        currentButtons.onPlay(() => this.playCards());
        currentButtons.onDrawCards(() => this.drawCards(this.model.getActivePlayer(), -1));
        currentButtons.onToggleLock(() => this.toggleLock());
        currentButtons.onNextPlayer(() => this.nextPlayer());

        // bind event listeners
        model.addEventListener(() => this.buttonPanelModelEventHandler(model, this.getButtons()));
        model.addEventListener((id, source, args) => this.carouselModelEventHandler(id, model, args, this.getCarousels()));

        this.startGame();
    }

    startGame() {
        if (
            this.gameConfig.initialCardCount <= 0 ||
            this.model.getCards(this.model.getActivePlayer()).length < this.gameConfig.initialCardCount
        ) {
            this.model
                .getPlayerCollection()
                .forEach((player, index) => this.drawCards(index, this.gameConfig.initialCardCount));
        }
    }

    playCards() {
        const activePlayer = this.model.getActivePlayer();
        const newFocusIndex = this.computeNextFocus(activePlayer);

        const selectedCardIndices = this.model
            .getCards(activePlayer)
            .filter((card) => card.isCardSelected())
            .map((card) => card.getIndex());

        this.getCarousels().playCards(activePlayer, selectedCardIndices, newFocusIndex);

        this.model.setFocusIndex(activePlayer, newFocusIndex);
    }

    computeNextFocus(playerIndex) {
        const currentFocus = this.model.getFocusIndex(playerIndex);
        return Math.clamp(
            currentFocus - this.model.countSelectedCards(playerIndex, currentFocus),
            0,
            this.model.getCards(playerIndex).length
        );
    }

    toggleLock() {
        this.getButtons().setIsLocked(this.getCarousels().toggleLock());
    }

    nextPlayer() {
        this.model.setActivePlayer((this.model.getActivePlayer() + 1) % this.model.getPlayerCount());
    }

    setCardSelected(playerIndex, cardIndex, isSelected) {
        const updatedCards = this.model.updateCardSelection(playerIndex, cardIndex, isSelected);

        if (updatedCards) {
            this.carousels.current.updateCardSelection(playerIndex, updatedCards);
        }
    }

    setFocusedCard(playerIndex, cardIndex) {
        if (cardIndex >= 0 && cardIndex < this.model.getCards(playerIndex).length) {
            this.model.setFocusIndex(playerIndex, cardIndex);
        }
    }

    removeSelectedCards(playerIndex) {
        const removedCards = this.model.removeSelectedCards(playerIndex, DECK_NAME.DISCARD_PILE);

        if (removedCards.length > 0) {
            this.getCarousels().removeCards(playerIndex, removedCards);
        }
    }

    drawCards(playerIndex, count) {
        const deck = this.model.getDeck(playerIndex);

        if (deck.getLength() === 0) {
            this.model.shuffleDiscardPile(playerIndex);
        }

        const newCards = this.model.drawRandomCards(playerIndex, count, DECK_NAME.DECK);

        if (newCards) {
            this.getCarousels().drawCards(playerIndex, newCards, this.model.getFocusIndex(playerIndex));
        }
    }

    /**
     *
     * @returns {CardGameComponent}
     */
    getCarousels = () => this.carousels.current;

    /**
     *
     * @returns {ButtonPanelComponent}
     */
    getButtons = () => this.buttons.current;

    /**
     *
     * @param {*} id
     * @param {*} model
     * @param {*} args
     * @param {ButtonPanelComponent} view
     */
    buttonPanelModelEventHandler(model, view) {
        const activePlayer = model.getActivePlayer();

        view.setEnablePlayButton(model.countSelectedCards(activePlayer) > 0);
        view.setEnableDrawButton(model.getCards(activePlayer).length < model.getMaxCards(activePlayer));
    }

    /**
     * 
     * @param {number} id 
     * @param {CardGameModel} model 
     * @param {*} args 
     * @param {CardGameComponent} carousels 
     */
    carouselModelEventHandler(id, model, args, carousels) {
        const activePlayer = model.getActivePlayer();
        switch (id) {
            case ModelEventProxy.EVENT_ID.ACTIVE_PLAYER:
                carousels.setActivePlayer(activePlayer);                
                break;
            case ModelEventProxy.EVENT_ID.FOCUS_INDEX:
                carousels.setFocusIndex(activePlayer, model.getFocusIndex(activePlayer));
                break;
            default:
                break;
        }
    }
}
