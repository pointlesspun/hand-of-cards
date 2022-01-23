'use strict';

/**
 * Class implementing a Sprite (or texture) atlas. See https://en.wikipedia.org/wiki/Texture_atlas.
 */

export class SpriteAtlas {
    constructor(url, offset, grid) {
        this.url = url;
        this.offset = offset;
        this.grid = grid;
    }

    /**
     * Creates a css string which can be used after a background image property
     * @param {number} row 
     * @param {number} column 
     * @returns {string} stating the url and offset in pixels
     */
    toCss(row, column) {
        const x = this.offset.width + column * this.grid.width;
        const y = this.offset.height + row * this.grid.height;

        return `url(${this.url}) ${x}px ${y}px`;
    }
}