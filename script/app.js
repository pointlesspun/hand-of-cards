'use strict';

/**
 * Main application which configures a HandOfCardsComponent and renders the component.
 */

import { MediaConfiguration} from "./media-configuration.js";
import { HandOfCardsComponent } from "./hand-of-cards-component.js";
import { PLATFORM_CONFIGURATIONS } from "./platform-configurations.js";
import { DEFAULT_DECK, pickRandomCards } from "./deck.js";

console.log("starting card component");

const element = document.querySelector('#card-container');

const properties = {
    deck : pickRandomCards(DEFAULT_DECK, element.attributes?.cardCount?.value ?? 7),
    initialIndex: 0,   
    maxSelectedCards: element.attributes?.maxSelectedCards?.value ?? -1,
    getLayoutConfiguration: (elementRef) => new MediaConfiguration(elementRef,PLATFORM_CONFIGURATIONS)            
};

ReactDOM.render(React.createElement(HandOfCardsComponent, properties), element);