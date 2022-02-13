import { ELEMENT_TYPES } from "./element-types.js";

export class IconButton {
    constructor(className, onClick) {
        this.className = className;
        this.onClick = onClick;
    }
}

export class IconButtonPanelComponent extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
 
        return React.createElement(ELEMENT_TYPES.DIV, {
            className: "button-panel"
          }, this.props.buttons.map( (button, idx) => React.createElement(ELEMENT_TYPES.DIV, {
            key: `${this.props.keyReference}-button-panel-button-${idx}`,
            className: button.className,
            onClick: () => button.onClick()
          })));
    }
}