"use strict";

export class CardRenderService {
    static #CARD_RENDER_FUNCTIONS = {};

    static registerRenderFunction(id, func) {
        CardRenderService.#CARD_RENDER_FUNCTIONS[id] = func;
    }

    static render = (id, context) => CardRenderService.#CARD_RENDER_FUNCTIONS[id](context);
}
