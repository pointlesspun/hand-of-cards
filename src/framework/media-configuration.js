'use strict';

/*
 * Configuration definitions for a given media and its dimensions.
 */

import { Size } from "./size.js";

export const ORIENTATION_NAMES = {
    PORTRAIT: "portrait",
    LANDSCAPE: "landscape"
};

export class PlatformConfiguration {
    constructor(name, orientation, maxScreenWidth, maxScreenHeight, config) {
        this.name = name;
        this.size = new Size(maxScreenWidth, maxScreenHeight);
        this.orientation = orientation;
        this.config = config;
    }

    matches(orientation, width, height) {
        return orientation === this.orientation 
            && width < this.size.width
            && height < this.size.height;
    }

    matchesSize(orientation, size) {
        return orientation === this.orientation 
            && size.width < this.size.width
            && size.height < this.size.height;
    }
}

export class MediaConfiguration {
    constructor(elementRef, platformConfigurations) {
        this.elementRef = elementRef;
        this.screenSize = new Size(window.screen.width, window.screen.height);
        this.clientSize = new Size(elementRef.current.clientWidth, elementRef.current.clientHeight);

        const orientation = window.matchMedia("(orientation: portrait)");
        this.orientation = orientation.matches ? ORIENTATION_NAMES.PORTRAIT :  ORIENTATION_NAMES.LANDSCAPE;

        // take the first config which matches the given orientation and size or default to the last config in the list
        const matchingConfig = platformConfigurations.find(c => c.matchesSize(this.orientation, this.screenSize)) ??
                                platformConfigurations.at(platformConfigurations.length -1);

        this.values = matchingConfig.config;
        this.name = matchingConfig.name;
    } 
}