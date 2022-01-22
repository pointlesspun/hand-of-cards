'use strict';

/**
 * Main component which takes a number of cards and implements the interactions with those 
 * cards using a carousel.
 */

import { mathx } from "./mathx.js";
import { createButton, ELEMENT_TYPES } from "./element-types.js";
import { Card } from "./card.js";

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
      cards: props.deck ? props.deck.map( (definition, idx) => new Card(definition, idx, false)) : null
    };

    this.swipeHandler = (evt) => this.handleSwipe(evt.detail.dir);
    this.keyHandler = (evt) => this.handleKeyEvent(evt.keyCode);
    this.resizeHandler = (evt) => this.handleResize();
    this.touchHandler = (evt) => this.handleTouch(evt);
    
    this.ref = React.createRef();
    this.isRefInitialized = false;
  }
  
  render() {

    const properties = {
      className: "hand-of-cards",
      ref: this.ref,
      onKeyUp : (evt) => {
        this.handleKeyEvent(evt.keyCode);
      }
    };

    if (!this.state.cards) {
      return React.createElement(ELEMENT_TYPES.div, properties, "no items to display in the carousel...");
    }
    
    // Need to know the width of the component to do a proper layout, so until we have a reference,
    // we skip this render.
    if (this.ref.current) {
      const config = this.props.getLayoutConfiguration(this.ref);
      const statusText = `${config.name} ${config.screenSize.width}x${config.screenSize.height}`;

      const children = [
        this.createCarousel(config),
        this.createIndicators(this.state.cards),
        React.createElement(ELEMENT_TYPES.div, {key: "device-description", className: "platform-context"}, statusText)
      ];

      return React.createElement(ELEMENT_TYPES.div, properties, children);
    } else {
      return React.createElement(ELEMENT_TYPES.div, properties);
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

  handleSwipe( direction ) {

    switch (direction) {
      case SWIPE_DIRECTIONS.UP:
          this.selectItem(true);
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

  handleKeyEvent(keyCode) {
    switch (keyCode) {
      case 37:
        this.previousItem();
        break;
      case 39:
        this.nextItem();
        break;
      case 38:
        this.selectItem(true);
        break;
      case 40:
        this.selectItem(false);
        break;  
    }
  }

  handleResize() {
    this.forceUpdate();
  }

  handleTouch(evt) {
    if (evt.type === 'touchstart') {
      this.touchStart = {x: evt.changedTouches[0].clientX, y: evt.changedTouches[0].clientY};
    } else {
      const delta = {x: evt.changedTouches[0].clientX  - this.touchStart.x, y: evt.changedTouches[0].clientY - this.touchStart.y};

      if (Math.abs(delta.x) + Math.abs(delta.x) < TAP_THRESHOLD) {
        // tap happened
        this.toggleActiveItemSelected();
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
    
    const idx = this.state.activeIndex;
    const newCards = [...this.state.cards];
    const oldCard = this.state.cards[idx];
    
    newCards[idx] = new Card(oldCard.definition, oldCard.index, isItemSelected);

    this.setState({
      ...this.state,
      cards: newCards
    });
  }

  toggleActiveItemSelected() {   
    this.selectItem(!this.state.cards[this.state.activeIndex].isSelected);
  }
  
  createCarousel(config) {
    
    const carouselProperties = {
        key: "main-carousel",
        className : "carousel"
    };

    // center the active card
    const offset = (config.clientSize.width - config.values.cardWidth) / 2;

    const innerId = `${carouselProperties.key}-inner`;
    const childProperties = {
        className:"inner",
        key: innerId,
        id: innerId,
        style : {
            transform: `translate(${(-this.state.activeIndex* config.values.cardWidth)+offset}px, 0px)`
        }
    };
    
    const children = this.state.cards.map((card, idx) => 
      card.createElement(config, `${carouselProperties.key}-item-${idx}`, this.state.cards.length, this.state.activeIndex));

    const innerChildren = [ React.createElement(ELEMENT_TYPES.div, childProperties, children)];

    return React.createElement(ELEMENT_TYPES.div, carouselProperties, innerChildren);
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
      React.createElement(ELEMENT_TYPES.div, { 
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

    return React.createElement(ELEMENT_TYPES.div, properties, children);
  }
}
