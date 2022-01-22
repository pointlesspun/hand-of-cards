'use strict';

import { SpriteAtlas } from "./sprite-atlas.js";

export class CardDefinition {
    /**
     * 
     * @param {string} name 
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
}
