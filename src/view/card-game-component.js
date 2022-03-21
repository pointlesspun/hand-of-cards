"use strict";

/**
 * Main component which takes a number of cards and implements the interactions with those
 * cards using a carousel.
 */

import "../framework/math-extensions.js";

import { ELEMENT_TYPES } from "../framework/element-types.js";
import eventBus from "../framework/event-bus.js";

import { ToastMessage, TOAST_TOPIC } from "../framework/toast-component.js";
import { IndicatorComponent } from "../framework/indicator-component.js";
import { CardCarouselComponent } from "./card-carousel-component.js";
import { CardGameModel } from "../model/card-game-model.js";
import { CARD_CAROUSEL_EVENT_TYPES, CAROUSEL_EVENT_NAME } from "./card-carousel-event.js";
import { ButtonPanelComponent } from "./button-panel-component.js";
import { CounterComponent } from "../framework/counter-component.js";
import { DECK_NAME } from "../model/player.js";
import { PlatformConfiguration } from "../framework/platform-configuration.js";
import { Size } from "../framework/size.js";
import { CardAnimation } from "./card-animation.js";
import { Transform } from "../framework/transform.js";
import { newArray } from "../framework/arrays.js";
import { contract } from "../framework/contract.js";

export const FOLD_CARDS_POLICY = {
    /** Fold cards after the play cards animation has finished */
    AFTER_ANIMATION: "after-animation",

    /** Fold cards after the play cards animation has started */
    IMMEDIATELY: "immediately",
};

export class CardGameComponent extends React.Component {
    /**
     * Animations used in this component. It's up to the application to
     * define the 'createAnimationStyle' method for both animations.
     */
    static ANIMATIONS = {
        playCard: new CardAnimation({
            name: "playCard",
            endTransform: new Transform(),
            deleteOnEnd: true,
        }),
        drawCard: new CardAnimation({
            name: "drawCard",
            startTransform: new Transform(),
        }),
    };

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

        this.carouselRefs = newArray(props.model.getPlayerCount(), () => React.createRef());

        //this.buttonPanelRef = React.createRef();
        this.indicatorRef = React.createRef();

        this.drawCounterRef = React.createRef();
        this.discardCounterRef = React.createRef();

        /**
         * Data model used. Not part of the state (state is the VM part).
         * @type {CardGameModel}
         * @public
         */
        this.model = props.model;

        this.state = {
            // platformConfig unknown until after the first render and we have a ref
            platformConfig: null,
            foldCardsPolicy: props.foldCardsPolicy ?? FOLD_CARDS_POLICY.AFTER_ANIMATION,
        };
    }

    // --- React overrides --------------------------------------------------------------------------------------------

    /**
     * React-render component
     * @returns a react.element
     */
    render = () => {
        const children = [
            this.renderAllCarousels(),
            this.renderControlBar(this.state.platformConfig),
            this.renderDeckCounter(),
            this.renderDiscardCounter(),
        ];

        return React.createElement(
            ELEMENT_TYPES.DIV,
            {
                className: "hand",
                ref: this.ref,
            },
            children
        );
    };

    /**
     * Callback after the component was added to the dom. Use this opportunity to hook up the listeners.
     */
    componentDidMount() {
        // ref https://stackoverflow.com/questions/8916620/disable-arrow-key-scrolling-in-users-browser/8916697
        const keyhandlerOptions = {
            capture: true,
            passive: false,
        };

        this.forEachCarousel((carousel) => carousel.addEventListener(CAROUSEL_EVENT_NAME, this.carouselEventHandler));

        window.addEventListener("keydown", this.keyHandler, keyhandlerOptions);
        window.addEventListener("resize", this.resizeHandler);

        // after the initial mount we've got a ref and media config
        this.handleResize();

        // fill the hand with cards, 'showing off' the initial animation
        /*if (
            this.props.initialCardCount === 0 ||
            this.model.getCards(this.model.getActivePlayer()).length < this.props.initialCardCount
        ) {
            this.drawCardsForAllPlayers(this.props.initialCardCount);
            //this.buttonPanelRef.current.setEnableDrawButton(this.props.initialCardCount < this.model.getMaxCards(this.model.getActivePlayer()));
        }*/


        this.onComponentMountedHandler?.();
    }

    /**
     * Callback for when the componet is about to be removed from the dom. Remove the listeners.
     */
    componentWillUnmount() {
        this.forEachCarousel((carousel) =>
            carousel.removeEventListener(CAROUSEL_EVENT_NAME, this.carouselEventHandler)
        );

        window.removeEventListener("keydown", this.keyHandler);
        window.removeEventListener("resize", this.resizeHandler);
    }

    // --- Subcomponent rendering -------------------------------------------------------------------------------------

    renderAllCarousels() {
        const playerCount = this.model.getPlayerCount();
        const carousels = [];

        for (let i = 0; i < playerCount; i++) {
            carousels.push(this.renderCarousel(i));
        }

        return React.createElement(
            ELEMENT_TYPES.DIV,
            {
                className: "carousel-container",
                key: "carousel-container",
            },
            carousels
        );
    }

    /**
     *
     * @returns
     */
    renderCarousel(playerIndex) {
        const carouselProperties = {
            key: `card-carousel-${playerIndex}`,
            ref: this.carouselRefs[playerIndex],
            cards: this.model.getCards(playerIndex).map((card) => CardCarouselComponent.createCard(card.definition)),
            isLocked: this.props.isLocked,
            focusIndex: this.model.getFocusIndex(playerIndex),
            platformConfig: this.state.platformConfig,
            // if set to true the carousel will listen for events on globalThis, otherwise
            // if will listen to events on its component
            useGlobalEventScope: true,
            //style,
            //transform: style,
            playerIndex,
            isActive: playerIndex === this.model.getActivePlayer(),
        };

        return React.createElement(CardCarouselComponent, carouselProperties);
    }

    renderControlBar(config) {
        const height = config === null ? 0 : config.settings.layoutCollection.getInnerHeight();

        const properties = {
            key: "controlbar",
            style: {
                width: "100%",
                height: `${(1.0 - height) * 100}%`,
                overflow: "hidden",
            },
        };

        return React.createElement(ELEMENT_TYPES.DIV, properties, [
            this.renderIndicators(this.model.getCards(this.model.getActivePlayer()).length),
            //this.renderButtons(),
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
            activeIndex: this.model.getFocusIndex(this.model.getActivePlayer()),
            isDataSelected: (idx) => this.model.isCardSelected(this.model.getActivePlayer(), idx),
            onClick: (idx) => this.focusChangedHandler?.(this.model.getActivePlayer(), idx, false),
            //this.setActiveIndex(idx, true, this.model.getActivePlayer()),
        });
    }

    /**
     * @private
     * @returns
     */
    /* renderButtons() {
        return React.createElement(ButtonPanelComponent, {
            key: "cards-button-panel",
            ref: this.buttonPanelRef,
            isLocked: this.props.isLocked,
            playButtonEnabled: false,
            drawButtonEnabled: false,
            playHandler: () => this.playSelectedCards(this.model.getActivePlayer()),
            drawCardsHandler: () => this.drawCards(-1, this.model.getActivePlayer()),
            toggleLockHandler: () => this.toggleLock(),
            nextPlayerHandler: () => this.setActivePlayer((this.model.getActivePlayer() + 1) % this.model.getPlayerCount())
        });
    }*/

    renderDeckCounter() {
        return React.createElement(CounterComponent, {
            ref: this.drawCounterRef,
            key: "deck-counter",
            className: "card-counter deck",
            startValue: 0,
            goalValue: this.model.getDeck(this.model.getActivePlayer()).getLength(),
            minIncrement: 1.0,
            increment: 0.15,
            digits: 0,
        });
    }

    renderDiscardCounter() {
        return React.createElement(CounterComponent, {
            ref: this.discardCounterRef,
            key: "discard-pile-counter",
            className: "card-counter discard-pile",
            startValue: 0,
            goalValue: this.model.getDiscardPile(this.model.getActivePlayer()).getLength(),
            minIncrement: 1.0,
            increment: 0.15,
            digits: 0,
        });
    }

    // --- Event handlers ---------------------------------------------------------------------------------------------

    /**
     * Handle an event from a carousel, make a decision whether to process it or not
     * @param {Event} evt is an event of which the .details are implement by a card-carousel-event.
     */
    handleCarouselEvent(evt) {
        // (In the current implementation) we'll only accept events from the active player.
        // but this would be the place to select what events to let through for which player
        if (
            evt.detail.playerIndex === this.model.getActivePlayer() ||
            // animation events still need to be handled otherwise animations may freeze mid activity
            evt.detail.type === CARD_CAROUSEL_EVENT_TYPES.ANIMATION_COMPLETE
        ) {
            this.handlePlayerCarouselEvent(evt, evt.detail.playerIndex);
        }
    }

    /**
     * Handle an event from the carousel and apply it to the given player.
     *
     * @param {Event} evt is an event of which the .details are implement by a card-carousel-event.
     * @param {number} playerIndex the index of the player in the model
     */
    handlePlayerCarouselEvent(evt, playerIndex) {
        const parameters = evt.detail.parameters;

        switch (evt.detail.type) {
            case CARD_CAROUSEL_EVENT_TYPES.FOCUS:
                //this.setActiveIndex(parameters, true, playerIndex);
                this.focusChangedHandler?.(playerIndex, parameters, false);
                break;
            case CARD_CAROUSEL_EVENT_TYPES.SELECT:
                //this.selectCard(parameters, true, playerIndex);
                this.cardSelectedHandler?.(playerIndex, parameters, true);
                break;

            case CARD_CAROUSEL_EVENT_TYPES.FOCUS_AND_SELECT:
                //this.setActiveIndex(parameters, true, playerIndex);
                //this.selectCard(parameters, true, playerIndex);
                this.focusChangedHandler?.(playerIndex, parameters, false);
                this.cardSelectedHandler?.(playerIndex, parameters, true);

                break;
            case CARD_CAROUSEL_EVENT_TYPES.HOVER:
                //this.setActiveIndex(parameters, false, playerIndex);
                this.focusChangedHandler?.(playerIndex, parameters, true);
                break;
            case CARD_CAROUSEL_EVENT_TYPES.DESELECT:
                //this.selectCard(parameters, false, playerIndex);
                this.cardSelectedHandler?.(playerIndex, parameters, false);
                break;
            case CARD_CAROUSEL_EVENT_TYPES.DRAW_CARDS:
                //this.drawCards(-1, playerIndex);
                this.drawCardsHandler?.(playerIndex, -1);
                break;
            case CARD_CAROUSEL_EVENT_TYPES.REMOVE_SELECTED_CARDS:
                //this.removeSelectedCards(playerIndex);
                this.removeSelectedCardsHandler?.(playerIndex);
                break;
            case CARD_CAROUSEL_EVENT_TYPES.PLAY_SELECTED_CARDS:
                ///this.playSelectedCards(playerIndex);
                this.playSelectedCardsHandler?.(playerIndex);
                break;
            case CARD_CAROUSEL_EVENT_TYPES.ANIMATION_COMPLETE:
                if (parameters.deleteOnEnd) {
                    //this.removeSelectedCards(playerIndex);
                    this.removeSelectedCardsHandler?.(playerIndex);
                }
                break;
        }
    }

    /**
     * Deal with keyboard input, spefically ignoring certain events to avoid the default behaviour.
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
        // find the configuration which matches the screen size, orientation and game state best
        const platformConfig = PlatformConfiguration.selectMatch(
            new Size(this.ref.current.clientWidth, this.ref.current.clientHeight)
        );
        const message = `${platformConfig.name} ${platformConfig.screenSize.width}x${platformConfig.screenSize.height}`;

        this.setState({ platformConfig });

        // update the media config for each carousel
        this.forEachCarousel((carousel, index) => {
            carousel.setPlatformConfig(platformConfig);
        });

        if (this.drawCounterRef.current && this.discardCounterRef.current) {
            CardGameComponent.ANIMATIONS.drawCard.mapStartTransformToRect(
                platformConfig,
                this.drawCounterRef.current.getBoundingClientRect()
            );
            CardGameComponent.ANIMATIONS.playCard.mapEndTransformToRect(
                platformConfig,
                this.discardCounterRef.current.getBoundingClientRect()
            );
        }

        eventBus.dispatch(TOAST_TOPIC, new ToastMessage(message, 2.0, "platform-changed"));
    }

    // --- State mutations & queries ----------------------------------------------------------------------------------

    setActiveIndex(playerIndex, index, updateCenterCard) {
        contract.isInRange(playerIndex, 0, this.carouselRefs.length);
        contract.isInRange(index, 0, this.getCarousel(playerIndex).getCardCount());
        contract.isBoolean(updateCenterCard);

        //this.model.setFocusIndex(playerIndex, idx);

        // indicators only apply (in the current implementation) to the active player
        if (playerIndex === this.model.getActivePlayer()) {
            this.indicatorRef.current.setActiveIndex(index);
        }

        this.getCarousel(playerIndex).setFocusIndex(index, updateCenterCard);
    }

    /**
     * Selects or deselects a card. When the user performs the 'play' action, the selected cards
     * will be removed from the hand and moved to the discard pile.
     *
     * @param {number} index of the card to change the isSelected state
     * @param {boolean} isSelected flag indicating whether or not the card is selected
     * @param {number} playerIndex index of the player
     */
    //selectCard(index, isSelected, playerIndex) {
    updateCardSelection(playerIndex, updatedCards) {
        //const updatedCards = this.model.updateCardSelection(playerIndex, index, isSelected);

        // did any of the cards change state ?
        if (updatedCards !== null) {
            if (updatedCards.length > 0) {
                updatedCards.forEach((card) => {
                    this.carouselRefs[playerIndex].current.setCardSelected(card.getIndex(), card.isCardSelected());
                });

                //this.buttonPanelRef.current.setEnablePlayButton(this.model.countSelectedCards(playerIndex) > 0);
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
    //removeSelectedCards(playerIndex) {
    removeCards(playerIndex, cards) {
        //const removedCards = this.model.removeSelectedCards(playerIndex, DECK_NAME.DISCARD_PILE);

        if (cards.length > 0) {
            this.indicatorRef.current.setDataCount(this.model.getCards(playerIndex).length);
            this.indicatorRef.current.setActiveIndex(this.model.getFocusIndex(playerIndex));

            this.carouselRefs[playerIndex].current.removeCards(
                cards.map((card) => card.index),
                this.model.getFocusIndex(playerIndex)
            );
            //this.buttonPanelRef.current.setEnableDrawButton(true);
            this.discardCounterRef.current.setGoalValue(this.model.getDiscardPile(playerIndex).getLength());
        }
    }

    /**
     * Play all cards currently selected. The cards will be removed from the internal array after the play-card
     * animation has been finished.
     */
    //playSelectedCards(playerIndex) {
    playCards(playerIndex, cardIndices, newFocusIndex) {        
        //const selectedCardCount = this.model.countSelectedCards(playerIndex);

        //if (selectedCardCount > 0) {
            /*const currentFocus = this.model.getFocusIndex(playerIndex);
            const focusIndex = Math.clamp(
                currentFocus - this.model.countSelectedCards(playerIndex, currentFocus),
                0,
                this.model.getCards(playerIndex).length
            );*/

            //this.carouselRefs[playerIndex].current.playSelectedCards(
            const currentCarousel = this.getCarousel(playerIndex);
            currentCarousel.playCards(
                cardIndices,
                newFocusIndex,
                CardGameComponent.ANIMATIONS.playCard,
                this.state.foldCardsPolicy === FOLD_CARDS_POLICY.IMMEDIATELY
            );

            //this.buttonPanelRef.current.setEnablePlayButton(false);

            //this.model.setFocusIndex(playerIndex, focusIndex);
        //}
    }

    /**
     * For all players in this game draw 'count' cards. If count is undefined or negative
     * the max number of cards will be drawn.
     * @param {number} count
     */
    /*drawCardsForAllPlayers(count) {
        const playerCount = this.model.getPlayerCount();

        for (let i = 0; i < playerCount; ++i) {
            this.drawCards(count, i);
        }
    }*/

    /**
     * Refill the hand with new cards until the max number of cards has been reached.
     * @param {number} count number of cards to draw, if undefined or negative will draw cards until the hand is full
     * @param {number} playerIndex the player to draw cards for
     */
    drawCards(/*count,*/ playerIndex, newCards, newFocusIndex) {
        //const deck = this.model.getDeck(playerIndex);

        //if (deck.getLength() === 0) {
            //this.model.shuffleDiscardPile(playerIndex);
            //this.discardCounterRef.current.setGoalValue(this.model.getDiscardPile(playerIndex).getLength());
        //}

        //const newCards = this.model.drawRandomCards(playerIndex, count, DECK_NAME.DECK);

        if (newCards && newCards.length) {
            //this.buttonPanelRef.current.setEnableDrawButton(this.model.getCards(playerIndex).length < this.model.getMaxCards(playerIndex));
            const carousel = this.getCarousel(playerIndex);

            this.indicatorRef.current.setDataCount(carousel.getCardCount() + newCards.length);
            
            carousel.addCards(
                newCards.map((card) =>
                    CardCarouselComponent.createCard(card.definition, CardGameComponent.ANIMATIONS.drawCard)
                ),
                newFocusIndex
                //this.model.getFocusIndex(playerIndex)
            );
            //this.drawCounterRef.current.setGoalValue(deck.getLength());
        }
    }

    /**
     * Inverses the lock state of the current active player. When locked the cards do not move when the player browses
     * through them. When unlocked the center of the cards move with the current focused card.
     */
    toggleLock() {
        const currentCarousel = this.carouselRefs[this.model.getActivePlayer()].current;
        const isLocked = !currentCarousel.isLocked();
        currentCarousel.setIsLocked(isLocked);
        //this.buttonPanelRef.current.setIsLocked(isLocked);

        return isLocked;
    }

    /**
     * Set the active player
     * @param {number} index the index of the player to change to
     */
    setActivePlayer(index) {
        contract.isInRange(index, 0, this.model.getPlayerCount());

        if (index !== this.model.getActivePlayer()) {
            this.model.setActivePlayer(index);

            this.forEachCarousel((carousel, carouselIndex) => carousel.setIsActive(carouselIndex === index));

            this.indicatorRef.current.setDataCount(this.model.getCards(index).length);
            //this.buttonPanelRef.current.setEnableDrawButton(this.model.getCards(index).length < this.model.getMaxCards(index));
            //this.buttonPanelRef.current.setEnablePlayButton(this.model.countSelectedCards(index) > 0);
            //this.buttonPanelRef.current.setIsLocked(this.carouselRefs[index].current.isLocked());
        }
    }

    /**
     *
     * @param {number} index of the carousel
     * @returns {CardCarouselComponent}
     */
    getCarousel = (index) => this.carouselRefs[index].current;

    // --- Callbacks ---------------------------------------------------------------------------------------------

    onCardSelected(callback) {
        this.cardSelectedHandler = callback;
    }

    onFocusChanged(callback) {
        this.focusChangedHandler = callback;
    }

    onRemoveSelectedCards(callback) {
        this.removeSelectedCardsHandler = callback;
    }

    onPlaySelectedCards(callback) {
        this.playSelectedCardsHandler = callback;
    }

    onDrawCards(callback) {
        this.drawCardsHandler = callback;
    }

    onComponentMounted(callback) {
        this.onComponentMountedHandler = callback;
    }

    // --- Utility methods  -------------------------------------------------------------------------------------------

    /**
     * Sends an event to the toast to notify the user has reached the max selected cards and
     * cannot select any more.
     * @private
     */
    dispatchMaxCardsSelectedWarning() {
        eventBus.dispatch(
            TOAST_TOPIC,
            new ToastMessage("<h3>Maximum selected cards reached</h3>", 2.0, "max-card-selected-warning")
        );
    }

    forEachCarousel(f) {
        for (let i = 0; i < this.carouselRefs.length; i++) {
            if (this.carouselRefs[i].current) {
                f(this.carouselRefs[i].current, i);
            }
        }
    }
}
