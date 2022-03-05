import { CardRenderService } from "./card-game/card-render-service.js";
import { ELEMENT_TYPES } from "./framework/element-types.js";

const renderCardChildren = (context) => [
    React.createElement(ELEMENT_TYPES.DIV, { 
        key: "card-content",
        style: {
            background: context.definition.toCss(),
            width: "100%",
            height: "100%",
            position: "absolute",
            left: "0px",
            top: "0px",
            zIndex: 0
        }
    }),
    React.createElement(ELEMENT_TYPES.DIV, { 
        key: "card-overlay",
        className: `card-overlay${context.hasFocus ? "-focus" : ""}`,
    })
];

CardRenderService.registerRenderFunction(0, renderCardChildren);