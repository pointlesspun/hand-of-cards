'use strict';

/**
 * Main component which takes a number of cards and implements the interactions with those 
 * cards using a carousel.
 */

import "../framework/math-extensions.js";
import { ELEMENT_TYPES } from "../framework/element-types.js";
import { PlatformConfiguration } from "../framework/media-configuration.js";
import { ANIMATION_EVENT_TYPE } from "../framework/animation-utilities.js";

import { CARD_EVENT_TYPES } from "./card-event.js";
import { CardComponent, CARD_KEY_PREFIX } from "./card-component.js";
import { pickRandomCards } from "./deck.js";
// todo: fix this dependency
import { ANIMATIONS } from "../animations.js";

const SWIPE_DIRECTIONS = {
  UP : 'up',
  RIGHT : 'right',
  DOWN: 'down',
  LEFT: 'left'
}

// number of pixels of movement allowed before a tap becomes a swipe
const TAP_THRESHOLD = 10;

/**
 * What happens when the user selects a card when the max cards have been reached
 */
export const MAX_SELECTION_REACHED_POLICY = {
  /** prevent the user from selecting more cards (default) */
  BLOCK: 'block',

  /** de-select the card selected first, then select the current card */
  CYCLE_OLDEST: 'cycle-oldest'
};

class CardReference {
  constructor(ref, key, definition, animation = null) {
    this.ref = ref;
    this.key = key;
    this.definition = definition;
    this.animation = animation;
  }
}

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
    this.cardEventHandler = (evt) => this.handleCardEvent(evt);
    
    // transient properties
    this.ref = React.createRef();
    this.animationCount = 0;

    // state properties
    const activeIndex = props.initialIndex ?? 0;
    const cardCount = props.hand ? props.hand.length : 0;
    const centerCardIndex = props.isLocked ? Math.floor(cardCount / 2) : activeIndex;

    this.state = {
      activeIndex,
      centerCardIndex,
      // is unknown until we have a ref
      mediaConfig: null,
      isLocked: props.isLocked,      
      cardKeyCounter: cardCount,
      cards: props.hand ? props.hand.map((definition, idx) => new CardReference(React.createRef(), `${CARD_KEY_PREFIX}-${idx}`, definition )) : undefined
    };
  }
  /**
   * React-render component
   * @returns a react.element
   */
  render() {
    const properties = {
      className: "hand",
      ref: this.ref,
      onKeyUp : (evt) => {
        this.handleKeyEvent(evt.keyCode);
      }
    };

    if (!this.state.cards) {
      return React.createElement(ELEMENT_TYPES.DIV, properties, "no items to display in the carousel...");
    }
    
    // Need to know the height of the component to do a proper layout, so until we have a reference,
    // we skip this render.
    if (this.ref.current) {     

      const children = [
        this.renderCarousel(this.state.mediaConfig),
        this.renderControlBar(this.state.mediaConfig),        
      ];

      return React.createElement(ELEMENT_TYPES.DIV, properties, children);
    } else {
      return React.createElement(ELEMENT_TYPES.DIV, properties);
    }
  }

  /**
   * Callback after the component was added to the dom. Use this opportunity to hook up the listeners.
   */
  componentDidMount() {
  
    // ref https://stackoverflow.com/questions/8916620/disable-arrow-key-scrolling-in-users-browser/8916697
    const keyhandlerOptions = {
      capture: true,   
      passive: false   
    };

    window.addEventListener('keyup', this.keyHandler);
    window.addEventListener('keydown', this.keyHandler, keyhandlerOptions);
    window.addEventListener('resize', this.resizeHandler);

    // after the initial mount we've got a ref and media config 
    this.handleResize();
  }

  /**
   * Callback for when the componet is about to be removed from the dom. Remove the listeners.
   */
  componentWillUnmount() {
    window.removeEventListener('swiped', this.swipeHandler);
    window.removeEventListener('keyup', this.keyHandler);
    window.removeEventListener('keydown', this.keyHandler);
    window.removeEventListener('resize', this.resizeHandler);
  }

  /**
   * Deal with swipes generated with a touch device
   * @param {*} direction 
   */
  handleSwipe( direction, index ) {

    // wait for the animations to finish
    if (this.animationCount === 0) {
      switch (direction) {
        case SWIPE_DIRECTIONS.UP:
            // are there any cards in hand ?
            if (this.state.cards.length > 0) {             
              // which card was swiped
              if (index !== undefined) {
                //If the card was already selected, and the user swipes up again play the cards
                if (this.getCard(index).state.isSelected) {
                  this.playSelectedCards();
                } else {
                  this.toggleSelected(index);
                }
              }
            }
            break;

        case SWIPE_DIRECTIONS.RIGHT:
          this.previousItem();
          break;
    
        case SWIPE_DIRECTIONS.DOWN:
          if (this.state.cards.length > 0) {             
            // which card was swiped
            if (index !== undefined) {
              this.selectItem(index, false);
            }
          }
          break;
        

        case SWIPE_DIRECTIONS.LEFT:
          this.nextItem();
          break;
      }
    }
  }

  /**
   * Deal with keyboard input
   * @param {number} keyCode 
   */
  handleKeyEvent(evt) {
    const keyCode = evt.keyCode;
    
    if (evt.type === 'keyup') {
      // wait for the animations to finish
      if (this.animationCount === 0) {
        switch (keyCode) {
          case KeyCode.KEY_LEFT:
            this.previousItem();
            evt.preventDefault();
            break;
          case KeyCode.KEY_RIGHT:
            this.nextItem();
            evt.preventDefault();
            break;
          case KeyCode.KEY_UP:
            
          if (this.state.cards.length > 0 && !this.getActiveCard().state.isSelected) {
              this.toggleActiveItemSelected();
            }

            evt.preventDefault();
            break;
          case KeyCode.KEY_DOWN:
            if (this.getActiveCard().state.isSelected) {
              this.selectActiveItem(false);
            }
            
            evt.preventDefault();
            break;  
          case KeyCode.KEY_DELETE:
            this.removeSelectedItems();
            evt.preventDefault();
            break;
          case KeyCode.KEY_RETURN:
            this.refill();
            evt.preventDefault();
            break;
          case KeyCode.KEY_SPACE:
            this.playSelectedCards();
            evt.preventDefault();
            break;
        }
      } 
    } else if (evt.type === 'keydown') {
      switch (keyCode) {
        case KeyCode.KEY_LEFT:
        case KeyCode.KEY_RIGHT:
        case KeyCode.KEY_UP:
        case KeyCode.KEY_DOWN:
        case KeyCode.KEY_DELETE:
        case KeyCode.KEY_RETURN:
        case KeyCode.KEY_SPACE:
          evt.preventDefault();
          break;
      }
    }
  }

  /**
   * Callback from when the window resizes and we have to re render
   */
  handleResize() {
    const mediaConfig = this.props.getLayoutConfiguration(this.ref);
    this.setState({mediaConfig});
    this.forEachCard(card => card?.setMediaConfig(mediaConfig));
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
        if (this.animationCount === 0) {
          this.setActiveIndex(evt.card.state.index);
        }
        break;
    }
  }

  handleTap(source) {
    // don't interact when animating.
    if (!this.animationCount) {
      if (source.state.index !== this.state.activeIndex) {
        // needs to be in this order
        this.toggleSelected(source.state.index);
        this.setActiveIndex(source.state.index);
      } else {
        this.toggleActiveItemSelected();
      }
    }
  }
  
  /**
   * Handle animation start / end events
   * @param {*} evt 
   */
  handleAnimation(evt) {
    if (evt.type === ANIMATION_EVENT_TYPE.END) {
      this.animationCount--;

      if (evt.animation.name === ANIMATIONS.playCard.name) {
        evt.source.setDeleted();
      
        // no more outstanding animations ?
        if (this.animationCount === 0) {
          this.removeSelectedItems();
        } 
      }
    }
  }

  setActiveIndex(idx) {
    const newState = {
      ...this.state,
      activeIndex: Math.clamp(idx, 0, this.state.cards.length),
    };

    this.setState(newState);
    this.forEachCard(card => card.setActiveIndex(idx));
  }

  moveActiveItem(delta) {
    this.setState({
      activeIndex: Math.clamp(this.state.activeIndex + delta, 0, this.state.cards.length),
      centerCardIndex: this.state.isLocked ? this.state.centerCardIndex : Math.clamp(this.state.centerCardIndex + delta, 0, this.state.cards.length)
    });

    this.forEachCard(card => card.setActiveAndCenterIndices(this.state.activeIndex, this.state.centerCardIndex));
  }

  previousItem() {
    this.moveActiveItem(-1);
  }

  nextItem() {
    this.moveActiveItem(1);
  }

  selectActiveItem(isItemSelected) {
    this.selectItem(this.state.activeIndex, isItemSelected);
  }

  selectItem(idx, isSelected) {
  
    if (!isSelected || this.canSelectMoreCards()) {
      const currentCard = this.getCard(idx);

      // does the state change ?
      if (currentCard.state.isSelected != isSelected) {
        currentCard.setSelected(isSelected);
        // the indicators may need to be redrawn as well as the buttons
        this.forceUpdate();
      }
    }
  }

  canSelectMoreCards() {
    // any cards to select ?
    return this.state.cards.length > 0      
      && ( //if negative there is no limit  
           this.props.maxSelectedCards < 0 
          // can still select more cards ?
          || this.countSelectedCards() < this.props.maxSelectedCards);
  }

  removeSelectedItems() {  
    if (this.state.cards.length > 0) {
      const cards = this.state.cards.filter(card => !card.ref.current.state.isSelected);
      const activeIndex = Math.min(Math.max(0, cards.length-1), this.state.activeIndex);
      const newCenterCardIndex = this.state.isLocked ? Math.floor(cards.length / 2) : activeIndex;

      cards.forEach((card, idx) => {
        card.ref.current.setIndex(idx);
        card.ref.current.setActiveAndCenterIndices(activeIndex, newCenterCardIndex);
      });   

      this.setState({
        activeIndex,
        centerCardIndex: newCenterCardIndex,
        cards
      });           
    }
  }

  playSelectedCards() {  
    if (this.state.cards.length > 0) {
      // if set to true the remaining cards will fold back now. If false, they will
      // fold after the animation is complete and the cards are deleted.
      const immediatelyFoldCards = true;
      
      this.animationCount = 0;

      let idx = 0;
      const cardsLeft = this.state.cards.length - this.countSelectedCards();
      const activeIndex = Math.min(Math.max(0, cardsLeft-1), this.state.activeIndex);
      const centerCardIndex = this.state.isLocked ? Math.floor(cardsLeft / 2) : activeIndex;

      this.forEachCard(card => {
        if (card.state.isSelected) {
          this.animationCount++;
          card.setAnimation(ANIMATIONS.playCard);
        } else {
          if (immediatelyFoldCards) {
            card.setIndex(idx);
            card.setActiveAndCenterIndices(activeIndex, centerCardIndex);
          }
          idx++;
        }
      });

      if (immediatelyFoldCards) {
        this.setState({
          activeIndex,
          centerCardIndex
        }); 
      }    
    }
  }

  /**
   * Refill the hand with new cards until the max number of cards has been reached
   */
  refill() {
    if (this.state.cards.length < this.props.maxCards) {
      
      const newCardCount = this.props.maxCards - this.state.cards.length;
      const cardDefinitions = pickRandomCards(this.props.deck, newCardCount);
      const newCenterCard = this.state.isLocked ? Math.floor(this.props.maxCards / 2) : this.state.centerCardIndex;

      this.forEachCard( card => {
        card.setCenterIndex(newCenterCard);
        card.setCardCount(cardDefinitions.length);
      });

      // create a new array of cards, consisting of old and new cards
      const cards = [
        ...this.state.cards, 
        ...cardDefinitions.map( (definition, idx) => 
          new CardReference( 
            React.createRef(), 
            `${CARD_KEY_PREFIX}-${this.state.cardKeyCounter + idx}`, 
            definition,
            ANIMATIONS.drawCard)
      )];

      this.animationCount = cardDefinitions.length;
      
      this.setState({
        cardKeyCounter: this.state.cardKeyCounter + newCardCount,
        centerCardIndex: newCenterCard,
        cards
      });
    }
  }

  toggleActiveItemSelected() {   
      this.toggleSelected(this.state.activeIndex);
  }

  toggleSelected(idx) {   
    if (this.state.activeIndex < this.state.cards.length) {
      const isSelected = this.getCard(idx).state.isSelected;
      if (isSelected || this.canSelectMoreCards()) {
        this.selectItem(idx, !isSelected);
        // can we deselect the oldest ?
      } else if ( this.props.maxCardsReachedPolicy === MAX_SELECTION_REACHED_POLICY.CYCLE_OLDEST) {
        const firstSelectedCard = this.state.cards.filter(card => card.ref.current.state.isSelected).reduce( 
            (card, prev) => prev.ref.current.state.lastUpdate < card.ref.current.state.lastUpdate ? prev : card);
         
        // deselect the oldest/first selected card
        this.selectItem(firstSelectedCard.ref.current.state.index, false);

        // select the current
        this.selectItem(idx, true);    
      }
    }
  }

  toggleLock() {   
    const newCenterIndex = !this.state.isLocked ? Math.floor(this.state.cards.length / 2) : this.state.activeIndex;
    this.setState({
      isLocked: !this.state.isLocked,
      centerCardIndex: newCenterIndex,
    });

    this.forEachCard( card => card.setCenterIndex(newCenterIndex));
  }

  getCard(idx) {
    return this.state.cards[idx].ref.current;
  }
  
  getActiveCard() {
    return this.state.cards[this.state.activeIndex].ref.current;
  }

  forEachCard( f ) {
    this.state.cards.forEach( (card, index) => f(card.ref.current, index));
  }

  /**
   * Count the number of cards that have been selected.
   * @returns number
   */
  countSelectedCards() {
    let result = 0;
    for (let i = 0; i < this.state.cards.length; ++i) {
      if (this.getCard(i)?.state.isSelected) {
        result++;
      }
    }
    return result;
  }

  /**
   * 
   * @param {PlatformConfiguration} config used to layout the cards appropriate for the current platform/medium (laptop/desktop/tablet/phone...)
   * @returns 
   */
  renderCarousel(config) {
    
    const carouselProperties = {
        key: "main-carousel",
        className : "carousel",
        style: {
          // take the height from the platform specific settings
          height: `${config.values.innerHeight*100}%` 
        }
    };

    const innerId = `${carouselProperties.key}-inner`;
    const childProperties = {
        className:"inner",
        key: innerId,
        id: innerId,
    };
  
    const cardElements = this.state.cards.map( (cardReference, index) => 
      React.createElement(CardComponent, {
        ref: cardReference.ref,
        key: cardReference.key, 
        keyReference: cardReference.key,
        definition: cardReference.definition, 
        index,      
        animation : cardReference.animation,
        eventHandler: this.cardEventHandler,
        centerIndex: this.state.centerCardIndex, 
        activeIndex: this.state.activeIndex,
        cardCount: this.state.cards.length,
        mediaConfig: this.state.mediaConfig
      }));

    const innerChildren = React.createElement(ELEMENT_TYPES.DIV, childProperties, cardElements);

    return React.createElement(ELEMENT_TYPES.DIV, carouselProperties, innerChildren);
}

renderControlBar(config) { 
  const properties = {
    key: "controlbar",
    style: {
      width : "100%",
      height: `${(1.0 - config.values.innerHeight) * 100}%`,
      overflow: "hidden"
    }
  };

  const statusText = `${config.name} ${config.screenSize.width}x${config.screenSize.height}`;

  return React.createElement(ELEMENT_TYPES.DIV, properties, [
    this.createIndicators(this.state.cards),
    this.createButtons(),
    React.createElement(ELEMENT_TYPES.DIV, {key: "device-description", className: "platform-context"}, statusText)
  ]);
}

 /**
   * 
   * @private
   * @param {*} keyPrefix 
   * @param {*} callback 
   * @param {*} activeIndex 
   * @param {*} cards 
   * @returns 
   */
  createIndicatorItems = (callback, activeIndex, cards) =>
    cards.map((card, index) =>     
        React.createElement(ELEMENT_TYPES.DIV, { 
          key: `indicator-${index}`,
          className : `indicator ${index === activeIndex ? "indicator-active" : ""} ${card.ref.current?.state.isSelected ? "indicator-selected" : ""}`,
          onClick : () => callback(index)
        })
    );

    /**
     * @private
     * @returns 
     */
  createIndicators(cards) {
    const properties = {
      key: "indicators",
      className: "indicators",
    };

    const children = this.createIndicatorItems(
      (idx) => this.setActiveIndex(idx),
      this.state.activeIndex, 
      cards
    );

    return React.createElement(ELEMENT_TYPES.DIV, properties, children);
  }

  createButtons() {

    const refillButtonEnabled = this.ref.current && this.state.cards.length < this.props.maxCards;

    const refreshButton = React.createElement(ELEMENT_TYPES.DIV, {
      key: "refresh-button",
      className: `button-panel-button refill-button ${refillButtonEnabled ? ""  : "button-panel-button-disabled"}`,
      onClick: () => this.refill()
    });

    const lockButton = React.createElement(ELEMENT_TYPES.DIV, {
      key: "lock-button",
      className: `button-panel-button ${this.state.isLocked ? "lock-button" : "lock-button-open"}`,
      onClick: () => {
        this.toggleLock();
      }
    });

    const playButtonEnabled = this.ref.current && this.countSelectedCards() > 0;

    const playButton = React.createElement(ELEMENT_TYPES.DIV, {
      key: "play-button",
      className: `button-panel-button play-button ${playButtonEnabled ? ""  : "button-panel-button-disabled"}`,
      onClick: () => this.playSelectedCards()
    });

    return React.createElement(ELEMENT_TYPES.DIV, {
      key: "button-panel",
      className: "button-panel"
    }, [playButton, refreshButton, lockButton]);
  }

}
