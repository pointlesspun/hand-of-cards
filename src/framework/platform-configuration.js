"use strict";

import { contract } from "./contract.js";
/*
 * Configuration definitions for a given media and its dimensions.
 */

import { Size } from "./size.js";

export const ORIENTATION_NAMES = {
    PORTRAIT: "portrait",
    LANDSCAPE: "landscape",
};

/**
 * Function to detect the user's browser
 * see https://stackoverflow.com/a/9851769
 */

export function detectBrowser() {
    // Opera 8.0+
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(" OPR/") >= 0;

    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== "undefined";

    // Safari 3.0+ "[object HTMLElementConstructor]"
    var isSafari =
        /constructor/i.test(window.HTMLElement) ||
        (function (p) {
            return p.toString() === "[object SafariRemoteNotification]";
        })(!window["safari"] || (typeof safari !== "undefined" && window["safari"].pushNotification));

    // Internet Explorer 6-11
    var isIE = /*@cc_on!@*/ false || !!document.documentMode;

    // Edge 20+
    var isEdge = !isIE && !!window.StyleMedia;

    // Chrome 1 - 79
    var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

    // Edge (based on chromium) detection
    var isEdgeChromium = isChrome && navigator.userAgent.indexOf("Edg") != -1;

    // Blink engine detection
    var isBlink = (isChrome || isOpera) && !!window.CSS;

    return {
        isOpera,
        isFirefox,
        isSafari,
        isIE,
        isEdge,
        isChrome,
        isEdgeChromium,
        isBlink,
    };
}

/**
 * Definition of what settings to apply given a certain screen size and orientation
 */
export class PlatformConfiguration {

    /**
     * Available configurations, needs to be defined on the application level
     */
    static CONFIGURATIONS = null;

    /**
     *
     * @param {string} name
     * @param {*} orientation
     * @param {number} maxScreenWidth
     * @param {number} maxScreenHeight
     * @param {*} settings
     */
    constructor(name, orientation, maxScreenWidth, maxScreenHeight, settings) {
        this.name = name;
        this.size = new Size(maxScreenWidth, maxScreenHeight);
        this.orientation = orientation;
        this.settings = settings;
    }

    updateRuntimeValues(clientSize) {
        this.screenSize = new Size(window.screen.width, window.screen.height);
        this.clientSize = clientSize;

        const orientation = window.matchMedia("(orientation: portrait)");
        this.orientation = orientation.matches ? ORIENTATION_NAMES.PORTRAIT : ORIENTATION_NAMES.LANDSCAPE;

        return this;
    }

    matches(orientation, width, height) {
        return orientation === this.orientation && width < this.size.width && height < this.size.height;
    }

    matchesSize(orientation, size) {
        return orientation === this.orientation && size.width < this.size.width && size.height < this.size.height;
    }

    /**
     * Given a number of configurations to chose from, selects the one which fits the current screensize and
     * orientation best.
     * @returns {PlatformConfiguration}
     */
    static selectMatch(clientSize) {
        contract.isDefined(clientSize);
        contract.isArray(PlatformConfiguration.CONFIGURATIONS, "Configurations have not been defined. Create configurations first (ie PlatformConfiguration.CONFIGURATIONS =[...]).");

        const screenSize = new Size(window.screen.width, window.screen.height);
        const orientation = window.matchMedia("(orientation: portrait)").matches
            ? ORIENTATION_NAMES.PORTRAIT
            : ORIENTATION_NAMES.LANDSCAPE;

        return (
            PlatformConfiguration.CONFIGURATIONS.find((config) => config.matchesSize(orientation, screenSize)) ??
            PlatformConfiguration.CONFIGURATIONS.at(configurations.length - 1)
        ).updateRuntimeValues(clientSize);
    }
}

