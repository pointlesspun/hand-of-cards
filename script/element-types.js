export const elementTypes = {
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
    React.createElement(elementTypes.button, {
        onClick : onClickCallback,
        key,
        className : className || ""
    }, text);