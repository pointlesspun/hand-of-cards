// xxx to do extract the card carousel from the hand component

import { ELEMENT_TYPES } from "../framework/element-types.js";
import { CardComponent } from "./card-component.js";

// rename hand component to main ?
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
        index,
        animation: cardReference.animation,
        eventHandler: this.state.eventHandler,
        centerIndex: this.state.centerCardIndex,
        activeIndex: this.state.activeIndex,
        cardCount: this.state.cards.length,
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
    
    const centerIndex = this.state.isLocked? this.calculateCenterCard(cards.length) : activeIndex;

    this.setState({ 
      cards,
      activeIndex,
      centerIndex,
    });
    
    cards.forEach((card, idx) => {
      const cardRef = card.ref.current;

      if (cardRef) {
        cardRef.setIndex(idx);
        cardRef.setActiveAndCenterIndices(activeIndex, centerIndex);
        cardRef.setCardCount(cards.length);
      }
    });
  }

  setMediaConfig = (mediaConfig) => {
    this.setState({ mediaConfig });
    this.forEachCard((card) => card?.setMediaConfig(mediaConfig));
  };

  setCardEventHandler = (eventHandler) => this.setState({ eventHandler });
  
  setActiveIndex(activeIndex, updateCenterCard = true) {
    if (updateCenterCard) {
      const centerIndex = this.state.isLocked
          ? this.calculateCenterCard(this.state.cards.length)
          : activeIndex;

      this.setState({ activeIndex, centerIndex });
      this.forEachCard((card) => card.setActiveAndCenterIndices(activeIndex, centerIndex));
    } else {
      this.setState({ activeIndex });
      this.forEachCard((card) => card.setActiveIndex(activeIndex));
    }
  }

  setActiveAndCenterIndices = (activeIndex, centerCardIndex) => {
    this.setState({ activeIndex, centerCardIndex });
    this.forEachCard((card) => card.setActiveAndCenterIndices(activeIndex, centerCardIndex));
  };

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
          card.setActiveAndCenterIndices(activeIndex, centerIndex);
          card.setCardCount(cardsLeft);
        }
        idx++;
      }
    });

    if (immediatelyFoldCards) {
      this.setState({
        activeIndex
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

    this.forEachCard((card) => card.setCenterIndex(centerIndex));
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
 
}
