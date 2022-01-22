'use strict';

/**
 * Main application which configures a HandOfCardsComponent and renders the component.
 */

import { MediaConfiguration} from "./media-configuration.js";
import { HandOfCardsComponent } from "./hand-of-cards-component.js";
import { PLATFORM_CONFIGURATIONS } from "./platform-configurations.js";


console.log("starting card component");

const CARD_NAMES = {
    HEARTS_1 : "heart-1",
    HEARTS_2 : "heart-2",
}

const properties = {
    initialItems : [
        CARD_NAMES.HEARTS_1,
        CARD_NAMES.HEARTS_1,
        CARD_NAMES.HEARTS_1,
        CARD_NAMES.HEARTS_1,
        CARD_NAMES.HEARTS_1,
    ],
    initialIndex: 0,
    getLayoutConfiguration: (elementRef) => new MediaConfiguration(elementRef,PLATFORM_CONFIGURATIONS)            
};

ReactDOM.render(React.createElement(HandOfCardsComponent, properties), document.querySelector('#card-container'));