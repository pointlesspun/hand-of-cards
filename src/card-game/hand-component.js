"use strict";

/**
 * Main component which takes a number of cards and implements the interactions with those
 * cards using a carousel.
 */

import "../framework/math-extensions.js";

import { ELEMENT_TYPES } from "../framework/element-types.js";
import eventBus from "../framework/event-bus.js";

import { pickRandomCardDefinitions } from "../model/card-util.js";

// todo: fix this dependency
import { ANIMATIONS } from "../animations.js";
import { TOAST_TOPIC } from "../framework/toast-component.js";
import { IconButtonPanelComponent, IconButton } from "../framework/icon-button-panel-component.js";
import { IndicatorComponent } from "../framework/indicator-component.js";
import { CardCarouselComponent } from "./card-carousel-component.js";
import { CardGameModel } from "../model/card-game-model.js";
import { CARD_CAROUSEL_EVENT_TYPES, CAROUSEL_EVENT_NAME } from "./card-carousel-event.js";
import { ButtonPanelComponent } from "./button-panel-component.js";

/**
 * What happens when the user selects a card when the max cards have been reached
 */
export const MAX_SELECTION_REACHED_POLICY = {
    /** prevent the user from selecting more cards (default) */
    BLOCK: "block",

    /** de-select the card selected first, then select the current card */
    CYCLE_OLDEST: "cycle-oldest",
};

export const FOLD_CARDS_POLICY = {
    /** Fold cards after the play cards animation has finished */
    AFTER_ANIMATION: "after-animation",

    /** Fold cards after the play cards animation has started */
    IMMEDIATELY: "immediately",
};

export class HandComponent extends React.Component {
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

        this.state = {
            model: props.model,
            // mediaConfig unknown until after the first render and we have a ref
            mediaConfig: null,
            foldCardsPolicy: props.foldCardsPolicy ?? FOLD_CARDS_POLICY.AFTER_ANIMATION,
            cards: props.hand
                ? props.hand.map((definition) => CardCarouselComponent.createCard(definition))
                : undefined,
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
            [this.renderCarousel(), this.renderControlBar(this.state.mediaConfig)]
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
            cards: this.state.cards,
            focusIndex: this.getActiveIndex(),
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
            this.renderIndicators(this.state.cards),
            this.renderButtons(),
        ]);
    }

    /**
     * @private
     * @returns
     */
    renderIndicators(cards) {
        return React.createElement(IndicatorComponent, {
            key: "indicators",
            ref: this.indicatorRef,
            data: cards,
            activeIndex: this.getActiveIndex(),
            isDataSelected: (idx) => this.getCard(idx)?.state.isSelected,
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
                this.removeSelectedItems();
                break;
            case CARD_CAROUSEL_EVENT_TYPES.PLAY_SELECTED_CARDS:
                this.playSelectedCards();
                break;
            case CARD_CAROUSEL_EVENT_TYPES.ANIMATION_COMPLETE:
                if (parameters.name === ANIMATIONS.playCard.name) {
                    this.removeSelectedItems();
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
        const activeIndex = Math.clamp(idx, 0, this.state.cards.length);

        this.setActiveIndexValue(activeIndex);

        this.indicatorRef.current.setActiveIndex(activeIndex);
        this.carouselRef.current.setFocusIndex(activeIndex, updateCenterCard);
    }

    selectCard(idx, isSelected) {
        if (!isSelected || this.canSelectMoreCards()) {
            // does the state change ?
            if (this.carouselRef.current.isCardSelected(idx) != isSelected) {
                this.carouselRef.current.setCardSelected(idx, isSelected);
                this.buttonPanelRef.current.setEnablePlayButton(this.carouselRef.current.countSelectedCards() > 0);
            }
            // do we want to deselect the oldest selected card?
        } else if (this.props.maxCardsReachedPolicy === MAX_SELECTION_REACHED_POLICY.CYCLE_OLDEST) {
            // find the card that was selected first (ie the oldest selected card)
            const firstSelectedCard = this.state.cards
                .filter((card) => card.ref.current.state.isSelected)
                .reduce((card, prev) =>
                    prev.ref.current.state.lastUpdate < card.ref.current.state.lastUpdate ? prev : card
                );

            // deselect the oldest/first selected card
            this.selectCard(firstSelectedCard.ref.current.state.index, false);

            // select the current
            this.selectCard(idx, true);
        } else if (isSelected) {
            this.dispatchMaxCardsSelectedWarning();
        }
    }

    canSelectMoreCards() {
        // any cards to select ?
        return (
            this.carouselRef.current &&
            this.state.cards.length > 0 && //if negative there is no limit
            (this.props.maxSelectedCards < 0 ||
                // can still select more cards ?
                this.carouselRef.current.countSelectedCards() < this.props.maxSelectedCards)
        );
    }

    removeSelectedItems() {
        if (this.state.cards.length > 0) {
            const unselectedCards = this.state.cards.filter((card) => !card.ref.current.state.isSelected);

            // were any cards selected ?
            if (unselectedCards.length !== this.state.cards.length) {
                // count all cards in front of the active index, to offset the active index after the cards have been
                // removed
                const deltaActiveIndex = this.state.cards.filter(
                    (card, idx) => card.ref.current.state.isSelected && idx < this.getActiveIndex()
                ).length;
                const activeIndex = Math.clamp(this.getActiveIndex() - deltaActiveIndex, 0, unselectedCards.length);

                this.indicatorRef.current.setData(unselectedCards);
                this.indicatorRef.current.setActiveIndex(activeIndex);
                this.carouselRef.current.setCards(unselectedCards, activeIndex);
                this.buttonPanelRef.current.setEnableDrawButton(true);

                this.setActiveIndexValue(activeIndex);

                this.setState({
                    cards: unselectedCards,
                });
            }
        }
    }

    /**
     * Play all cards currently selected. The cards will be removed from the internal array after the play-card
     * animation has been finished.
     */
    playSelectedCards() {
        if (this.state.cards.length > 0) {
            const unselectedCards = this.state.cards.length - this.carouselRef.current.countSelectedCards();
            const deltaActiveIndex = this.state.cards.filter(
                (card, idx) => card.ref.current.state.isSelected && idx < this.getActiveIndex()
            ).length;

            const activeIndex = Math.clamp(this.getActiveIndex() - deltaActiveIndex, 0, unselectedCards);

            this.carouselRef.current.playSelectedCards(
                activeIndex,
                ANIMATIONS.playCard,
                this.state.foldCardsPolicy === FOLD_CARDS_POLICY.IMMEDIATELY
            );

            this.buttonPanelRef.current.setEnablePlayButton(false);

            this.setActiveIndexValue(activeIndex);
        }
    }

    /**
     * Refill the hand with new cards until the max number of cards has been reached
     */
    drawCards() {
        if (this.state.cards.length < this.props.maxCards) {
            const newCardCount = this.props.maxCards - this.state.cards.length;
            const cardDefinitions = pickRandomCardDefinitions(this.props.deck, newCardCount);

            // create a new array of cards, consisting of old and new cards
            const cards = [
                ...this.state.cards,
                ...cardDefinitions.map((definition) =>
                    CardCarouselComponent.createCard(definition, ANIMATIONS.drawCard)
                ),
            ];

            this.buttonPanelRef.current.setEnableDrawButton(false);

            this.setState({
                cards,
            });

            this.indicatorRef.current.setData(cards);
            this.carouselRef.current.setCards(cards, this.getActiveIndex());
        }
    }

    toggleLock() {
        const isLocked = !this.buttonPanelRef.current.isLocked();
        this.carouselRef.current.setIsLocked(isLocked);
        this.buttonPanelRef.current.setIsLocked(isLocked);
    }

    getCard = (idx) => (this.carouselRef.current ? this.carouselRef.current.getCard(idx) : null);

    getActiveCard = () => this.getCard(this.getActiveIndex());

    getActiveIndex = () => this.state.model.players[0].hand.focusIdx;

    setActiveIndexValue(idx) {
        const player = this.state.model.players[0];
        const model = new CardGameModel([player.clone({ hand: player.hand.clone({ focusIdx: idx }) })]);

        this.setState({ model });
    }

    /**
     * Utility to iterate over the state's cards without having to deref the cards
     * @param {*} f a function of the form (card, index) where card is the card component
     */
    forEachCard(f) {
        this.state.cards.forEach((card, index) => f(card.ref.current, index));
    }

    dispatchMaxCardsSelectedWarning = () =>
        eventBus.dispatch(TOAST_TOPIC, {
            message: "<h3>Maximum selected cards reached</h3>",
            id: "max-card-selected-warning",
        });
}
