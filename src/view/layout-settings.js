"use strict";

import { Transform } from "../framework/transform.js";
import { CardLayoutCollection } from "./card-layout-collection.js";

export class LayoutSettings {

    /**
     * @type {CardLayoutCollection}
     */
    layoutCollection = null;

    /**
     * @type {[Transform]}
     */
    carouselStyles = null;

    constructor(layoutCollection, carouselStyle) {
        this.layoutCollection = layoutCollection;
        this.carouselStyles = carouselStyle;
    }
}