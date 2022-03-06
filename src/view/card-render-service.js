"use strict";

import { ELEMENT_TYPES } from "../framework/element-types.js";

export class CardRenderService {
    static #CARD_RENDER_FUNCTIONS = {};

    static registerRenderFunction(id, func) {
        CardRenderService.#CARD_RENDER_FUNCTIONS[id] = func;
    }

    static render = (id, context) => {
        const renderFunction = CardRenderService.#CARD_RENDER_FUNCTIONS[id]
                ?? CardRenderService.fallbackRenderFunction;

        return renderFunction(context);
    } 

    /**
     * In case a render function is not found a fallback will be rendered
     * @param {*} context 
     * @returns {React.element}
     */
    static fallbackRenderFunction(context) {
        return React.createElement(ELEMENT_TYPES.DIV, { 
            key: "card-content",
            class: "card-fallback"
        }, "?");
    }
}
