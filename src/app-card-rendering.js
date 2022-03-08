"use strict";

import { ELEMENT_TYPES } from "./framework/element-types.js";
import { Size } from "./framework/size.js";
import { SpriteAtlas } from "./framework/sprite-atlas.js";

import { CardRenderService } from "./view/card-render-service.js";
import { CardRenderContext } from "./view/card-component.js";

import { CARD_COLOR_NAMES, CARD_VALUE_NAMES } from "./app-card-library.js";

// There's a limitation on some handheld devices like phones in what image size they will load
// so the atlas is cut in two parts
const ATLAS_1_TO_6 = new SpriteAtlas('./data/Atlasnye-playing-cards-1-to-6.png', new Size(-32, -32), new Size(-(390), -(568)));
const ATLAS_7_TO_K = new SpriteAtlas('./data/Atlasnye-playing-cards-7-to-K.png', new Size(-32, -32), new Size(-(390), -(568)));

/**
 * Generates css/style backgrounds for the cards based on the provided atlases.
 * 
 * @param {[string]} result is the array to store the background strings in
 * @param {number} offset the first index the cards in the atlas
 * @param {SpriteAtlas} atlas 
 * @param {number} atlasRowLength number of cards in one row of the atlas
 * @returns {[string]} css strings representing the background
 */
const generateBackgrounds = (result, offset, atlas, atlasRowLength) => {

    for (let i = 0; i < CARD_COLOR_NAMES.length; i++) {
        for (let j = 0; j < atlasRowLength; j++) {
            const index = (i * CARD_VALUE_NAMES.length) + offset + j;
            result[index] = atlas.toCss(i, j);
        }    
    }

    return result;
}

// cache of all backgrounds css strings
const CARD_FRONT_BACKGROUNDS = Array(CARD_COLOR_NAMES.length * CARD_VALUE_NAMES.length);

generateBackgrounds(CARD_FRONT_BACKGROUNDS, 0, ATLAS_1_TO_6, 6);
generateBackgrounds(CARD_FRONT_BACKGROUNDS, 6, ATLAS_7_TO_K, 7);

/**
 * Creates the classname for the front of the card based on the parameters.
 * 
 * @param {boolean} hasFocus 
 * @param {boolean} isSelected 
 * @returns {string}
 */
const createCardFrontClassName = (hasFocus, isSelected) => {
    let className = `card-front`;

    if (hasFocus) {
        className += " card-item-focus";
    }

    if (isSelected) {
        className += " card-item-selected";
    }

    return className;
}


/**
 * Method to render the card content
 * @param {CardRenderContext} context object containing rendering specific information
 * @returns {[React.element]} all the elements making up the content
 */
const renderCardContent = (context) => [
    // create an element representing the front of the card
    React.createElement(ELEMENT_TYPES.DIV, { 
        key: "card-front",
        className: createCardFrontClassName(context.hasFocus, context.isSelected),
        style: {
            background: CARD_FRONT_BACKGROUNDS[context.definition.id],
        }
    }),

    // create an overlay giving the impression of focused cards being brighter
    React.createElement(ELEMENT_TYPES.DIV, { 
        key: "card-overlay",
        className: `card-overlay${context.hasFocus ? "-focus" : ""}`,
    }),

    // create the back of the card
    React.createElement(ELEMENT_TYPES.DIV, { 
        key: "card-back",
        className: `card-back`,
    }),
];

// register the app specific rendering method with the service
CARD_FRONT_BACKGROUNDS.forEach( (background, index) => CardRenderService.registerRenderFunction(index, renderCardContent));
