'use strict';

import { PlatformConfiguration, ORIENTATION_NAMES } from "./framework/media-configuration.js"
import { CardLayout } from "./card-game/card-layout.js";

/*
 * Configurations used in the demo to adapt to different screen sizes and game states.
 */
export const PLATFORM_CONFIGURATIONS = [
    new PlatformConfiguration("phone-landscape", ORIENTATION_NAMES.LANDSCAPE, 900, 480, new CardLayout({
        innerHeight: 0.78,
        playAnimationY: 0.11,
        baseScale: 0.35,
        xTranslation: 160,
        ySelectedOffset: -60,
        yActiveOffset: -80,
    })),

    new PlatformConfiguration("phone-portrait", ORIENTATION_NAMES.PORTRAIT, 480, 900, new CardLayout({
        innerHeight: 0.9,
        playAnimationY: 0.5,
        baseScale: 1.9,
        xTranslation: 120,
        ySelectedOffset: -100,
        yActiveOffset: -100
    })),

    new PlatformConfiguration("laptop/desktop", ORIENTATION_NAMES.LANDSCAPE, 999999, 999999, new CardLayout())
];

