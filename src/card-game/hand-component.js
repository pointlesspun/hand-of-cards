'use strict';

/**
 * Main component which takes a number of cards and implements the interactions with those 
 * cards using a carousel.
 */

import "/src/framework/math-extensions.js";
import { ELEMENT_TYPES } from "/src/framework/element-types.js";
import { PlatformConfiguration } from "/src/framework/media-configuration.js";
import { ANIMATION_EVENT_TYPE } from "/src/framework/animation-utilities.js";

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

export class HandComponent extends React.Component {
  /**
   *
   * @param {*} props
   * @param {*[]} items
   */
  constructor(props) {
    super(props);

    // event handlers
    //this.swipeHandler = (evt) => this.handleSwipe(evt.detail.dir);
    this.keyHandler = (evt) => this.handleKeyEvent(evt);
    this.resizeHandler = (evt) => this.handleResize();
    this.cardEventHandler = (evt) => this.handleCardEvent(evt);
    
    // transient properties
    this.ref = React.createRef();
    this.isRefInitialized = false;
    this.animationCount = 0;
    this.centerCardIndex = 0;
    this.mediaConfig = null;

    this.cardContext = {
      getActiveIndex: () => this.state.activeIndex,
      getCardCount: () => this.state.cards.length,
      getCenterCardIndex: () => this.centerCardIndex,
      getMediaConfig: () => this.mediaConfig
    }

    this.state = {
      activeIndex: props.initialIndex || 0,
      isLocked: props.isLocked,
      centerCardIndex: props.initialIndex || 0,
      cardKeyCounter: props.hand ? props.hand.length : 0,
      cards: props.hand ? props.hand.map( (definition, idx) => 
        this.createCardComponent(React.createRef(), CARD_KEY_PREFIX + idx, idx, definition)
      ) : []
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
    
    // Need to know the width of the component to do a proper layout, so until we have a reference,
    // we skip this render.
    if (this.ref.current) {
      this.mediaConfig = this.props.getLayoutConfiguration(this.ref);
      
      const children = [
        this.createCarousel(this.mediaConfig),
        this.createControlBar(this.mediaConfig),        
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
                  this.selectItem(index, true);
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
            this.selectActiveItem(true);
            evt.preventDefault();
            break;
          case KeyCode.KEY_DOWN:
            this.selectActiveItem(false);
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
    this.forceUpdate();
    this.updateCardContext();
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

      // no more outstanding animations ?
      if (this.animationCount === 0) {
        if (evt.animation.name === ANIMATIONS.playCard.name) {
          this.removeSelectedItems();
        } else {
          this.updateCardContext();
        }

        // force update to reset the animation transforms
        this.forceUpdate();
      }
    }
  }

  setActiveIndex(idx) {
    const newState = {
      ...this.state,
      activeIndex: Math.clamp(idx, 0, this.state.cards.length),
    };

    this.setState(newState);

    this.updateCardContext();
  }

  previousItem() {
    this.setActiveIndex(this.state.activeIndex - 1);
  }

  nextItem() {
    this.setActiveIndex(this.state.activeIndex + 1);
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
      }
    }
  }

  canSelectMoreCards() {
    // any cards to select ?
    return this.state.cards.length > 0
      // is there is a limit ?
      && (this.props.maxSelectedCards < 0 
          // can still select more cards ?
          || this.countSelectedCards() < this.props.maxSelectedCards);
  }

  removeSelectedItems() {  
    if (this.state.cards.length > 0) {
      const cards = this.state.cards.filter(card => !card.ref.current.state.isSelected);
      const activeIndex = Math.min(Math.max(0, cards.length-1), this.state.activeIndex);

      cards.forEach( (card, idx) => card.ref.current.setIndex(idx));   

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

      this.state.cards.forEach(cardRef => {
        const card = cardRef.ref.current;
        if (card.state.isSelected) {
          this.animationCount++;
          card.setAnimation(ANIMATIONS.playCard);
        } 
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
      const cards = [
        ...this.state.cards, 
        ...cardDefinitions.map( (definition, idx) => {
          const updatedCard = this.createCardComponent(
            React.createRef(), 
            CARD_KEY_PREFIX + (idx + this.state.cardKeyCounter), 
            idx + this.state.cards.length, definition, 
            false, 
            ANIMATIONS.drawCard
          );
          this.animationCount++;
          return updatedCard;
        })];
      
      this.setState({
        ...this.state,
        cardKeyCounter: this.state.cardKeyCounter + newCardCount,
        cards
      });
    }
  }

  toggleActiveItemSelected() {   
    if (this.state.activeIndex < this.state.cards.length) {
      this.selectActiveItem(!this.getActiveCard().state.isSelected);
    }
  }

  toggleSelected(idx) {   
    if (this.state.activeIndex < this.state.cards.length) {
      this.selectItem(idx, !this.getCard(idx).state.isSelected);
    }
  }

  toggleLock() {   
    this.setState({
      ...this.state,
      isLocked: !this.state.isLocked
    });

    this.updateCardContext();
  }

  getCard(idx) {
    return this.state.cards[idx].ref.current;
  }
  
  getActiveCard() {
    return this.state.cards[this.state.activeIndex].ref.current;
  }

  /**
   * Count the number of cards that have been selected.
   * @returns number
   */
  countSelectedCards() {
    let result = 0;
    for (let i = 0; i < this.state.cards.length; ++i) {
      if (this.getCard(i).state.isSelected) {
        result++;
      }
    }
    return result;
  }

  /**
   * Soft forceUpdate on the cards
   */
  updateCardContext() {
    this.state.cards.forEach(card => card.ref.current.updateContext(this.cardContext));
  }

  /**
   * 
   * @param {PlatformConfiguration} config used to layout the cards appropriate for the current platform/medium (laptop/desktop/tablet/phone...)
   * @returns 
   */
  createCarousel(config) {
    
    const carouselProperties = {
        key: "main-carousel",
        className : "carousel",
        style: {
          // take the height from the platform specific settings
          height: `${config.values.innerHeight*100}%` 
        }
    };

    // center the active card
    this.centerCardIndex = this.state.isLocked ? Math.floor(this.state.cards.length / 2) : this.state.activeIndex;

    const innerId = `${carouselProperties.key}-inner`;
    const childProperties = {
        className:"inner",
        key: innerId,
        id: innerId,
    };
    
    const innerChildren = React.createElement(ELEMENT_TYPES.DIV, childProperties, this.state.cards);

    return React.createElement(ELEMENT_TYPES.DIV, carouselProperties, innerChildren);
}

  
createCardComponent = (ref, key, index, definition, isSelected = false, animation = null) => 
  React.createElement(CardComponent, {
    ref,
    key, 
    keyReference: key,
    definition, 
    index, 
    isSelected, 
    animation,
    eventHandler: this.cardEventHandler,
    context: this.cardContext,
    mediaConfig: this.props.config
  });



createControlBar(config) {
  
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

    const refreshButton = React.createElement(ELEMENT_TYPES.DIV, {
      key: "refresh-button",
      className: "button-panel-button sync-button",
      onClick: () => {
        this.refill();
      }
    });

    const lockButton = React.createElement(ELEMENT_TYPES.DIV, {
      key: "lock-button",
      className: `button-panel-button ${this.state.isLocked ? "lock-button" : "lock-button-open"}`,
      onClick: () => {
        this.toggleLock();
      }
    });

    return React.createElement(ELEMENT_TYPES.DIV, {
      key: "button-panel",
      className: "button-panel"
    }, [refreshButton, lockButton]);
  }

}
