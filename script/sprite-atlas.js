'use strict';

export class SpriteAtlas {
    constructor(url, offset, grid) {
        this.url = url;
        this.offset = offset;
        this.grid = grid;
    }

    toCss(row, column) {
        const x = this.offset.width + column * this.grid.width;
        const y = this.offset.height + row * this.grid.height;

        return `url(${this.url}) ${x}px ${y}px`;
    }
}