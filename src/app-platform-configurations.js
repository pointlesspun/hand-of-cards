'use strict';

import { PlatformConfiguration, ORIENTATION_NAMES } from "./framework/platform-configuration.js"

import { CardLayout } from "./view/card-layout.js";
import { CardLayoutCollection } from "./view/card-layout-collection.js";

/*
 * Configurations used in the demo to adapt to different screen sizes and game states.
 */
PlatformConfiguration.CONFIGURATIONS = [
    // configuration applicable to small devices in landscape orientation
    new PlatformConfiguration("phone-landscape", ORIENTATION_NAMES.LANDSCAPE, 900, 480, new CardLayoutCollection([ 
        // layout applied when the hand contains 3 or less cards
        new CardLayout({
            maxCardCount: 3,
            innerHeight: 0.78,
            playAnimationY: 0.11,
            
            baseScale: 0.5,
            dynamicScale: 0.0,
            
            rotation: 0,

            xTranslation: 180,
            
            yBaseOffset: 90,
            yTranslation: 0,
            ySelectedOffset: -50,
            yActiveOffset: -40,
            
        }),
        // layout applied when the hand contains 5 or less cards
        new CardLayout({
            maxCardCount: 5,
            innerHeight: 0.78,
            playAnimationY: 0.11,
            
            baseScale: 0.4,
            dynamicScale: 0.1,
            
            rotation: 2,

            xTranslation: 160,
            
            yBaseOffset: 90,
            yTranslation: 3,
            ySelectedOffset: -50,
            yActiveOffset: -40,
            
        }),
        // default layout applied when none of the other layouts apply
        new CardLayout({
            maxCardCount: -1,
            innerHeight: 0.78,
            playAnimationY: 0.11,
            baseScale: 0.3,
            xTranslation: 120,
            ySelectedOffset: -40,
            yActiveOffset: -30,
            rotation: 3.5,
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

