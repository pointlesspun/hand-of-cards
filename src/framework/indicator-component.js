import { ELEMENT_TYPES } from "./element-types.js";

export class IndicatorComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            dataCount: props.dataCount,
            isDataSelected: props.isDataSelected,
            activeIndex: props.activeIndex,
            onClick: props.onClick,
        };
    }

    /**
     *
     * @returns
     */
    render = () =>
        React.createElement(
            ELEMENT_TYPES.DIV,
            {
                className: "indicators",
            },
            this.renderIndicatorItems()
        );

    /**
     *
     * @private
     * @returns a react element
     */
    renderIndicatorItems() {
        let result = [];
        for (let i = 0; i < this.state.dataCount; i++) {
            result.push(
                React.createElement(ELEMENT_TYPES.DIV, {
                    key: `indicator-${i}`,
                    className: `indicator ${i === this.state.activeIndex ? "indicator-active" : ""} ${
                        this.state.isDataSelected(i) ? "indicator-selected" : ""
                    }`,
                    onClick: () => this.onClick(i),
                })
            );
        }
        return result;
    }

    setActiveIndex = (idx) => this.setState({ activeIndex: idx });

    setDataCount = (dataCount) => this.setState({ dataCount });
}
