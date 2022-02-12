// xxx to do extract the card carousel from the hand component

import { ELEMENT_TYPES } from "../framework/element-types.js";
import { CardComponent } from "./card-component.js";
import { Transform } from "../framework/transform.js";
import { Vector3 } from "../framework/vector3.js";
import { CARD_EVENT_TYPES } from "./card-event.js";
import { ANIMATIONS } from "../animations.js";
import { SWIPE_DIRECTIONS } from "../framework/swipe-directions.js";
import { ANIMATION_EVENT_TYPE } from "../framework/animation-utilities.js";

export const CAROUSEL_EVENT_NAME = "card-carousel-event";

export const CARD_CAROUSEL_EVENT_TYPES = {
  // focus on a certain card
  FOCUS: "focus",

  // hover over a card
  HOVER: "hover",

  // select a given card
  SELECT: "select",

  // focusses and selects a given card
  FOCUS_AND_SELECT: "focus-and-select",

  // deselect a given card
  DESELECT: "deselect",

  // remove the selected cards
  REMOVE_SELECTED_CARDS: "remove",

  // draw more cards
  DRAW_CARDS: "draw",

  // play the selected cards
  PLAY_SELECTED_CARDS: "play",

  // animation for draw or play has completed
  ANIMATION_COMPLETE: "animation-complete"
};

export class CardCarouselDetails {
  constructor(type, parameters) {
    this.type = type;
    this.parameters = parameters;
  }
}

export class CardCarousel extends React.Component {
  constructor(props) {
    super(props);

    const centerCardIndex = props.isLocked
      ? this.calculateCenterCard(props.cards.length)
      : props.activeIndex;

    this.ref = React.createRef();
    this.keyHandler = (evt) => this.handleKeyEvent(evt);
    this.cardEventHandler = (evt) => this.handleCardEvent(evt);

    this.animationCount = 0;

    this.state = {
      cards: props.cards,
      mediaConfig: props.mediaConfig,
      centerCardIndex,
      activeIndex: props.activeIndex,
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
      // to listen for key events in case the scope is local
      tabIndex: this.props.useGlobalEventScope === undefined ? undefined : 0,
      style: {
        // take the height from the platform specific settings
        height: `${innerHeight * 100}%`,
      },
    };

    // need the inner part to clip the cards at the bottom
    // otherwise the cards may overlay the buttons in the control panel
    const innerId = `${carouselProperties.key}-inner`;

    const childProperties = {
      className: "inner",
      key: innerId,
      id: innerId,
    };

    // only when a media configuration is known create the card elements
    // otherwise we have no information to base the transforms on
    const cardElements =
      config === null
        ? []
        : this.state.cards.map((cardReference, index) =>
            React.createElement(CardComponent, {
              ref: cardReference.ref,
              key: cardReference.key,
              index,
              keyReference: cardReference.key,
              definition: cardReference.definition,
              animation: cardReference.animation,
              eventHandler: this.cardEventHandler,
              hasFocus: this.state.activeIndex === index,
              mediaConfig: config,
              transform: this.calculateTransform(
                config,
                this.state.cards.length,
                index,
                this.state.activeIndex,
                this.state.centerCardIndex,
                false
              ),
            })
          );

    const innerChildren = React.createElement(
      ELEMENT_TYPES.DIV,
      childProperties,
      cardElements
    );

    return React.createElement(
      ELEMENT_TYPES.DIV,
      carouselProperties,
      innerChildren
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
   * Callback for when the componet is about to be removed from the dom. Remove the listeners.
   */
  componentWillUnmount() {
    if (this.props.useGlobalEventScope) {
      globalThis.removeEventListener("keyup", this.keyHandler);
    } else {
      this.ref.current.removeEventListener("keyup", this.keyHandler);
    }
  }

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
  dispatchEvent(detail) {
    this.ref.current.dispatchEvent(
      new CustomEvent(CAROUSEL_EVENT_NAME, {
        detail,
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
      // wait for the animations to finish
      if (this.animationCount === 0) {
        if (this.handleKeyUp(keyCode)) {
          evt.preventDefault();
        }
      }
    }
  }

  handleKeyUp(keyCode) {
    // wait for the animations to finish, don't process events while animating (in the current implementation there's no clean way to deal with it)
    if(this.animationCount > 0) {
      return;
    }

    switch (keyCode) {
      case KeyCode.KEY_LEFT:
        if (this.state.activeIndex > 0) {
          this.dispatchEvent(
            new CardCarouselDetails(
              CARD_CAROUSEL_EVENT_TYPES.FOCUS,
              this.state.activeIndex - 1
            )
          );
        }
        break;

      case KeyCode.KEY_RIGHT:
        if (this.state.activeIndex < this.state.cards.length) {
          this.dispatchEvent(
            new CardCarouselDetails(
              CARD_CAROUSEL_EVENT_TYPES.FOCUS,
              this.state.activeIndex + 1
            )
          );
        }
        break;

      case KeyCode.KEY_UP:
        if (
          this.state.cards.length > 0 &&
          !this.getCard(this.state.activeIndex).state.isSelected
        ) {
          this.dispatchEvent(
            new CardCarouselDetails(
              CARD_CAROUSEL_EVENT_TYPES.SELECT,
              this.state.activeIndex
            )
          );
        }
        break;

      case KeyCode.KEY_DOWN:
        if (
          this.state.cards.length > 0 &&
          this.getCard(this.state.activeIndex).state.isSelected
        ) {
          this.dispatchEvent(
            new CardCarouselDetails(
              CARD_CAROUSEL_EVENT_TYPES.DESELECT,
              this.state.activeIndex
            )
          );
        }
        break;

      case KeyCode.KEY_DELETE:
        if (this.state.cards.length > 0 && this.countSelectedCards() > 0) {
          this.emitEvent(
            new CardCarouselDetails(
              CARD_CAROUSEL_EVENT_TYPES.REMOVE_SELECTED_CARDS
            )
          );
        }
        break;

      case KeyCode.KEY_RETURN:
        this.dispatchEvent(
          new CardCarouselDetails(CARD_CAROUSEL_EVENT_TYPES.DRAW_CARDS)
        );
        break;

      case KeyCode.KEY_SPACE:
        if (this.state.cards.length > 0 && this.countSelectedCards() > 0) {
          this.dispatchEvent(
            new CardCarouselDetails(
              CARD_CAROUSEL_EVENT_TYPES.PLAY_SELECTED_CARDS
            )
          );
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
          this.dispatchEvent(
            new CardCarouselDetails(
              CARD_CAROUSEL_EVENT_TYPES.HOVER,
              evt.card.state.index
            )
          );
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
        this.dispatchEvent(
          new CardCarouselDetails(CARD_CAROUSEL_EVENT_TYPES.ANIMATION_COMPLETE, evt.animation)
        );
      }      
    }
  }

  handleTap(card) {
    // wait for the animations to finish, don't process events while animating (in the current implementation there's no clean way to deal with it)
    if (this.animationCount === 0) {
      
      const idx = card.state.index;

      if (idx !== this.state.activeIndex) {
        this.dispatchEvent(
          new CardCarouselDetails(CARD_CAROUSEL_EVENT_TYPES.FOCUS_AND_SELECT, idx)
        );
      } else {
        // toggle
        if (card.state.isSelected) {
          this.dispatchEvent(
            new CardCarouselDetails(CARD_CAROUSEL_EVENT_TYPES.DESELECT, idx)
          );
        } else {
          this.dispatchEvent(
            new CardCarouselDetails(CARD_CAROUSEL_EVENT_TYPES.SELECT, idx)
          );
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
          this.dispatchEvent(
            new CardCarouselDetails(
              CARD_CAROUSEL_EVENT_TYPES.FOCUS,
              this.state.activeIndex - 1
            )
          );
          break;

        case SWIPE_DIRECTIONS.DOWN:
          this.handleSwipeDown(index);
          break;

        case SWIPE_DIRECTIONS.LEFT:
          this.dispatchEvent(
            new CardCarouselDetails(
              CARD_CAROUSEL_EVENT_TYPES.FOCUS,
              this.state.activeIndex + 1
            )
          );
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
          this.dispatchEvent(
            new CardCarouselDetails(
              CARD_CAROUSEL_EVENT_TYPES.PLAY_SELECTED_CARDS
            )
          );
        } else {
          this.dispatchEvent(
            new CardCarouselDetails(CARD_CAROUSEL_EVENT_TYPES.SELECT, index)
          );
        }
      }
    }
  }

  handleSwipeDown(index) {
    if (this.state.cards.length > 0) {
      // which card was swiped
      if (index !== undefined) {
        this.dispatchEvent(
          new CardCarouselDetails(CARD_CAROUSEL_EVENT_TYPES.DESELECT, index)
        );
      }
    }
  }

  // --- State mutations & queries ----------------------------------------------------------------------------------

  setCards(cards, activeIndex) {
    const centerIndex = this.state.isLocked
      ? this.calculateCenterCard(cards.length)
      : activeIndex;

    this.setState({
      cards,
      activeIndex,
      centerCardIndex: centerIndex,
    });

    cards.forEach((card, idx) => {
      const cardRef = card.ref.current;

      if (cardRef) {
        cardRef.setIndex(idx);
        cardRef.setHasFocus(idx === activeIndex);
        this.updateCardTransform(cardRef, idx, activeIndex, centerIndex);
      }
    });
  }

  setMediaConfig = (mediaConfig) => {
    this.setState({ mediaConfig });
    this.forEachCard((card) =>
      this.updateCardTransform(
        card,
        card.getIndex(),
        this.state.activeIndex,
        this.state.centerCardIndex
      )
    );
  };

  setActiveIndex(activeIndex, updateCenterCard = true) {
    if (updateCenterCard) {
      const centerCardIndex = this.state.isLocked
        ? this.calculateCenterCard(this.state.cards.length)
        : activeIndex;

      this.setState({ activeIndex, centerCardIndex });
      this.forEachCard((card) => {
        this.updateCardTransform(
          card,
          card.getIndex(),
          activeIndex,
          centerCardIndex
        );
      });
    } else {
      this.setState({ activeIndex });
      this.forEachCard((card) => {
        this.updateCardTransform(
          card,
          card.getIndex(),
          activeIndex,
          this.state.centerCardIndex
        );
      });
    }
  }

  setActiveAndCenterIndices = (activeIndex, centerCardIndex) => {
    this.setState({ activeIndex, centerCardIndex });
    this.forEachCard((card) => {
      this.updateCardTransform(
        card,
        card.getIndex(),
        activeIndex,
        centerCardIndex
      );
    });
  };

  updateCardTransform(card, idx, activeIndex, centerIndex) {
    card.setTransform(
      this.calculateTransform(
        this.state.mediaConfig,
        this.state.cards.length,
        idx,
        activeIndex,
        centerIndex,
        card.state.isSelected
      )
    );

    card.setHasFocus(idx === activeIndex);
  }

  /**
   *
   * @param {*} animation
   * @param {boolean} immediatelyFoldCards  if set to true the remaining cards will fold back now. If false, they will
   * fold after the animation is complete and the cards are deleted.
   */
  playSelectedCards(activeIndex, animation, immediatelyFoldCards) {
    let idx = 0;
    const cardsLeft = this.state.cards.length - this.countSelectedCards();
    const centerIndex = this.state.isLocked
      ? this.calculateCenterCard(cardsLeft)
      : activeIndex;

    this.forEachCard((card) => {
      if (card.state.isSelected) {
        card.setAnimation(animation);       
      } else {
        if (immediatelyFoldCards) {
          card.setIndex(idx);
          this.updateCardTransform(card, idx, activeIndex, centerIndex);
        }
        idx++;
      }
    });

    if (immediatelyFoldCards) {
      this.setState({
        activeIndex,
      });
    }
  }

  getCard = (idx) =>
    idx >= 0 && idx < this.state.cards.length
      ? this.state.cards[idx].ref?.current
      : null;

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

  /**
   * Toggle the lock mode
   */
  setIsLocked(isLocked) {
    const centerIndex = isLocked
      ? this.calculateCenterCard(this.state.cards.length)
      : this.state.activeIndex;

    this.setState({
      isLocked,
      centerCardIndex: centerIndex,
    });

    this.forEachCard((card) =>
      this.updateCardTransform(
        card,
        card.getIndex(),
        this.state.activeIndex,
        centerIndex
      )
    );
  }

  isLocked = () => this.state.isLocked;

  calculateCenterCard = (cardCount) =>
    cardCount % 2 == 0 ? cardCount / 2 - 0.5 : Math.floor(cardCount / 2);

  setCardSelected(idx, isSelected) {
    const card = this.getCard(idx);

    // does the state change ?
    if (card.state.isSelected != isSelected) {
      card.setSelected(isSelected);
      this.updateCardTransform(
        card,
        idx,
        this.state.activeIndex,
        this.state.centerCardIndex
      );
    }
  }

  isCardSelected = (idx) => this.getCard(idx).state.isSelected;

  /**
   * Calculates the transformation (translation, rotation, scale) of the card on screen
   * @private
   * @param {PlatformConfiguration} config contains the settings relevant to the current media/device
   * @param {number} cardCount represents to the total number of cards in hand
   * @param {number} activeIndex index of the card the player is currently looking at
   * @param {number} centerCardIndex index of the card which is the center of the hand
   * @param {boolean} isSelected indicates if the card is selected or not
   * @returns {Transform}
   */
  calculateTransform(
    config,
    cardCount,
    index,
    activeIndex,
    centerCardIndex,
    isSelected
  ) {
    // short hand reference
    const values = config.values;

    // size of the div containing these cards
    const parentHeight = config.clientSize.height * values.innerHeight;

    // is the current card active (the one in the center which the user is working with) ?
    const hasFocus = index === activeIndex;

    // center of the parent x axis
    const parentCenterX = config.clientSize.width / 2;

    // how far is this card from the center cards ?
    const deltaCenterIdx = index - centerCardIndex;

    const maxDeltaIdx = Math.abs(deltaCenterIdx) / cardCount;

    // try to scale down items further away from the center somewhat more
    const itemScale =
      values.baseScale + values.dynamicScale * (1 - maxDeltaIdx);

    // if the item is selected raise the y position
    const itemSelectedOffset = isSelected ? values.ySelectedOffset : 0;

    // if the item is active raise the y position
    const itemActiveOffset = hasFocus ? values.yActiveOffset : 0;

    // move the card to the bottom of the parent
    const yOffset = parentHeight - values.cardHeight + values.yBaseOffset;

    // move the card further down, the further it is from the center card to produce a curved hand illusion
    const yOffsetWrtActive = hasFocus
      ? 0
      : Math.abs(deltaCenterIdx) *
        Math.abs(deltaCenterIdx) *
        values.yTranslation;

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
