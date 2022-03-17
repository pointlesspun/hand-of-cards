"use strict";

import { CardLayoutCollection } from "./card-layout-collection.js";

/**
 * Collection of data determining the overall layout of cards and carousels
 */
export class LayoutSettings {

    /**
     * @type {CardLayoutCollection}
     */
    layoutCollection = null;

    /**
     * @type {[string]}
     */
    carouselClassNames = null;

    constructor(layoutCollection, carouselClassNames) {
        this.layoutCollection = layoutCollection;
        this.carouselClassNames = carouselClassNames;
    }
}