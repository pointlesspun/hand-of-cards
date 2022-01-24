'use strict';

/*
 * Configurations used in the demo to adapt to different screen sizes.
 */

import { PlatformConfiguration, ORIENTATION_NAMES } from "./media-configuration.js"

export const PLATFORM_CONFIGURATIONS = [
    new PlatformConfiguration("phone-landscape", ORIENTATION_NAMES.LANDSCAPE, 900, 480, {

        // Inner takes up 80% of the client height
        innerHeight: 0.8,

        baseScale: 0.35,
        dynamicScale: 0.25,
        rotation: 4,
        
        // closer to the active card from the base position
        xTranslation: 360 / 2.25,

        yBaseOffset: 80,

        yTranslation: 4,

        // offset when a card is selected
        ySelectedOffset: -60,

        // inverse of yBaseOffset so the active card is entirely visible
        yActiveOffset: -80,

        cardWidth : 360,
        cardHeight : 540
    }),

    new PlatformConfiguration("phone-portrait", ORIENTATION_NAMES.PORTRAIT, 480, 900, {
        // Inner takes up % of the client height
        innerHeight: 0.9,

        baseScale: 1.9,
        dynamicScale: 0.25,
        rotation: 4,
        
        // 1/3 closer to the active card from the base position
        xTranslation: 360 / 3,

        yBaseOffset: 80,

        yTranslation: 4,

        // offset when a card is selected
        ySelectedOffset: -100,

        // inverse of yBaseOffset so the active card is entirely visible
        yActiveOffset: -100,

        cardWidth : 360,
        cardHeight : 540
    }),

    new PlatformConfiguration("laptop/desktop", ORIENTATION_NAMES.LANDSCAPE, 999999, 999999, {
        // Inner takes up % of the client height
        innerHeight: 0.845,
        baseScale: 0.75,
        dynamicScale: 0.25,
        rotation: 4,
        
        // 1/2 closer to the active card from the base position
        xTranslation: 360 / 2,

        yBaseOffset: 80,

        yTranslation: 4,

        // offset when a card is selected
        ySelectedOffset: -60,

        // inverse of yBaseOffset so the active card is entirely visible
        yActiveOffset: -82,

        cardWidth : 360,
        cardHeight : 540
    })
]

