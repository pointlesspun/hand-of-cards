'use strict';

/**
 * Definition of React element types which can be used in ReactCreateElement (limited to the ones used in this demo).
 */

export const ELEMENT_TYPES = {
    button : 'button',
    div: 'div'
};

/**
 * 
 * @param {*} key 
 * @param {*} onClickCallback 
 * @param {string} text 
 * @param {string} className 
 * @returns ReactElement
 */
export const createButton = (key, onClickCallback, text, className) =>
    React.createElement(ELEMENT_TYPES.button, {
        onClick : onClickCallback,
        key,
        className : className || ""
    }, text);