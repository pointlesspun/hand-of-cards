'use strict';

import {elementTypes} from "../element-types.js";
import { Transform } from "../mathx.js";

/**
 * 
 * @param {*} key 
 * @param {*} cardType 
 * @param {*} width 
 * @param {Transform} [transform] 
 * @returns 
 */
export const cardItem = (key, cardType, config, transform, isActive, isSelected) => {
    
    const className = `${cardType} card-item ${isActive ? "card-item-active" : ""} ${isSelected ? "card-item-selected" : ""}`
  
    const properties = {
        key: key,
        className,
        style : {
            width : config.values.cardWidth + "px",
            height : config.values.cardHeight + "px",
            transformOrigin: "center bottom",
            transform: transform ? transform.toCss({}) : "",
        }   
    };
    
    const overlay = React.createElement(elementTypes.div, { className : `card-overlay${isActive ? "-active" : ""}`});

    return React.createElement(elementTypes.div, properties, overlay);
}


export const carousel = (key, activeIndex, items, config) => {
    
    const carouselProperties = {
        key: key,
        className : "carousel"
    };

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
    
    const children = items.map((itemProperties, idx) => createCardItem(config, `${key}-item-${idx}`, itemProperties, items.length, activeIndex, idx));

    const innerChildren = [ React.createElement(elementTypes.div, childProperties, children)];

    return React.createElement(elementTypes.div, carouselProperties, innerChildren);
};

const createCardItem = (config, key, itemProperties, itemsLength, activeIndex, idx) => {
    
    // notes
    // top/left of the card is the translation origin (0,0)
    // translation is applied before scaling, so the position has to be calculated as if
    // the scale = (1,1)

    // Hack: we know the inner takes 90% of the clientheight based on that we can calculate
    // the relative y offset
    const values = config.values;
    const innerHeight = config.clientSize.height * 0.9;

    const distanceToActiveIndex = activeIndex - idx;
    const maxDistance = itemsLength * 0.5;
    const relativeDistance = Math.abs(distanceToActiveIndex) / maxDistance;
    const itemScale = values.baseScale + values.dynamicScale * (1-relativeDistance);
    const itemRotation = -values.rotation * distanceToActiveIndex;
    const zIndex = 100 - Math.abs(distanceToActiveIndex);
    const itemSelectedOffset = itemProperties.isSelected ? values.ySelectedOffset : 0;
    const isActive = idx === activeIndex;
    const itemActiveOffset = isActive ? values.yActiveOffset : 0;
    const yOffset =  (innerHeight - values.cardHeight) + values.yBaseOffset;
  
    const transform = new Transform({
      rotation : itemRotation,
      scale : {
        x: itemScale,
        y: itemScale
      },
      translation: {
        x : distanceToActiveIndex * values.xTranslation,
        y: yOffset + itemSelectedOffset + itemActiveOffset + Math.abs(distanceToActiveIndex) * Math.abs(distanceToActiveIndex) * values.yTranslation,
        z: zIndex
      }
    });

    return cardItem(key, itemProperties.item, config, transform, isActive, itemProperties.isSelected);
  }

export default carousel;