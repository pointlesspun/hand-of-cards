'use strict';

/**
 * Definition of React element types which can be used in ReactCreateElement (limited to the ones used in this demo).
 */

export const ELEMENT_TYPES = {
    BUTTON : 'button',
    DIV: 'div',
    STYLE: 'style',
    SPAN: 'span'
};

/**
 * Utility function to create a standard button
 * @param {*} key React key to identify this button
 * @param {*} onClickCallback function that will be called when the button is clicked.
 * @param {string} text text of the button
 * @param {string} [className] className of the button's style
 * @returns ReactElement
 */
export const createButton = (key, onClickCallback, text, className) =>
    React.createElement(ELEMENT_TYPES.BUTTON, {
        onClick : onClickCallback,
        key,
        className : className || ""
    }, text);