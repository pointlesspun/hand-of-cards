"use strict";

import { PlatformConfiguration, ORIENTATION_NAMES } from "./framework/platform-configuration.js";

import { CardLayout } from "./view/card-layout.js";
import { CardLayoutCollection } from "./view/card-layout-collection.js";
import { Transform } from "./framework/transform.js";
import { Vector3 } from "./framework/vector3.js";
import { LayoutSettings } from "./view/layout-settings.js";

const SMALL_DEVICE_LANDSCAPE_CARD_LAYOUT = [
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
    }),
];

const SMALL_DEVICE_PORTRAIT_CARD_LAYOUT = [
    new CardLayout({
        innerHeight: 0.9,
        playAnimationY: 0.5,
        baseScale: 1.9,
        xTranslation: 120,
        ySelectedOffset: -100,
        yActiveOffset: -100,
    }),
];

const LARGE_DEVICE_CARD_LAYOUT = [
    // layout applied when the hand contains 3 or less cards
    new CardLayout({
        maxCardCount: 3,
        baseScale: 0.5,
        dynamicScale: 0,
        rotation: 0,
        xTranslation: 181,
    }),

    // layout applied when the hand contains 5 or less cards
    new CardLayout({
        maxCardCount: 5,
        baseScale: 0.3,
        dynamicScale: 0.2,
        rotation: 2,
        xTranslation: 130,
    }),

    // default layout applied when none of the other layouts apply
    new CardLayout({
        baseScale: 0.25,
        dynamicScale: 0.175,
        rotation: 4,
        xTranslation: 120,
    }),
];

const baseScale0 = 0.8;
const baseScale1 = 0.6;

const CAROUSEL_STYLES = [
    {
        height: "100%",
        width: `125%`,
        bottom: `${-(1-baseScale0) * 50}%`,
        left: "-12.5%",
        transformOrigin: "center center",
        transform: new Transform(new Vector3(0, 0, 0), Vector3.ONE.multiply(baseScale0), Vector3.ZERO).toCss(),
    },
    {
        height: "100%",
        width: `100%`,
        top: `${-(1-baseScale1) * 50}%`,
        left: "0px",
        transformOrigin: "center center",
        transform: new Transform(new Vector3(0, 0, 0), Vector3.ONE.multiply(baseScale1), new Vector3(180, 0, 0)).toCss(),
    }
]

const SMALL_DEVICE_LANDSCAPE_LAYOUT_SETTINGS = new LayoutSettings(new CardLayoutCollection(SMALL_DEVICE_LANDSCAPE_CARD_LAYOUT), CAROUSEL_STYLES);
const SMALL_DEVICE_PORTRAIT_LAYOUT_SETTINGS = new LayoutSettings(new CardLayoutCollection(SMALL_DEVICE_PORTRAIT_CARD_LAYOUT), CAROUSEL_STYLES);
const LARGE_DEVICE_LAYOUT_SETTINGS = new LayoutSettings(new CardLayoutCollection(LARGE_DEVICE_CARD_LAYOUT), CAROUSEL_STYLES);

/*
 * Configurations used in the demo to adapt to different screen sizes and game states.
 */
PlatformConfiguration.CONFIGURATIONS = [
    // configuration applicable to small devices in landscape orientation
    new PlatformConfiguration(
        "phone-landscape",
        ORIENTATION_NAMES.LANDSCAPE,
        900,
        480,
        SMALL_DEVICE_LANDSCAPE_LAYOUT_SETTINGS
    ),

    // configuration applicable to small devices in portrait orientation
    new PlatformConfiguration(
        "phone-portrait",
        ORIENTATION_NAMES.PORTRAIT,
        480,
        900,
        SMALL_DEVICE_PORTRAIT_LAYOUT_SETTINGS
    ),

    // default (large) devices in landscape
    new PlatformConfiguration(
        "laptop/desktop",
        ORIENTATION_NAMES.LANDSCAPE,
        999999,
        999999,
        LARGE_DEVICE_LAYOUT_SETTINGS
    ),
];
