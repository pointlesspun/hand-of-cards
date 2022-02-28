'use strict';

import { PlatformConfiguration, ORIENTATION_NAMES } from "./framework/platform-configuration.js"

import { CardLayout } from "./card-game/card-layout.js";
import { CardLayoutCollection } from "./card-game/card-layout-collection.js";

/*
 * Configurations used in the demo to adapt to different screen sizes and game states.
 */
PlatformConfiguration.CONFIGURATIONS = [
    // configuration applicable to small devices in landscape orientation
    new PlatformConfiguration("phone-landscape", ORIENTATION_NAMES.LANDSCAPE, 900, 480, new CardLayoutCollection([ 
        new CardLayout({
            innerHeight: 0.78,
            playAnimationY: 0.11,
            baseScale: 0.35,
            xTranslation: 160,
            ySelectedOffset: -60,
            yActiveOffset: -80,
        })
    ])),

    // configuration applicable to small devices in portrait orientation
    new PlatformConfiguration("phone-portrait", ORIENTATION_NAMES.PORTRAIT, 480, 900, new CardLayoutCollection([ 
        new CardLayout({
            innerHeight: 0.9,
            playAnimationY: 0.5,
            baseScale: 1.9,
            xTranslation: 120,
            ySelectedOffset: -100,
            yActiveOffset: -100
        })
    ])),

    // default (large) devices in landscape
    new PlatformConfiguration("laptop/desktop", ORIENTATION_NAMES.LANDSCAPE, 999999, 999999, new CardLayoutCollection([
        // layout applied when the hand contains 3 or less cards
        new CardLayout({
            maxCardCount: 3,
            baseScale: 1,
            dynamicScale: 0,
            rotation: 0,
            xTranslation: 362,
        }), 

        // layout applied when the hand contains 5 or less cards
        new CardLayout({
            maxCardCount: 5,
            baseScale: 0.9,
            dynamicScale: 0.1,
            rotation: 2,
            xTranslation: 260,
        }), 

        // default layout applied when none of the other layouts apply
        new CardLayout()
    ]))
];

