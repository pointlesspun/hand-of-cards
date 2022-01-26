'use strict';

import { SpriteAtlas } from "../framework/sprite-atlas.js";

/**
 * Defines a immutable properties of a card: the graphics and name.
 */
export class CardDefinition {
    /**
     * 
     * @param {string} name Name of the card
     * @param {SpriteAtlas} atlas 
     * @param {number} row 
     * @param {number} column 
     */
    constructor(name, atlas, row, column) {
        this.name = name;
        this.atlas = atlas;
        this.row = row;
        this.column = column;
    }

    toCss() {
        return this.atlas.toCss(this.row, this.column);
    }
}
