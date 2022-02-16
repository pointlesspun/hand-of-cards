import { ELEMENT_TYPES } from "../framework/element-types.js";
import { Transform } from "../framework/transform.js";
import { Vector3 } from "../framework/vector3.js";
import { ANIMATIONS } from "../animations.js";
import { SWIPE_DIRECTIONS } from "../framework/swipe-directions.js";
import { ANIMATION_EVENT_TYPE } from "../framework/animation-utilities.js";

import { CardComponent } from "./card-component.js";
import { CARD_EVENT_TYPES } from "./card-event.js";
import { CardCarouselDetails, CARD_CAROUSEL_EVENT_TYPES, CAROUSEL_EVENT_NAME } from "./card-carousel-event.js";

/**
 * Internal class keeping track of the card references and initial properties
 * of the card.
 */
class CardProperties {
    static cardKeyCounter = 0;

    constructor(definition, startAnimation = null) {
        this.ref = React.createRef();
        this.key = `card-viewmodel-${CardProperties.cardKeyCounter}`;
        this.definition = definition;
        this.startAnimation = startAnimation;
        CardProperties.cardKeyCounter++;
    }
}

/**
 * Implements a carousel with game cards. ViewState properties:
 * 
 * - Cards: an array of cards created with the CardCarousel.create card method
 * - MediaConfig: configuration of the window and client and settings as how to perform the layout given these window
 *   and client settings.
 * - FocusIndex: which card currently has the focus
 * - CenterIndex: which card is currently at the center of the layout
 * - IsLocked: flag when if set the cards do not move as the player browses through the cards
 */
export class CardCarouselComponent extends React.Component {
    static createCard = (definition, startAnimation = null) => new CardProperties(definition, startAnimation);

    constructor(props) {
        super(props);

        const centerCardIndex = props.isLocked ? this.calculateCenterCard(props.cards.length) : props.focusIndex;

        this.ref = React.createRef();
        this.keyHandler = evt => this.handleKeyEvent(evt);
        this.cardEventHandler = evt => this.handleCardEvent(evt);

        this.animationCount = 0;

        this.state = {
            cards: props.cards,
            mediaConfig: props.mediaConfig,
            focusIndex: props.focusIndex,
            centerCardIndex,
            isLocked: props.isLocked,
        };
    }

    // --- React overrides --------------------------------------------------------------------------------------------

    render() {
        const config = this.state.mediaConfig;
        const innerHeight = config ? config.values.innerHeight : 1.0;

        const carouselProperties = {
            className: "carousel",
            ref: this.ref,
            // Use the tabIndex to listen for key events from the div in case the scope is not useGlobalEventScope
            tabIndex: this.props.useGlobalEventScope ? undefined : 0,
            style: {
                // take the height from the platform specific settings
                height: `${innerHeight * 100}%`,
            },
        };

        // need the inner part to clip the cards at the bottom
        // otherwise the cards may overlay the buttons in the control panel
        const childProperties = {
            className: "inner",
            key: `${carouselProperties.key}-inner`,
        };

        // only when a media configuration is known create the card elements
        // otherwise we have no information to base the transforms on
        const cardElements = config === null ? [] : this.renderCards(config);

        return React.createElement(
            ELEMENT_TYPES.DIV,
            carouselProperties,
            React.createElement(ELEMENT_TYPES.DIV, childProperties, cardElements)
        );
    }

    componentDidMount() {
        if (this.props.useGlobalEventScope) {
            globalThis.addEventListener("keyup", this.keyHandler);
        } else {
            this.ref.current.addEventListener("keyup", this.keyHandler);
        }
    }

    /**
     * Callback for when the component is about to be removed from the dom. Remove the listeners.
     */
    componentWillUnmount() {
        if (this.props.useGlobalEventScope) {
            globalThis.removeEventListener("keyup", this.keyHandler);
        } else {
            this.ref.current.removeEventListener("keyup", this.keyHandler);
        }
    }

    // --- Subcomponent rendering -------------------------------------------------------------------------------------

    renderCards = config =>
        this.state.cards.map((cardReference, index) =>
            React.createElement(CardComponent, {
                ref: cardReference.ref,
                key: cardReference.key,
                index,
                definition: cardReference.definition,
                animation: cardReference.startAnimation,
                eventHandler: this.cardEventHandler,
                hasFocus: this.state.focusIndex === index,
                mediaConfig: config,
                transform: this.calculateTransform(
                    config,
                    this.state.cards.length,
                    index,
                    this.state.focusIndex,
                    this.state.centerCardIndex,
                    false
                ),
            })
        );

    // --- Event handlers ---------------------------------------------------------------------------------------------

    addEventListener(signal, listener) {
        this.ref.current.addEventListener(signal, listener);
    }

    removeEventListener(signal, listener) {
        this.ref.current.removeEventListener(signal, listener);
    }

    /**
     * Utility method to dispatch an event
     * @param {*} detail
     */
    dispatchEvent(detailName, detailParameters) {
        this.ref.current.dispatchEvent(
            new CustomEvent(CAROUSEL_EVENT_NAME, {
                detail: new CardCarouselDetails(detailName, detailParameters),
                bubbles: true,
                cancelable: true,
                composed: false,
            })
        );
    }

    /**
     * Deal with keyboard input
     * @param {number} keyCode
     */
    handleKeyEvent(evt) {
        const keyCode = evt.keyCode;

        if (evt.type === "keyup") {
            // wait for the animations to finish, don't process events while animating (in the current implementation there's no clean way to deal with it)
            if (this.animationCount === 0) {
                if (this.handleKeyUp(keyCode)) {
                    evt.preventDefault();
                }
            }
        }
    }

    handleKeyUp(keyCode) {
        switch (keyCode) {
            case KeyCode.KEY_LEFT:
                if (this.state.focusIndex > 0) {
                    this.dispatchEvent(CARD_CAROUSEL_EVENT_TYPES.FOCUS, this.state.focusIndex - 1);
                }
                break;

            case KeyCode.KEY_RIGHT:
                if (this.state.focusIndex < this.state.cards.length) {
                    this.dispatchEvent(CARD_CAROUSEL_EVENT_TYPES.FOCUS, this.state.focusIndex + 1);
                }
                break;

            case KeyCode.KEY_UP:
                if (this.state.cards.length > 0 && !this.getCard(this.state.focusIndex).state.isSelected) {
                    this.dispatchEvent(CARD_CAROUSEL_EVENT_TYPES.SELECT, this.state.focusIndex);
                }
                break;

            case KeyCode.KEY_DOWN:
                if (this.state.cards.length > 0 && this.getCard(this.state.focusIndex).state.isSelected) {
                    this.dispatchEvent(CARD_CAROUSEL_EVENT_TYPES.DESELECT, this.state.focusIndex);
                }
                break;

            case KeyCode.KEY_DELETE:
                if (this.state.cards.length > 0 && this.countSelectedCards() > 0) {
                    this.dispatchEvent(CARD_CAROUSEL_EVENT_TYPES.REMOVE_SELECTED_CARDS);
                }
                break;

            case KeyCode.KEY_RETURN:
                this.dispatchEvent(CARD_CAROUSEL_EVENT_TYPES.DRAW_CARDS);
                break;

            case KeyCode.KEY_SPACE:
                if (this.countSelectedCards() > 0) {
                    this.dispatchEvent(CARD_CAROUSEL_EVENT_TYPES.PLAY_SELECTED_CARDS);
                }
                break;

            default:
                // not handled
                return false;
        }

        // code was handled
        return true;
    }

    handleCardEvent(evt) {
        switch (evt.type) {
            case CARD_EVENT_TYPES.ANIMATION:
                this.handleAnimation(evt.parameters);
                break;
            case CARD_EVENT_TYPES.TAP:
                this.handleTap(evt.card);
                break;
            case CARD_EVENT_TYPES.SWIPE:
                this.handleSwipe(evt.parameters.detail.dir, evt.card.state.index);
                break;
            case CARD_EVENT_TYPES.FOCUS:
                this.dispatchEvent(CARD_CAROUSEL_EVENT_TYPES.HOVER, evt.card.state.index);
                break;
        }
    }

    /**
     * Handle animation start / end events
     * @param {AnimationEvent} evt
     */
    handleAnimation(evt) {
        if (evt.type === ANIMATION_EVENT_TYPE.START) {
            this.animationCount++;
        } else if (evt.type === ANIMATION_EVENT_TYPE.END) {
            this.animationCount--;

            if (evt.animation.name === ANIMATIONS.playCard.name) {
                // mark the card as deleted, we need to do this asap and not delay until removeSelectedItems
                // otherwise one last frame of rendering may kick in and we end up with weird glitches
                evt.source.setDeleted();
            }

            // no more outstanding animations ?
            if (this.animationCount === 0) {
                this.dispatchEvent(CARD_CAROUSEL_EVENT_TYPES.ANIMATION_COMPLETE, evt.animation);
            }
        }
    }

    handleTap(card) {
        // wait for the animations to finish, don't process events while animating (in the current implementation there's no clean way to deal with it)
        if (this.animationCount === 0) {
            const idx = card.state.index;

            if (idx !== this.state.focusIndex) {
                this.dispatchEvent(CARD_CAROUSEL_EVENT_TYPES.FOCUS_AND_SELECT, idx);
            } else {
                // toggle
                if (card.state.isSelected) {
                    this.dispatchEvent(CARD_CAROUSEL_EVENT_TYPES.DESELECT, idx);
                } else {
                    this.dispatchEvent(CARD_CAROUSEL_EVENT_TYPES.SELECT, idx);
                }
            }
        }
    }

    /**
     * Deal with swipes generated with a touch device
     * @param {*} direction
     */
    handleSwipe(direction, index) {
        // wait for the animations to finish, don't process events while animating (in the current implementation there's no clean way to deal with it)
        if (this.animationCount === 0) {
            switch (direction) {
                case SWIPE_DIRECTIONS.UP:
                    this.handleSwipeUp(index);
                    break;

                case SWIPE_DIRECTIONS.RIGHT:
                    this.dispatchEvent(CARD_CAROUSEL_EVENT_TYPES.FOCUS, this.state.focusIndex - 1);
                    break;

                case SWIPE_DIRECTIONS.DOWN:
                    this.handleSwipeDown(index);
                    break;

                case SWIPE_DIRECTIONS.LEFT:
                    this.dispatchEvent(CARD_CAROUSEL_EVENT_TYPES.FOCUS, this.state.focusIndex + 1);
                    break;
            }
        }
    }

    handleSwipeUp(index) {
        // are there any cards in hand ?
        if (this.state.cards.length > 0) {
            // which card was swiped
            if (index !== undefined) {
                //If the card was already selected, and the user swipes up again play the cards
                if (this.getCard(index).state.isSelected) {
                    this.dispatchEvent(CARD_CAROUSEL_EVENT_TYPES.PLAY_SELECTED_CARDS);
                } else {
                    this.dispatchEvent(CARD_CAROUSEL_EVENT_TYPES.SELECT, index);
                }
            }
        }
    }

    handleSwipeDown(index) {
        if (this.state.cards.length > 0) {
            // which card was swiped
            if (index !== undefined) {
                this.dispatchEvent(CARD_CAROUSEL_EVENT_TYPES.DESELECT, index);
            }
        }
    }

    // --- State mutations & queries ----------------------------------------------------------------------------------

    setCards(cards, focusIndex) {
        const centerIndex = this.state.isLocked ? this.calculateCenterCard(cards.length) : focusIndex;

        this.setState({
            cards,
            focusIndex,
            centerCardIndex: centerIndex,
        });

        cards.forEach((card, idx) => {
            const cardRef = card.ref.current;

            if (cardRef) {
                cardRef.setIndex(idx);
                cardRef.setHasFocus(idx === focusIndex);
                this.updateCardTransform(cardRef, idx, focusIndex, centerIndex);
            }
        });
    }

    /**
     * 
     * @param {[number]} cardIndices is an array of indices mapping to card.state.index
     * @param {number} focusIndex new focus index after the cards have been removed
     */
    removeCards(cardIndices, focusIndex) {
        this.setCards( this.state.cards.filter( card => cardIndices.findIndex(card.current.state.index) >= 0)), focusIndex);
    }

    setMediaConfig(mediaConfig) {
        this.setState({ mediaConfig });
        this.forEachCard(card =>
            this.updateCardTransform(card, card.getIndex(), this.state.focusIndex, this.state.centerCardIndex)
        );
    }

    /**
     * 
     * @param {number} focusIndex  which card should get focus
     * @param {boolean} updateCenterCard if true (default) also recalculates the center card. False makes sense
     * for cases like mouse over. 
     */
    setFocusIndex(focusIndex, updateCenterCard = true) {
        if (updateCenterCard) {
            const centerCardIndex = this.state.isLocked
                ? this.calculateCenterCard(this.state.cards.length)
                : focusIndex;

            this.setState({ focusIndex, centerCardIndex });
            this.forEachCard(card => {
                const cardIndex = card.getIndex();
                this.updateCardTransform(card, cardIndex, focusIndex, centerCardIndex);
                card.setHasFocus(cardIndex === focusIndex);
            });
        } else {
            this.setState({ focusIndex });
            this.forEachCard(card => {
                const cardIndex = card.getIndex();
                this.updateCardTransform(card, cardIndex, focusIndex, this.state.centerCardIndex);
                card.setHasFocus(cardIndex === focusIndex);
            });
        }
    }

    getCard = idx => (idx >= 0 && idx < this.state.cards.length ? this.state.cards[idx].ref?.current : null);

    /**
     * Toggle the lock mode
     */
     setIsLocked(isLocked) {
        const centerIndex = isLocked ? this.calculateCenterCard(this.state.cards.length) : this.state.focusIndex;

        this.setState({
            isLocked,
            centerCardIndex: centerIndex,
        });

        this.forEachCard(card => this.updateCardTransform(card, card.getIndex(), this.state.focusIndex, centerIndex));
    }

    isLocked = () => this.state.isLocked;

    setCardSelected(idx, isSelected) {
        const card = this.getCard(idx);

        // does the state change ?
        if (card.state.isSelected != isSelected) {
            card.setSelected(isSelected);
            this.updateCardTransform(card, idx, this.state.focusIndex, this.state.centerCardIndex);
        }
    }

    isCardSelected = idx => this.getCard(idx).state.isSelected;

    // --- Utility methods  -------------------------------------------------------------------------------------------

    updateCardTransform(card, idx, focusIndex, centerIndex) {
        card.setTransform(
            this.calculateTransform(
                this.state.mediaConfig,
                this.state.cards.length,
                idx,
                focusIndex,
                centerIndex,
                card.state.isSelected
            )
        );
    }

    /**
     *
     * @param {*} animation
     * @param {boolean} immediatelyFoldCards  if set to true the remaining cards will fold back now. If false, they will
     * fold after the animation is complete and the cards are deleted.
     */
    playSelectedCards(focusIndex, animation, immediatelyFoldCards) {
        let idx = 0;
        const cardsLeft = this.state.cards.length - this.countSelectedCards();
        const centerIndex = this.state.isLocked ? this.calculateCenterCard(cardsLeft) : focusIndex;

        this.forEachCard(card => {
            if (card.state.isSelected) {
                card.setAnimation(animation);
            } else {
                if (immediatelyFoldCards) {
                    card.setIndex(idx);
                    this.updateCardTransform(card, idx, focusIndex, centerIndex);
                }
                idx++;
            }
        });

        if (immediatelyFoldCards) {
            this.setState({focusIndex});
        }
    }
   

    /**
     * Count the number of cards that have been selected.
     * @returns {number} number of cards selected
     */
    countSelectedCards() {
        let result = 0;
        for (let i = 0; i < this.state.cards.length; ++i) {
            if (this.getCard(i)?.isSelected()) {
                result++;
            }
        }
        return result;
    }

    /**
     * Utility to iterate over the state's cards without having to deref the cards
     * @param {*} f a function of the form (card, index) where card is the card component
     */
    forEachCard(f) {
        this.state.cards.forEach((card, index) => {
            if (card.ref.current) {
                f(card.ref.current, index);
            }
        });
    }


    calculateCenterCard = cardCount => (cardCount % 2 == 0 ? cardCount / 2 - 0.5 : Math.floor(cardCount / 2));

    /**
     * Calculates the transformation (translation, rotation, scale) of the card on screen
     * @private
     * @param {PlatformConfiguration} config contains the settings relevant to the current media/device
     * @param {number} cardCount represents to the total number of cards in hand
     * @param {number} focusIndex index of the card the player is currently looking at
     * @param {number} centerCardIndex index of the card which is the center of the hand
     * @param {boolean} isSelected indicates if the card is selected or not
     * @returns {Transform}
     */
    calculateTransform(config, cardCount, index, focusIndex, centerCardIndex, isSelected) {
        // short hand reference
        const values = config.values;

        // size of the div containing these cards
        const parentHeight = config.clientSize.height * values.innerHeight;

        // is the current card active (the one in the center which the user is working with) ?
        const hasFocus = index === focusIndex;

        // center of the parent x axis
        const parentCenterX = config.clientSize.width / 2;

        // how far is this card from the center cards ?
        const deltaCenterIdx = index - centerCardIndex;

        const maxDeltaIdx = Math.abs(deltaCenterIdx) / cardCount;

        // try to scale down items further away from the center somewhat more
        const itemScale = values.baseScale + values.dynamicScale * (1 - maxDeltaIdx);

        // if the item is selected raise the y position
        const itemSelectedOffset = isSelected ? values.ySelectedOffset : 0;

        // if the item is active raise the y position
        const itemActiveOffset = hasFocus ? values.yActiveOffset : 0;

        // move the card to the bottom of the parent
        const yOffset = parentHeight - values.cardHeight + values.yBaseOffset;

        // move the card further down, the further it is from the center card to produce a curved hand illusion
        const yOffsetWrtActive = hasFocus
            ? 0
            : Math.abs(deltaCenterIdx) * Math.abs(deltaCenterIdx) * values.yTranslation;

        const cardCenterX = values.cardWidth / 2;

        return new Transform(
            new Vector3(
                parentCenterX - cardCenterX + deltaCenterIdx * values.xTranslation,
                yOffset + itemSelectedOffset + itemActiveOffset + yOffsetWrtActive,
                // make sure the cards closer to the center overlap cards further away
                hasFocus ? 200 : 100 - Math.abs(deltaCenterIdx)
            ),
            new Vector3(itemScale, itemScale),
            hasFocus ? 0 : values.rotation * deltaCenterIdx
        );
    }
}
