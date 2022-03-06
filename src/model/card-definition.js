'use strict';

/**
 * Defines a immutable properties of a card: name and id.
 */
export class CardDefinition {
    /**
     * @param {number} id unique id of the definition
     * @param {string} name Name of the card
     */
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }

    toString() {
        return this.name;
    }
}
