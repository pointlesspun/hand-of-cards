"use strict";

import { Vector3 } from "../framework/vector3.js";
import { ELEMENT_TYPES } from "../framework/element-types.js";
import { ANIMATION_EVENT_TYPE, AnimationEvent } from "../framework/animation-utilities.js";

import { CardEvent, CARD_EVENT_TYPES } from "./card-event.js";
import { CardRenderService } from "./card-render-service.js";
import { CardDefinition } from "../model/card-definition.js";

// number of pixels of movement allowed before a tap becomes a swipe
const TAP_THRESHOLD = 10;

/**
 * Context provided as parameter to the card rendering service
 */
export class CardRenderContext {
    /**
     * @type {CardDefinition}
     */
    definition = null;

    /**
     * @type {boolean}
     */
    hasFocus = false;

    /**
     * @type {boolean}
     */
    isSelected = false;

    constructor(definition, hasFocus, isSelected) {
        this.definition = definition;
        this.hasFocus = hasFocus;
        this.isSelected = isSelected;
    }

    static fromCardState = (state) => new CardRenderContext(state.definition, state.hasFocus, state.isSelected);
}

/**
 * Component representing a 'card' in a card game.
 */
export class CardComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            index: props.index,
            hasFocus: props.hasFocus,
            transform: props.transform,
            isSelected: props.isSelected ?? false,
            platformConfig: props.platformConfig,
            // use an event handler rather than js events (add/remove event listener)
            // as it is slightly easier to deal with
            eventHandler: props.eventHandler,
            animation: props.animation,
            isDeleted: false,
            definition: props.definition,
        };

        // transient properties
        this.ref = React.createRef();
        this.currentAnimation = null;
        this.swipeListener = (evt) => this.handleSwiped(evt);
        this.mouseListener = (evt) => this.handleMouseEvent(evt);
        this.touchListener = (evt) => this.handleTouch(evt);
        this.animationListener = (evt) => this.handleAnimationEnded(evt);
    }

    // --- React overrides --------------------------------------------------------------------------------------------

    render() {
        const properties = {
            className: `card-item`,
            ref: this.ref,
            style: {
                width: this.state.platformConfig.settings.layoutCollection.getCardSize().width + "px",
                height: this.state.platformConfig.settings.layoutCollection.getCardSize().height + "px",
                transformOrigin: "center bottom",
            },
        };

        // is an animation playing ?
        if (this.currentAnimation) {
            // have to copy the animation into the style again otherwise
            // the animation is 'forgotten' and the card will end up sitting in the top right corner.
            properties.style = {
                ...properties.style,
                ...this.currentAnimation,
            };
        }
        // is an animation scheduled ?
        else if (this.state.animation) {
            this.startAnimation(this.state.transform, properties, this.state.platformConfig);
        } else {
            // no animation just define the intended position, scale & rotation of the card
            properties.style.transform = this.state.transform.toCss({});
        }

        return React.createElement(
            ELEMENT_TYPES.DIV,
            properties,
            CardRenderService.render(this.state.definition.id, CardRenderContext.fromCardState(this.state))
        );
    }

    // --- Event handlers ---------------------------------------------------------------------------------------------

    componentDidMount() {
        const parameters = { passive: false };

        this.ref.current.addEventListener("swiped", this.swipeListener);
        this.ref.current.addEventListener("mouseover", this.mouseListener, parameters);
        this.ref.current.addEventListener("mouseup", this.mouseListener, parameters);
        this.ref.current.addEventListener("touchstart", this.touchListener, parameters);
        this.ref.current.addEventListener("touchend", this.touchListener, parameters);
        this.ref.current.addEventListener("animationend", this.animationListener);
    }

    componentWillUnmount() {
        this.ref.current.removeEventListener("swiped", this.swipeListener);
        this.ref.current.removeEventListener("mouseover", this.mouseListener);
        this.ref.current.removeEventListener("mouseup", this.mouseListener);
        this.ref.current.removeEventListener("touchstart", this.touchListener);
        this.ref.current.removeEventListener("touchend", this.touchListener);
        this.ref.current.removeEventListener("animationend", this.animationListener);
    }

    handleTouch(evt) {
        // wait for the animations to finish
        if (evt.type === "touchstart") {
            this.touchStart = new Vector3(evt.changedTouches[0].clientX, evt.changedTouches[0].clientY);
        } else {
            const delta = new Vector3(
                evt.changedTouches[0].clientX - this.touchStart.x,
                evt.changedTouches[0].clientY - this.touchStart.y
            );

            if (delta.length() < TAP_THRESHOLD && this.state.eventHandler) {
                // tap happened
                this.state.eventHandler(new CardEvent(this, CARD_EVENT_TYPES.TAP));
            }
        }

        if (evt.cancelable) {
            evt.preventDefault();
        }
    }

    handleSwiped(evt) {
        if (this.state.eventHandler) {
            this.state.eventHandler(new CardEvent(this, CARD_EVENT_TYPES.SWIPE, evt));
        }
    }

    handleMouseEvent(evt) {
        if (evt.type === "mouseover") {
            if (this.state.eventHandler) {
                this.state.eventHandler(new CardEvent(this, CARD_EVENT_TYPES.FOCUS));
            }
        } else if (evt.type === "mouseup") {
            this.state.eventHandler(new CardEvent(this, CARD_EVENT_TYPES.TAP));
        }

        evt.preventDefault();
    }

    handleAnimationEnded() {
        this.currentAnimation = null;

        if (this.state.eventHandler) {
            const animationEvent = new AnimationEvent(this, this.state.animation, ANIMATION_EVENT_TYPE.END);
            this.state.eventHandler(new CardEvent(this, CARD_EVENT_TYPES.ANIMATION, animationEvent));
        }

        if (!this.state.isDeleted) {
            this.setAnimation(null);
        }
    }

    // --- State mutations & queries ----------------------------------------------------------------------------------

    // React override
    shouldComponentUpdate(nextProps, nextState) {
        // do not re-render if this card is flagged for deletion. If this is omitted we end up with the last frame
        // of the animation being rendered with the default transform when the animation is cleared.
        return nextState.isDeleted === false;
    }

    setPlatformConfig(platformConfig) {
        this.setState({ platformConfig });
    }

    setHasFocus(hasFocus) {
        this.setState({ hasFocus });
    }

    setTransform(transform) {
        this.setState({ transform });
    }

    setSelected(isSelected) {
        this.setState({
            lastUpdate: Date.now(),
            isSelected,
        });
    }

    setIndex(index) {
        this.setState({ index });
    }

    getIndex = () => this.state.index;

    setAnimation(animation) {
        this.setState({ animation });
    }

    setDeleted() {
        this.setState({ isDeleted: true });
    }

    isSelected = () => this.state.isSelected;

    // --- Utility methods  -------------------------------------------------------------------------------------------

    startAnimation(targetTransform, properties, config) {
        this.currentAnimation = this.state.animation.createAnimationStyle({
            idx: this.state.index,
            config,
            targetTransform,
        });

        properties.style = {
            ...properties.style,
            ...this.currentAnimation,
        };

        if (this.state.eventHandler) {
            const animationEvent = new AnimationEvent(this, properties.style.animationName, ANIMATION_EVENT_TYPE.START);
            this.state.eventHandler(new CardEvent(this, CARD_EVENT_TYPES.ANIMATION, animationEvent));
        }
    }
}
