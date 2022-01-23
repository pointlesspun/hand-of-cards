'use strict';

/*
 * Math utilties and datastructures.
 */

export class Size {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
}


export const mathx = {

    clamp : (value, min, max) => Math.max(Math.min(value, max - 1), min),
}