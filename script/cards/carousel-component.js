import { mathx, Transform } from "../mathx.js";
import { carousel, cardItem } from "./cards.js";
import { createButton, elementTypes } from "../element-types.js";

const SWIPE_DIRECTIONS = {
  UP : 'up',
  RIGHT : 'right',
  DOWN: 'down',
  LEFT: 'left'
}

// number of pixels of movement allowed before a tap becomes a swipe
const TAP_THRESHOLD = 10;

export class CarouselComponent extends React.Component {
  /**
   *
   * @param {*} props
   * @param {*[]} items
   */
  constructor(props) {
    super(props);

    this.state = {
      activeIndex: props.initialIndex || 0,
      items: props.initialItems ? props.initialItems.map( (item, idx) => ({
        item,
        index : idx,
        isSelected : false
      })) : null,
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
      className: "card-app",
      ref: this.ref,
      onKeyUp : (evt) => {
        this.handleKeyEvent(evt.keyCode);
      }
    };

    if (!this.state.items) {
      return React.createElement(elementTypes.div, properties, "no items to display in the carousel...");
    }

    const carouselKey = "main-carousel";
    
    // need to know the width of the component to do a proper layout
    if (this.ref.current) {
      const config = this.props.getLayoutConfiguration(this.ref);
      const statusText = `${config.name} ${config.screenSize.width}x${config.screenSize.height}`;

      const children = [
        carousel(carouselKey, this.state.activeIndex, this.state.items, config),
        this.createIndicators(this.state.items),
        React.createElement(elementTypes.div, {key: "device-description", className: "platform-context"}, statusText)
      ];

      return React.createElement(elementTypes.div, properties, children);
    } else {
      return React.createElement(elementTypes.div, properties);
    }
  }

  
  componentDidMount() {
    document.addEventListener('swiped', this.swipeHandler);
    document.addEventListener('keyup', this.keyHandler);
    window.addEventListener('resize', this.resizeHandler);
    window.addEventListener('touchstart', this.touchHandler);
    window.addEventListener('touchend', this.touchHandler);

    if (!this.isRefInitialized) {
      this.isRefInitialized = true;
      this.forceUpdate();
    }
  }

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
          this.lockItem(true);
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
        this.lockItem(true);
        break;
      case 40:
        this.lockItem(false);
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
        this.toggleActiveItem();
      }
    }
  }
  
  setActiveIndex(idx) {
    this.setState({
        ...this.state,
        activeIndex: mathx.clamp(idx, 0, this.state.items.length),
    });
  }

  previousItem() {
    this.setActiveIndex(this.state.activeIndex - 1);
  }

  nextItem() {
    this.setActiveIndex(this.state.activeIndex + 1);
  }

  lockItem(isItemLocked) {
    
    const idx = this.state.activeIndex;
    const newItems = [...this.state.items];
    
    newItems[idx] = {
      ...this.state.items[idx],
      isSelected : isItemLocked
    };

    this.setState({
      ...this.state,
      items: newItems
    });
  }

  toggleActiveItem() {
    
    const idx = this.state.activeIndex;
    const newItems = [...this.state.items];
    
    newItems[idx] = {
      ...this.state.items[idx],
      isSelected : !this.state.items[idx].isSelected
    };

    this.setState({
      ...this.state,
      items: newItems
    });
  }
  
  /**
   * 
   * @private
   * @param {*} keyPrefix 
   * @param {*} callback 
   * @param {*} activeIndex 
   * @param {*} items 
   * @returns 
   */
  createIndicatorItems = (keyPrefix, callback, activeIndex, items) =>
  items.map((child, index) =>
      createButton(
        keyPrefix + index,
        () => callback(index),
        (index + 1).toString(),
        index === activeIndex ? "active" : ""
      )
    );

    /**
     * @private
     * @returns 
     */
  createIndicators(items) {
    const properties = {
      key: "indicators",
      className: "indicators",
    };

    const children = [
        createButton("prev", () => this.previousItem(), "Prev"),
        ...this.createIndicatorItems("indicator-item-", (idx) => this.setActiveIndex(idx),this.state.activeIndex, items),
        createButton("next",() => this.nextItem(),"Next")
    ];

    return React.createElement(elementTypes.div, properties, children);
  }
}
