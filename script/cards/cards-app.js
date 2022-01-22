
import { elementTypes } from "../element-types.js";
import { MediaConfiguration, ORIENTATION_NAMES, PlatformConfiguration } from "../media-configuration.js";
import { CarouselComponent } from "./carousel-component.js";

console.log("starting card component");

const CARD_NAMES = {
    HEARTS_1 : "heart-1",
    HEARTS_2 : "heart-2",
}

const configurations = [
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

const properties = {
    initialItems : [
        CARD_NAMES.HEARTS_1,
        CARD_NAMES.HEARTS_1,
        CARD_NAMES.HEARTS_1,
        CARD_NAMES.HEARTS_1,
        CARD_NAMES.HEARTS_1,
    ],
    initialIndex: 0,
    getLayoutConfiguration: (elementRef) => new MediaConfiguration(elementRef,configurations)            
};

ReactDOM.render(React.createElement(CarouselComponent, properties), document.querySelector('#card-container'));