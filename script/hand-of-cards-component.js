'use strict';

/**
 * Main component which takes a number of cards and implements the interactions with those 
 * cards using a carousel.
 */

import { mathx } from "./mathx.js";
import { ELEMENT_TYPES } from "./element-types.js";
import { Card, CARD_KEY_PREFIX } from "./card.js";
import { pickRandomCards } from "./deck.js";
import { PlatformConfiguration } from "./media-configuration.js";
import { ANIMATIONS, ANIMATION_EVENT_TYPE } from "./animations.js";
import { Vector3 } from "./vector3.js";

const SWIPE_DIRECTIONS = {
  UP : 'up',
  RIGHT : 'right',
  DOWN: 'down',
  LEFT: 'left'
}

// number of pixels of movement allowed before a tap becomes a swipe
const TAP_THRESHOLD = 10;

export class HandOfCardsComponent extends React.Component {
  /**
   *
   * @param {*} props
   * @param {*[]} items
   */
  constructor(props) {
    super(props);

    this.state = {
      activeIndex: props.initialIndex || 0,
      isLocked: props.isLocked,
      cardKeyCounter: props.hand ? props.hand.length : 0,
      cards: props.hand ? props.hand.map( (definition, idx) => new Card(CARD_KEY_PREFIX + idx, definition, idx, false)) : null,
    };

    // event handlers
    this.swipeHandler = (evt) => this.handleSwipe(evt.detail.dir);
    this.keyHandler = (evt) => this.handleKeyEvent(evt.keyCode);
    this.resizeHandler = (evt) => this.handleResize();
    this.touchHandler = (evt) => this.handleTouch(evt);
    this.animationHandler = (evt) => this.handleAnimation(evt);
    
    // transient properties
    this.ref = React.createRef();
    this.isRefInitialized = false;
    this.animationCount = 0;
  }
  
  /**
   * React-render component
   * @returns a react.element
   */
  render() {

    const properties = {
      className: "hand-of-cards",
      ref: this.ref,
      onKeyUp : (evt) => {
        this.handleKeyEvent(evt.keyCode);
      }
    };

    if (!this.state.cards) {
      return React.createElement(ELEMENT_TYPES.DIV, properties, "no items to display in the carousel...");
    }
    
    // Need to know the width of the component to do a proper layout, so until we have a reference,
    // we skip this render.
    if (this.ref.current) {
      const config = this.props.getLayoutConfiguration(this.ref);
      const statusText = `${config.name} ${config.screenSize.width}x${config.screenSize.height}`;

      const children = [
        this.createCarousel(config),
        this.createIndicators(this.state.cards),
        React.createElement(ELEMENT_TYPES.DIV, {key: "device-description", className: "platform-context"}, statusText)
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
    document.addEventListener('swiped', this.swipeHandler);
    document.addEventListener('keyup', this.keyHandler);

    window.addEventListener('resize', this.resizeHandler);
    window.addEventListener('touchstart', this.touchHandler);
    window.addEventListener('touchend', this.touchHandler);

    // have we got the initial reference ?
    if (!this.isRefInitialized) {
      this.isRefInitialized = true;
      // now we have a dom element, we can render the component
      this.forceUpdate();
    }
  }

  /**
   * Callback for when the componet is about to be removed from the dom. Remove the listeners.
   */
  componentWillUnmount() {
    document.removeEventListener('swiped', this.swipeHandler);
    document.removeEventListener('keyup', this.keyHandler);

    window.removeEventListener('resize', this.resizeHandler);
    window.addEventListener('touchstart', this.touchHandler);
    window.addEventListener('touchend', this.touchHandler);
  }

  /**
   * Deal with swipes generated with a touch device
   * @param {*} direction 
   */
  handleSwipe( direction ) {

    // wait for the animations to finish
    if (this.animationCount === 0) {
      switch (direction) {
        case SWIPE_DIRECTIONS.UP:
            // are there any cards in hand ?
            if (this.state.cards.length > 0) {             
              //If the card was already selected, and the user swipes up again play the cards
              if (this.state.cards[this.state.activeIndex].isSelected) {
                this.playSelectedCards();
              } else {
                this.selectItem(true);
              }
            }
            break;

        case SWIPE_DIRECTIONS.RIGHT:
          this.previousItem();
          break;
    
        /** This is not a good idea on a phone as it may reload the page :-\ */
        /*case SWIPE_DIRECTIONS.DOWN:
          this.lockItem(false);
          break;
        */

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
  handleKeyEvent(keyCode) {
    // wait for the animations to finish
    if (this.animationCount === 0) {
      switch (keyCode) {
        case KeyCode.KEY_LEFT:
          this.previousItem();
          break;
        case KeyCode.KEY_RIGHT:
          this.nextItem();
          break;
        case KeyCode.KEY_UP:
          this.selectItem(true);
          break;
        case KeyCode.KEY_DOWN:
          this.selectItem(false);
          break;  
        case KeyCode.KEY_DELETE:
          this.removeSelectedItems();
          break;
        case KeyCode.KEY_RETURN:
          this.refill();
          break;
        case KeyCode.KEY_SPACE:
          this.playSelectedCards();
          break;
      }
    }
  }

  /**
   * Callback from when the window resizes and we have to re render
   */
  handleResize() {
    this.forceUpdate();
  }

  handleTouch(evt) {
    // wait for the animations to finish
    if (this.animationCount === 0) {
      if (evt.type === 'touchstart') {
        this.touchStart = new Vector3(evt.changedTouches[0].clientX, evt.changedTouches[0].clientY);
      } else {
        const delta = new Vector3(evt.changedTouches[0].clientX  - this.touchStart.x, evt.changedTouches[0].clientY - this.touchStart.y);
        
        if (delta.length() < TAP_THRESHOLD) {
          // tap happened
          this.toggleActiveItemSelected();
        }
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

      // no more outstanding animations ?
      if (this.animationCount === 0) {
        this.removeSelectedItems();
      }
    }
  }

  setActiveIndex(idx) {
    this.setState({
        ...this.state,
        activeIndex: mathx.clamp(idx, 0, this.state.cards.length),
    });
  }

  previousItem() {
    this.setActiveIndex(this.state.activeIndex - 1);
  }

  nextItem() {
    this.setActiveIndex(this.state.activeIndex + 1);
  }

  selectItem(isItemSelected) {
  
    if (this.state.cards.length > 0) {
      if (!isItemSelected || this.props.maxSelectedCards < 0 || this.countSelected() < this.props.maxSelectedCards) {
        const idx = this.state.activeIndex;
        const newCards = [...this.state.cards];
        const oldCard = this.state.cards[idx];
        
        newCards[idx] = new Card(oldCard.key, oldCard.definition, oldCard.index, isItemSelected);

        this.setState({
          ...this.state,
          cards: newCards
        });
      }
    }
  }

  removeSelectedItems() {  
    if (this.state.cards.length > 0) {
      const cards = this.state.cards.filter(card => !card.isSelected);
      const activeIndex = Math.min(Math.max(0, cards.length-1), this.state.activeIndex);

      cards.forEach( (card, idx) => card.index = idx);   

      this.setState({
        ...this.state,
        activeIndex,
        cards
      });     
    }
  }

  playSelectedCards() {  
    if (this.state.cards.length > 0) {
      this.animationCount = 0;

      const cards = this.state.cards.map(card => {
        if (card.isSelected) {
          card.animation = ANIMATIONS.playCard;
          card.animationCallback = this.animationHandler;
          this.animationCount++;
        }

        return card;
      });

      this.setState({
        ...this.state,
        cards
      });    
    }
  }

  /**
   * Refill the hand with new cards until the max number of cards has been reached
   */
  refill() {
    if (this.state.cards.length < this.props.maxCards) {
      const newCardCount = this.props.maxCards - this.state.cards.length;
      const cardDefinitions = pickRandomCards(this.props.deck, newCardCount);
      const cards = [...this.state.cards, ...cardDefinitions.map( (definition, idx) => new Card(CARD_KEY_PREFIX + (idx + this.state.cardKeyCounter), definition, idx, false))];
      
      cards.forEach( (card, idx) => card.index = idx);   

      this.setState({
        ...this.state,
        cardKeyCounter: this.state.cardKeyCounter + newCardCount,
        cards
      });
    }
  }

  toggleActiveItemSelected() {   
    if (this.state.activeIndex < this.state.cards.length) {
      this.selectItem(!this.state.cards[this.state.activeIndex].isSelected);
    }
  }

  /**
   * Count the number of cards that have been selected.
   * @returns number
   */
  countSelected() {
    let result = 0;
    for (let i = 0; i < this.state.cards.length; ++i) {
      if (this.state.cards[i].isSelected) {
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
  createCarousel(config) {
    
    const carouselProperties = {
        key: "main-carousel",
        className : "carousel"
    };

    // center the active card
    const centerCard = this.state.isLocked ? Math.floor(this.state.cards.length / 2) : this.state.activeIndex;

    const innerId = `${carouselProperties.key}-inner`;
    const childProperties = {
        className:"inner",
        key: innerId,
        id: innerId,
    };
    
    const children = this.state.cards.map((card, idx) => 
      card.createElement(config, this.state.cards.length, this.state.activeIndex, centerCard));

    const innerChildren = React.createElement(ELEMENT_TYPES.DIV, childProperties, children);

    return React.createElement(ELEMENT_TYPES.DIV, carouselProperties, innerChildren);
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
  createIndicatorItems = (keyPrefix, callback, activeIndex, cards) =>
    cards.map((card, index) => 
      React.createElement(ELEMENT_TYPES.DIV, { 
        key: `indicator-${index}`,
        className : `indicator ${card.index === activeIndex ? "indicator-active" : ""} ${card.isSelected ? "indicator-selected" : ""}`,
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

    const children = this.createIndicatorItems("indicator-item-", (idx) => this.setActiveIndex(idx),this.state.activeIndex, cards);

    return React.createElement(ELEMENT_TYPES.DIV, properties, children);
  }
}
