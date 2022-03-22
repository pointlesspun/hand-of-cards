"use strict";

import { contract } from "./contract.js";

/**
 * @callback InvariantEventSource~eventListener
 * @param {number} id
 * @param {any} model
 * @param {any} args
 */

export class InvariantEventSource {
    /**
     * @type {[InvariantEventSource~eventListener]}
     */
    #changeListeners = [];

    /**
     * @private
     * @type {[InvariantEventSource~eventListener]}
     */
    #queuedListeners = [];

    /**
     * @private
     * @type {[InvariantEventSource~eventListener]}
     */
    #removedListeners = [];

    /**
     * @private
     * @type {number}
     */
    #eventsBeingSend = 0;

    /**
     * 
     * @param {InvariantEventSource~eventListener} listener 
     */
    addEventListener(listener) {
        contract.isDefined(listener);
        contract.doesNotContain(this.#changeListeners, listener);

        if (this.#eventsBeingSend === 0) {
            this.#changeListeners.push(listener);
        } else {
            this.#queuedListeners.push(listener);
        }
    }

    /**
     * 
     * @param {InvariantEventSource~eventListener} listener 
     */
    removeEventListener(listener) {
        contract.isDefined(listener);
        contract.contains(this.#changeListeners, listener);

        if (this.#eventsBeingSend === 0) {
            this.#changeListeners.splice(this.#changeListeners.findIndex(v => v === listener), 1);
        } else {
            this.#removedListeners.push(listener);
        }
    }

    notifyListeners(id, source, args) {
        if (this.#changeListeners.length > 0) {
            this.#eventsBeingSend++;

            this.#changeListeners.forEach(listener => listener(id, source, args));

            this.#eventsBeingSend--;

            if (this.#eventsBeingSend === 0) {
                if (this.#queuedListeners.length) {
                    this.#queuedListeners.forEach( listener => this.#changeListeners.push(listener));
                    this.#queuedListeners = [];
                }

                if (this.#removedListeners.length) {
                    this.#removedListeners.forEach( listener => this.#changeListeners.splice(this.#changeListeners.findIndex(v => v === listener), 1));   
                    this.#removedListeners = [];  
                }
            }
        }
    }

    hasListener = (listener) => this.#changeListeners.findIndex(l => listener === l) >= 0;
}
