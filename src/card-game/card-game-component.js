"use strict";

/**
 * Main component which takes a number of cards and implements the interactions with those
 * cards using a carousel.
 */

import "../framework/math-extensions.js";

import { ELEMENT_TYPES } from "../framework/element-types.js";
import eventBus from "../framework/event-bus.js";

import { ANIMATIONS } from "../animations.js";
import { TOAST_TOPIC } from "../framework/toast-component.js";
import { IndicatorComponent } from "../framework/indicator-component.js";
import { CardCarouselComponent } from "./card-carousel-component.js";
import { CardGameModel } from "../model/card-game-model.js";
import { CARD_CAROUSEL_EVENT_TYPES, CAROUSEL_EVENT_NAME } from "./card-carousel-event.js";
import { ButtonPanelComponent } from "./button-panel-component.js";
import { CounterComponent, INCREMENT_UNITS } from "../framework/counter-component.js";
import { DECK_NAME } from "../model/player.js";

export const FOLD_CARDS_POLICY = {
    /** Fold cards after the play cards animation has finished */
    AFTER_ANIMATION: "after-animation",

    /** Fold cards after the play cards animation has started */
    IMMEDIATELY: "immediately",
};

export class CardGameComponent extends React.Component {
    /**
     *
     * @param {*} props
     * @param {*[]} items
     */
    constructor(props) {
        super(props);

        // event handlers
        this.keyHandler = (evt) => this.handleKeyEvent(evt);
        this.resizeHandler = (evt) => this.handleResize();
        this.carouselEventHandler = (evt) => this.handleCarouselEvent(evt);

        // transient properties
        this.ref = React.createRef();
        this.buttonPanelRef = React.createRef();
        this.indicatorRef = React.createRef();
        this.carouselRef = React.createRef();
        this.drawCounterRef = React.createRef();
        this.discardCounterRef = React.createRef();

        /**
         * Data model used. Not part of the state (state is the VM part).
         * @type {CardGameModel}
         * @public
         */
        this.model = props.model;

        this.state = {
            // mediaConfig unknown until after the first render and we have a ref
            mediaConfig: null,
            foldCardsPolicy: props.foldCardsPolicy ?? FOLD_CARDS_POLICY.AFTER_ANIMATION,
        };
    }

    // --- React overrides --------------------------------------------------------------------------------------------

    /**
     * React-render component
     * @returns a react.element
     */
    render = () =>
        React.createElement(
            ELEMENT_TYPES.DIV,
            {
                className: "hand",
                ref: this.ref,
            },
            [this.renderCarousel(), this.renderControlBar(this.state.mediaConfig), this.renderDeckCounter(), this.renderDiscardCounter()]
        );

    /**
     * Callback after the component was added to the dom. Use this opportunity to hook up the listeners.
     */
    componentDidMount() {
        // ref https://stackoverflow.com/questions/8916620/disable-arrow-key-scrolling-in-users-browser/8916697
        const keyhandlerOptions = {
            capture: true,
            passive: false,
        };

        this.carouselRef.current.addEventListener(CAROUSEL_EVENT_NAME, this.carouselEventHandler);

        window.addEventListener("keydown", this.keyHandler, keyhandlerOptions);
        window.addEventListener("resize", this.resizeHandler);

        // after the initial mount we've got a ref and media config
        this.handleResize();

        // fill the hand with cards, 'showing off' the initial animation
        if (this.props.initialCardCount === 0 || this.model.getCards(0).length < this.props.initialCardCount) {
            this.drawCards(this.props.initialCardCount);
            this.buttonPanelRef.current.setEnableDrawButton(this.props.initialCardCount < this.model.getMaxCards(0));
        }
    }

    /**
     * Callback for when the componet is about to be removed from the dom. Remove the listeners.
     */
    componentWillUnmount() {
        this.carouselRef.current.addEventListener(CAROUSEL_EVENT_NAME, this.carouselEventHandler);

        window.removeEventListener("keydown", this.keyHandler);
        window.removeEventListener("resize", this.resizeHandler);
    }

    // --- Subcomponent rendering -------------------------------------------------------------------------------------

    /**
     *
     * @returns
     */
    renderCarousel() {
        const carouselProperties = {
            key: "card-carousel",
            ref: this.carouselRef,
            cards: this.model.getCards(0).map((card) => CardCarouselComponent.createCard(card.definition)), //this.state.cards,
            focusIndex: this.model.getFocusIndex(0),
            mediaConfig: this.state.mediaConfig,
            // if set to true the carousel will listen for events on globalThis, otherwise
            // if will listen to events on its component
            useGlobalEventScope: true,
        };

        return React.createElement(CardCarouselComponent, carouselProperties);
    }

    renderControlBar(config) {
        const height = config === null ? 0 : config.values.innerHeight;

        const properties = {
            key: "controlbar",
            style: {
                width: "100%",
                height: `${(1.0 - height) * 100}%`,
                overflow: "hidden",
            },
        };

        return React.createElement(ELEMENT_TYPES.DIV, properties, [
            this.renderIndicators(this.model.getCards(0).length),
            this.renderButtons(),
        ]);
    }

    /**
     * @private
     * @returns
     */
    renderIndicators(dataCount) {
        return React.createElement(IndicatorComponent, {
            key: "indicators",
            ref: this.indicatorRef,
            dataCount,
            activeIndex: this.model.getFocusIndex(0),
            isDataSelected: (idx) => this.model.isCardSelected(0, idx), //this.getCard(idx)?.state.isSelected,
            onClick: (idx) => this.setActiveIndex(idx),
        });
    }

    /**
     * @private
     * @returns
     */
    renderButtons() {
        return React.createElement(ButtonPanelComponent, {
            key: "cards-button-panel",
            ref: this.buttonPanelRef,
            isLocked: this.props.isLocked,
            playButtonEnabled: false,
            drawButtonEnabled: false,
            playHandler: () => this.playSelectedCards(),
            drawCardsHandler: () => this.drawCards(),
            toggleLockHandler: () => this.toggleLock(),
        });
    }

    renderDeckCounter() {
        return React.createElement(CounterComponent, {
            ref: this.drawCounterRef,
            key: "deck-counter",
            className: "card-counter deck",
            startValue: 0,
            goalValue: this.model.getDeck(0).getLength(),
            minIncrement: 1.0,
            increment: 0.15,
            digits: 0
        });
    }

    renderDiscardCounter() {
        return React.createElement(CounterComponent, {
            ref: this.discardCounterRef,
            key: "discard-pile-counter",
            className: "card-counter discard-pile",
            startValue: 0,
            goalValue: this.model.getDiscardPile(0).getLength(),
            minIncrement: 1.0,
            increment: 0.15,
            digits: 0
        });
    }

    // --- Event handlers ---------------------------------------------------------------------------------------------

    handleCarouselEvent(evt) {
        const parameters = evt.detail.parameters;

        switch (evt.detail.type) {
            case CARD_CAROUSEL_EVENT_TYPES.FOCUS:
                this.setActiveIndex(parameters);
                break;
            case CARD_CAROUSEL_EVENT_TYPES.SELECT:
                this.selectCard(parameters, true);
                break;
            case CARD_CAROUSEL_EVENT_TYPES.FOCUS_AND_SELECT:
                this.setActiveIndex(parameters);
                this.selectCard(parameters, true);
                break;
            case CARD_CAROUSEL_EVENT_TYPES.HOVER:
                this.setActiveIndex(parameters, false);
                break;
            case CARD_CAROUSEL_EVENT_TYPES.DESELECT:
                this.selectCard(parameters, false);
                break;
            case CARD_CAROUSEL_EVENT_TYPES.DRAW_CARDS:
                this.drawCards();
                break;
            case CARD_CAROUSEL_EVENT_TYPES.REMOVE_SELECTED_CARDS:
                this.removeSelectedCards();
                break;
            case CARD_CAROUSEL_EVENT_TYPES.PLAY_SELECTED_CARDS:
                this.playSelectedCards();
                break;
            case CARD_CAROUSEL_EVENT_TYPES.ANIMATION_COMPLETE:
                if (parameters.name === ANIMATIONS.playCard.name) {
                    this.removeSelectedCards();
                }
                break;
        }
    }

    /**
     * Deal with keyboard input
     * @param {number} keyCode
     */
    handleKeyEvent(evt) {
        const keyCode = evt.keyCode;

        if (evt.type === "keydown") {
            switch (keyCode) {
                case KeyCode.KEY_LEFT:
                case KeyCode.KEY_RIGHT:
                case KeyCode.KEY_UP:
                case KeyCode.KEY_DOWN:
                case KeyCode.KEY_DELETE:
                case KeyCode.KEY_RETURN:
                case KeyCode.KEY_SPACE:
                    evt.preventDefault();
            }
        }
    }

    /**
     * Callback from when the window resizes and we have to re render
     */
    handleResize() {
        const mediaConfig = this.props.getLayoutConfiguration(this.ref);
        const message = `${mediaConfig.name} ${mediaConfig.screenSize.width}x${mediaConfig.screenSize.height}`;

        this.setState({ mediaConfig });

        if (this.carouselRef.current) {
            this.carouselRef.current.setMediaConfig(mediaConfig);
        }

        eventBus.dispatch(TOAST_TOPIC, { message, id: "platform-changed" });
    }

    // --- State mutations & queries ----------------------------------------------------------------------------------

    setActiveIndex(idx, updateCenterCard = true) {
        this.model.setFocusIndex(0, idx);

        this.indicatorRef.current.setActiveIndex(this.model.getFocusIndex(0));
        this.carouselRef.current.setFocusIndex(this.model.getFocusIndex(0), updateCenterCard);
    }

    selectCard(idx, isSelected) {
        const updatedCards = this.model.updateCardSelection(0, idx, isSelected);

        // did any of the cards change state ?
        if (updatedCards !== null) {
            if (updatedCards.length > 0) {
                updatedCards.forEach((card) => {
                    this.carouselRef.current.setCardSelected(card.getIndex(), card.isCardSelected());
                });

                this.buttonPanelRef.current.setEnablePlayButton(this.model.countSelectedCards(0) > 0);
                this.indicatorRef.current.forceUpdate();
            }
        } else {
            // null returned implies nothing could be selected
            this.dispatchMaxCardsSelectedWarning();
        }
    }

    /**
     * Removes all selected cards from this component.
     */
    removeSelectedCards() {
        const removedCards = this.model.removeSelectedCards(0, DECK_NAME.DISCARD_PILE);

        if (removedCards.length > 0) {
            this.indicatorRef.current.setDataCount(this.model.getCards(0).length);
            this.indicatorRef.current.setActiveIndex(this.model.getFocusIndex(0));

            this.carouselRef.current.removeCards(
                removedCards.map((card) => card.index),
                this.model.getFocusIndex(0)
            );
            this.buttonPanelRef.current.setEnableDrawButton(true);
            this.discardCounterRef.current.setGoalValue(this.model.getDiscardPile(0).getLength());
        }
    }

    /**
     * Play all cards currently selected. The cards will be removed from the internal array after the play-card
     * animation has been finished.
     */
    playSelectedCards() {
        const selectedCardCount = this.model.countSelectedCards(0);

        if (selectedCardCount > 0) {
            const currentFocus = this.model.getFocusIndex(0);
            const focusIndex = Math.clamp(
                currentFocus - this.model.countSelectedCards(0, currentFocus),
                0,
                this.model.getCards(0).length
            );

            this.carouselRef.current.playSelectedCards(
                focusIndex,
                ANIMATIONS.playCard,
                this.state.foldCardsPolicy === FOLD_CARDS_POLICY.IMMEDIATELY
            );

            this.buttonPanelRef.current.setEnablePlayButton(false);

            this.model.setFocusIndex(0, focusIndex);
        }
    }

    /**
     * Refill the hand with new cards until the max number of cards has been reached.
     */
    drawCards(count) {
        const deck = this.model.getDeck(0);

        if (deck.getLength() === 0) {
            this.model.shuffleDiscardPile(0);
            this.discardCounterRef.current.setGoalValue(this.model.getDiscardPile(0).getLength());
        }

        const newCards = this.model.drawRandomCards(0, count, DECK_NAME.DECK);

        if (newCards) {
            this.buttonPanelRef.current.setEnableDrawButton(this.model.getCards(0).length < this.model.getMaxCards(0));
            this.indicatorRef.current.setDataCount(this.model.getCards(0).length);
            this.carouselRef.current.addCards(
                newCards.map((card) => CardCarouselComponent.createCard(card.definition, ANIMATIONS.drawCard)),
                this.model.getFocusIndex(0)
            );
            this.drawCounterRef.current.setGoalValue(deck.getLength());
        }
        
    }

    toggleLock() {
        const isLocked = !this.buttonPanelRef.current.isLocked();
        this.carouselRef.current.setIsLocked(isLocked);
        this.buttonPanelRef.current.setIsLocked(isLocked);
    }

    // --- Utility methods  -------------------------------------------------------------------------------------------
    
    /**
     * Sends an event to the toast to notify the user has reached the max selected cards and 
     * cannot select any more.
     * @private
     */
    dispatchMaxCardsSelectedWarning() {
        eventBus.dispatch(TOAST_TOPIC, {
            message: "<h3>Maximum selected cards reached</h3>",
            id: "max-card-selected-warning",
        });
    }
}
