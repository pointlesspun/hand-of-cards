import { ELEMENT_TYPES } from "./element-types.js";

/**
 * Class capturing the data of an icon button
 */
export class IconButton {
    constructor(className, onClick, iconName) {
        this.className = className;
        this.onClick = onClick;
        this.iconName = iconName;
    }

    render = (key) =>
        this.iconName ? this.renderMaterialIconButton(key) : this.renderCustomIconButton(key);

    renderCustomIconButton = (key) =>
        React.createElement(ELEMENT_TYPES.DIV, {
            key,
            className: this.className,
            onClick: () => this.onClick(),
        });

    renderMaterialIconButton = (key) =>
        React.createElement(
            ELEMENT_TYPES.SPAN,
            {
                key,
                className: `material-icons ${this.className}`,
                onClick: () => this.onClick(),
            },
            this.iconName
        );
}

/**
 * React component rendering a number of icon buttons
 */
export class IconButtonPanelComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    render = () =>
        React.createElement(
            ELEMENT_TYPES.DIV,
            {
                className: "button-panel",
            },
            this.props.buttons.map((button, index) => button.render(`${this.props.keyReference}-button-panel-button-${index}`))
        );
}
