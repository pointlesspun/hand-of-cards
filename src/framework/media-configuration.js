'use strict';

import { contract } from "./contract.js";
/*
 * Configuration definitions for a given media and its dimensions.
 */

import { Size } from "./size.js";

export const ORIENTATION_NAMES = {
    PORTRAIT: "portrait",
    LANDSCAPE: "landscape"
};

// see https://stackoverflow.com/a/9851769
export function detectBrowser() {
    // Opera 8.0+
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== 'undefined';

    // Safari 3.0+ "[object HTMLElementConstructor]" 
    var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification));

    // Internet Explorer 6-11
    var isIE = /*@cc_on!@*/false || !!document.documentMode;

    // Edge 20+
    var isEdge = !isIE && !!window.StyleMedia;

    // Chrome 1 - 79
    var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

    // Edge (based on chromium) detection
    var isEdgeChromium = isChrome && (navigator.userAgent.indexOf("Edg") != -1);

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
        isBlink
    };
}

export class PlatformConfiguration {
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

    constructor(clientSize, platformConfig) {
        contract.isDefined(clientSize, "MediaConfiguration requires a valid clientSize (but was undefined or null).");
        contract.isDefined(platformConfig, "MediaConfiguration requires valid settings (but was undefined or null).");

        this.screenSize = new Size(window.screen.width, window.screen.height);
        this.clientSize = clientSize;

        const orientation = window.matchMedia("(orientation: portrait)");
        this.orientation = orientation.matches ? ORIENTATION_NAMES.PORTRAIT :  ORIENTATION_NAMES.LANDSCAPE;

        this.platformConfig = platformConfig;
        this.settings = platformConfig.settings;
        this.name = platformConfig.name;
    } 
}

export function selectPlatformConfiguration( configurations) {
    const screenSize = new Size(window.screen.width, window.screen.height);
    const orientation = window.matchMedia("(orientation: portrait)").matches ? ORIENTATION_NAMES.PORTRAIT :  ORIENTATION_NAMES.LANDSCAPE;
    
    return configurations.find((config) => config.matchesSize(orientation, screenSize)) ?? configurations.at(configurations.length - 1);
}

