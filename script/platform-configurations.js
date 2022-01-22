
'use strict';

/**
 * Configurations used in the demo.
 */

import { PlatformConfiguration, ORIENTATION_NAMES } from "./media-configuration.js"

export const PLATFORM_CONFIGURATIONS = [
    new PlatformConfiguration("phone-landscape", ORIENTATION_NAMES.LANDSCAPE, 900, 480, {
        baseScale: 0.75,
        dynamicScale: 0.25,
        rotation: 4,
        
        // 1/3 closer to the active card from the base position
        xTranslation: 360 / 3,

        yBaseOffset: 80,

        yTranslation: 4,

        // offset when a card is selected
        ySelectedOffset: -60,

        // inverse of yBaseOffset so the active card is entirely visible
        yActiveOffset: -80,

        cardWidth : 336,
        cardHeight : 432
    }),

    new PlatformConfiguration("phone-portrait", ORIENTATION_NAMES.PORTRAIT, 480, 900, {
        baseScale: 0.75,
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

        cardWidth : 720,
        cardHeight : 1080
    }),

    new PlatformConfiguration("laptop/desktop-x", ORIENTATION_NAMES.LANDSCAPE, 999999, 999999, {
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

