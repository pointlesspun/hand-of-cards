'use strict';

/**
 * Implements a carousel of items.
 */

import {elementTypes} from "./element-types.js";
import {createCard} from "./card.js";


export const createCarousel = (key, activeIndex, items, config) => {
    
    const carouselProperties = {
        key: key,
        className : "carousel"
    };

    // center the active card
    const offset = (config.clientSize.width - config.values.cardWidth) / 2;

    const innerId = key + "-inner";
    const childProperties = {
        className:"inner",
        key: key + "-inner",
        id: innerId,
        style : {
            transform: `translate(${(-activeIndex*config.values.cardWidth)+offset}px, 0px)`
        }
    };
    
    const children = items.map((itemProperties, idx) => createCard(config, `${key}-item-${idx}`, itemProperties, items.length, activeIndex, idx));

    const innerChildren = [ React.createElement(elementTypes.div, childProperties, children)];

    return React.createElement(elementTypes.div, carouselProperties, innerChildren);
};
