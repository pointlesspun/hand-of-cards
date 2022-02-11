// xxx to do extract the card carousel from the hand component

import { ELEMENT_TYPES } from "../framework/element-types.js";
import { CardComponent } from "./card-component.js";
import { Transform } from "../framework/transform.js";
import { Vector3 } from "../framework/vector3.js";


export class CardCarousel extends React.Component {
  constructor(props) {
    super(props);

    const centerCardIndex = props.isLocked
      ? this.calculateCenterCard(props.cards.length)
      : props.activeIndex;

    this.state = {
      cards: props.cards,
      mediaConfig: props.mediaConfig,
      eventHandler: props.eventHandler,
      centerCardIndex,
      activeIndex: props.activeIndex,
      isLocked: props.isLocked,
    };
  }

  render() {
    const config = this.state.mediaConfig;

    const carouselProperties = {
      className: "carousel",
      style: {
        // take the height from the platform specific settings
        height: `${config.values.innerHeight * 100}%`,
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

    const cardElements = this.state.cards.map((cardReference, index) =>
      React.createElement(CardComponent, {
        ref: cardReference.ref,
        key: cardReference.key,
        keyReference: cardReference.key,
        definition: cardReference.definition,
        transform: this.calculateTransform(
          this.state.mediaConfig,
          this.state.cards.length,
          index,
          this.state.activeIndex,
          this.state.centerCardIndex,
          this.state.activeIndex === index
        ),
        index,
        animation: cardReference.animation,
        eventHandler: this.state.eventHandler,
        hasFocus: this.state.activeIndex === index,
        mediaConfig: this.state.mediaConfig,
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

  setCardEventHandler = (eventHandler) => this.setState({ eventHandler });

  setActiveIndex(activeIndex, updateCenterCard = true) {
    if (updateCenterCard) {
      const centerIndex = this.state.isLocked
        ? this.calculateCenterCard(this.state.cards.length)
        : activeIndex;

      this.setState({ activeIndex, centerIndex });
      this.forEachCard((card) => {
        this.updateCardTransform(
          card,
          card.getIndex(),
          activeIndex,
          centerIndex
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
        activeIndex === card.getIndex()
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
    this.state.cards.forEach((card, index) => f(card.ref.current, index));
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
      ));
  }

  isLocked = () => this.state.isLocked;

  calculateCenterCard = (cardCount) =>
    cardCount % 2 == 0 ? cardCount / 2 - 0.5 : Math.floor(cardCount / 2);

  setCardSelected(idx, isSelected) {
    const currentCard = this.getCard(idx);

    // does the state change ?
    if (currentCard.state.isSelected != isSelected) {
      currentCard.setSelected(isSelected);
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
    const isActive = index === activeIndex;

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
    const itemActiveOffset = isActive ? values.yActiveOffset : 0;

    // move the card to the bottom of the parent
    const yOffset = parentHeight - values.cardHeight + values.yBaseOffset;

    // move the card further down, the further it is from the center card to produce a curved hand illusion
    const yOffsetWrtActive = isActive
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
        isActive ? 200 : 100 - Math.abs(deltaCenterIdx)
      ),
      new Vector3(itemScale, itemScale),
      isActive ? 0 : values.rotation * deltaCenterIdx
    );
  }
}
