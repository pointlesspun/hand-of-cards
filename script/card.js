'use strict';

/*
 * Implements a card and its tranformation given its position and state in the hand.
 */

import { Transform } from "./mathx.js";
import { ELEMENT_TYPES } from "./element-types.js";

export const CARD_KEY_PREFIX = "hoc-card";
export class Card {
    constructor(key, definition, index, isSelected) {
        this.key = key;
        this.definition = definition;
        this.index = index;
        this.isSelected = isSelected;
    }
    
    createElement(config, key, cardCount, activeIndex, centerCard) {

        if (this.index < 0) {
            return React.createElement(ELEMENT_TYPES.div, {key, visibility: "collapse", className: "card-item"});    
        }

        // notes
        // top/left of the card is the translation origin (0,0)
        // translation is applied before scaling, so the position has to be calculated as if
        // the scale = (1,1)

        // Hack: we know the inner takes 90% of the clientheight based on that we can calculate
        // the relative y offset
        const values = config.values;
        const innerHeight = config.clientSize.height * 0.9;

        const distanceToActiveIndex = centerCard - this.index;
        const relativeDistance = Math.abs(distanceToActiveIndex) / (cardCount * 0.5);
        const itemScale = values.baseScale + values.dynamicScale * (1-relativeDistance);

        const itemSelectedOffset = this.isSelected ? values.ySelectedOffset : 0;
        const isActive = this.index === activeIndex;
        const itemActiveOffset = isActive ? values.yActiveOffset : 0;
        const yOffset =  (innerHeight - values.cardHeight) + values.yBaseOffset;
        const yOffsetWrtActive = isActive ? 0 : Math.abs(distanceToActiveIndex) * Math.abs(distanceToActiveIndex) * values.yTranslation;
        
        const transform = new Transform({
            rotation : isActive ? 0 :  -values.rotation * distanceToActiveIndex,
            scale : {
                x: itemScale,
                y: itemScale
            },
            translation: {
                x : distanceToActiveIndex * values.xTranslation,
                y: yOffset + itemSelectedOffset + itemActiveOffset + yOffsetWrtActive,
                z: isActive ? 200 : 100 - Math.abs(distanceToActiveIndex)
            }
        });
        
        const properties = {
            key,
            id: key,
            className : `card-item ${isActive ? "card-item-active" : ""} ${this.isSelected ? "card-item-selected" : ""}`,
            style : {
                width : config.values.cardWidth + "px",
                height : config.values.cardHeight + "px",
                transformOrigin: "center bottom",
                transform: transform ? transform.toCss({}) : "",
                background: this.definition.atlas.toCss(this.definition.row, this.definition.column),
            }   
        };
        
        // color overlay giving the card some shadow depending on its state
        const overlay = React.createElement(ELEMENT_TYPES.div, { className : `card-overlay${isActive ? "-active" : ""}`});

        return React.createElement(ELEMENT_TYPES.div, properties, overlay);
    }
}
