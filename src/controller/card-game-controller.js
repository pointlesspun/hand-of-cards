"use strict";

import { CardGameModel } from "../model/card-game-model.js";
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

        currentCarousels.onCardSelected((playerIndex, cardIndex, isSelected) =>
            this.setCardSelected(playerIndex, cardIndex, isSelected)
        );
        currentCarousels.onFocusChanged((playerIndex, cardIndex, isHover) =>
            this.setFocusedCard(playerIndex, cardIndex, isHover)
        );
        currentCarousels.onRemoveSelectedCards((playerIndex) => this.removeSelectedCards(playerIndex));
        currentCarousels.onPlaySelectedCards((playerIndex) => this.playCards(playerIndex));
        currentCarousels.onDrawCards((playerIndex, count) => this.drawCards(playerIndex, count));
        //currentCarousels.onComponentMounted(() => this.startGame());

        currentButtons.onPlay(() => this.playCards());
        currentButtons.onDrawCards(() => this.drawCards(this.model.getActivePlayer(), -1));
        currentButtons.onToggleLock(() => this.toggleLock());
        currentButtons.onNextPlayer(() => this.nextPlayer());

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

        const activePlayer = this.model.getActivePlayer();

        this.getButtons().setEnablePlayButton(this.model.countSelectedCards(activePlayer) > 0);
        this.getButtons().setEnableDrawButton(
            this.model.getCards(activePlayer).length < this.model.getMaxCards(activePlayer)
        );
    }

    playCards() {
        const activePlayer = this.model.getActivePlayer();
        const newFocusIndex = this.computeNextFocus(activePlayer);

        const selectedCardIndices = this.model
            .getCards(activePlayer)
            .filter((card) => card.isCardSelected())
            .map((card) => card.getIndex());

        this.getCarousels().playCards(activePlayer, selectedCardIndices, newFocusIndex);

        this.getButtons().setEnablePlayButton(false);
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

    /*drawCards() {
        const activePlayer = this.model.getActivePlayer();

        this.carousels.current.drawCards(-1, activePlayer);

        this.getButtons().setEnableDrawButton(
            this.model.getCards(activePlayer).length < this.model.getMaxCards(activePlayer)
        );
    }*/

    toggleLock() {
        this.getButtons().setIsLocked(this.getCarousels().toggleLock());
    }

    nextPlayer() {
        this.carousels.current.setActivePlayer((this.model.getActivePlayer() + 1) % this.model.getPlayerCount());
    }

    setCardSelected(playerIndex, cardIndex, isSelected) {
        const updatedCards = this.model.updateCardSelection(playerIndex, cardIndex, isSelected);

        if (updatedCards) {
            this.carousels.current.updateCardSelection(playerIndex, updatedCards);
            this.getButtons().setEnablePlayButton(this.model.countSelectedCards(playerIndex) > 0);
        }
    }

    setFocusedCard(playerIndex, cardIndex, isHover) {
        if (cardIndex >= 0 && cardIndex < this.model.getCards(playerIndex).length) {
            const updateCenterCard = isHover === false;
            this.model.setFocusIndex(playerIndex, cardIndex);
            this.getCarousels().setActiveIndex(playerIndex, cardIndex, updateCenterCard);
        }
    }

    removeSelectedCards(playerIndex) {
        const removedCards = this.model.removeSelectedCards(playerIndex, DECK_NAME.DISCARD_PILE);

        if (removedCards.length > 0) {
            this.getCarousels().removeCards(playerIndex, removedCards);
            this.getButtons().setEnableDrawButton(true);
            this.getButtons().setEnablePlayButton(this.model.countSelectedCards(playerIndex) > 0);
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
            this.getButtons().setEnableDrawButton(
                this.model.getCards(playerIndex).length < this.model.getMaxCards(playerIndex)
            );
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
}
