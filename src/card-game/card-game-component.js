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
import { countInArray } from "../framework/arrays.js";

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
            /*cards: props.hand
                ? props.hand.map((definition) => CardCarouselComponent.createCard(definition))
                : undefined,*/
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
            this.renderIndicators(/*this.cards.length*/ this.model.getCards(0).length),
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
        //const activeIndex = Math.clamp(idx, 0, this.model.getCards(0).length);

        //this.setActiveIndexValue(activeIndex);
        this.model.setFocusIndex(0, idx);

        this.indicatorRef.current.setActiveIndex(this.model.getFocusIndex(0));
        this.carouselRef.current.setFocusIndex(this.model.getFocusIndex(0), updateCenterCard);
    }

    selectCard(idx, isSelected) {
        /*const player = this.model.getPlayer(0);

        if (!isSelected || player.canSelectMoreCards()) {
            // does the state change ?
            if (player.isCardSelected(idx) != isSelected) {
                player.setCardSelected(idx, isSelected);
                
                this.carouselRef.current.setCardSelected(idx, isSelected);
                this.buttonPanelRef.current.setEnablePlayButton(this.carouselRef.current.countSelectedCards() > 0);
                this.indicatorRef.current.forceUpdate();
            }
            // do we want to deselect the oldest selected card?
        } else if (this.model.maxCardsReachedPolicy === MAX_SELECTION_REACHED_POLICY.CYCLE_OLDEST) {
            // find the card that was selected first (ie the oldest selected card)
            const firstSelectedCard = player.getFirstSelectedCard();

            // deselect the oldest/first selected card
            this.selectCard(firstSelectedCard.index, false);

            // select the current
            this.selectCard(idx, true);
        } else if (isSelected) {
            this.dispatchMaxCardsSelectedWarning();
        }*/

        const updatedCards = this.model.updateCardSelection(0, idx, isSelected);

        if (updatedCards !== null) {
            if (updatedCards.length > 0) {
                updatedCards.forEach( card => {
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

    /*canSelectMoreCards() {
        // any cards to select ?
        return (
            this.carouselRef.current &&
            this.state.cards.length > 0 && //if negative there is no limit
            (this.props.maxSelectedCards < 0 ||
                // can still select more cards ?
                this.carouselRef.current.countSelectedCards() < this.props.maxSelectedCards)
        );
    }*/

    removeSelectedItems() {
        /*if (this.state.cards.length > 0) {
            const unselectedCards = this.state.cards.filter((card) => !card.ref.current.state.isSelected);

            // were any cards selected ?
            if (unselectedCards.length !== this.state.cards.length) {
                // count all cards in front of the active index, to offset the active index after the cards have been
                // removed
                const deltaActiveIndex = this.state.cards.filter(
                    (card, idx) => card.ref.current.state.isSelected && idx < this.getActiveIndex()
                ).length;
                const activeIndex = Math.clamp(this.getActiveIndex() - deltaActiveIndex, 0, unselectedCards.length);

                this.indicatorRef.current.setDataCount(unselectedCards.length);
                this.indicatorRef.current.setActiveIndex(activeIndex);
                this.carouselRef.current.setCards(unselectedCards, activeIndex);
                this.buttonPanelRef.current.setEnableDrawButton(true);

                this.setActiveIndexValue(activeIndex);

                this.setState({ cards: unselectedCards });
            }
        }*/

        const removedCards = this.model.removeSelectedCards(0);

        if (removedCards.length > 0) {
            // count all cards in front of the active index, to offset the active index after the cards have been
            // removed
            /*const deltaActiveIndex = this.state.cards.filter(
                (card, idx) => card.ref.current.state.isSelected && idx < this.getActiveIndex()
            ).length;
            const activeIndex = Math.clamp(this.getActiveIndex() - deltaActiveIndex, 0, unselectedCards.length);*/

            const newFocus = this.model.getFocusIndex(0);
            this.indicatorRef.current.setDataCount(this.model.getCards(0).length);
            this.indicatorRef.current.setActiveIndex(newFocus);
            //this.carouselRef.current.setCards(unselectedCards, newFocus);
            this.carouselRef.current.removeCards(removedCards.map( card => card.index), this.model.getFocusIndex(0));
            this.buttonPanelRef.current.setEnableDrawButton(true);

            //this.setActiveIndexValue(activeIndex);
        }
    }

    /**
     * Play all cards currently selected. The cards will be removed from the internal array after the play-card
     * animation has been finished.
     */
    playSelectedCards() {
        const selectedCardCount = this.model.countSelectedCards(0);

        if (selectedCardCount > 0) {
            //const currentFocus = this.model.getFocusIndex(0);
                                    
            /*const deltaActiveIndex = this.state.cards.filter(
                (card, idx) => card.ref.current.state.isSelected && idx < this.getActiveIndex()
            ).length;*/

            const currentFocus = this.model.getFocusIndex(0);
            const focusIndex = Math.clamp(currentFocus - this.model.countSelectedCards(0, currentFocus), 0, this.model.getCards(0).length);//Math.clamp(currentFocus - this.model.countSelectedCards(0, currentFocus), 0, this.model.getCards().length - selectedCardCount);

            this.carouselRef.current.playSelectedCards(
                focusIndex,
                ANIMATIONS.playCard,
                this.state.foldCardsPolicy === FOLD_CARDS_POLICY.IMMEDIATELY
            );

            this.buttonPanelRef.current.setEnablePlayButton(false);

            this.model.setFocusIndex(0, focusIndex);
            //this.setActiveIndexValue(activeIndex);
        }
    }

    /**
     * Refill the hand with new cards until the max number of cards has been reached
     */
    drawCards() {
        const newCards = this.model.drawRandomCards(0);

        if(newCards) {
        //if (this.state.cards.length < this.props.maxCards) {
            //const newCardCount = this.props.maxCards - this.state.cards.length;
            //const cardDefinitions = pickRandomCardDefinitions(this.props.deck, newCardCount);

            // create a new array of cards, consisting of old and new cards
            /*const cards = [
                ...this.state.cards,
                ...cardDefinitions.map((definition) =>
                    CardCarouselComponent.createCard(definition, ANIMATIONS.drawCard)
                ),
            ];*/

            /*const cards = [
                ...this.state.cards,
                ...newCards.map((card) =>
                    CardCarouselComponent.createCard(card.definition, ANIMATIONS.drawCard)
                ),
            ];*/

            this.buttonPanelRef.current.setEnableDrawButton(false);

            /*this.setState({
                cards,
            });*/

            this.indicatorRef.current.setDataCount(this.model.getCards(0).length);
            this.carouselRef.current.addCards(newCards.map((card) =>
                        CardCarouselComponent.createCard(card.definition, ANIMATIONS.drawCard)
            ));
        }
    }

    toggleLock() {
        const isLocked = !this.buttonPanelRef.current.isLocked();
        this.carouselRef.current.setIsLocked(isLocked);
        this.buttonPanelRef.current.setIsLocked(isLocked);
    }

    getCard = (idx) => (this.carouselRef.current ? this.carouselRef.current.getCard(idx) : null);

    //getActiveCard = () => this.getCard(this.getActiveIndex());

    //getActiveIndex = () => this.state.model.players[0].hand.focusIdx;

    /*setActiveIndexValue(idx) {
        const player = this.state.model.players[0];
        const model = new CardGameModel([player.clone({ hand: player.hand.clone({ focusIdx: idx }) })]);

        this.setState({ model });
    }*/

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
