import { ELEMENT_TYPES } from "../framework/element-types.js";

export class IndicatorComponent extends React.Component {
  constructor(props) {

    super(props);

    this.state = {
        data: props.data,
        isDataSelected: props.isDataSelected,
        activeIndex: props.activeIndex,
        onClick: props.onClick
    };
  }

  /**
   * 
   * @returns
   */
   render() {
    const properties = {
      className: "indicators",
    };

    return React.createElement(ELEMENT_TYPES.DIV, properties, this.renderIndicatorItems());
  }

  /**
   *
   * @private
   * @param {*} keyPrefix
   * @param {*} callback
   * @param {*} activeIndex
   * @param {*} cards
   * @returns
   */
  renderIndicatorItems = () =>
    this.state.data.map((_, index) =>
      React.createElement(ELEMENT_TYPES.DIV, {
        key: `indicator-${index}`,
        className: `indicator ${
          index === this.state.activeIndex ? "indicator-active" : ""
        } ${this.state.isDataSelected(index) ? "indicator-selected" : ""}`,
        onClick: () => this.onClick(index),
      })
    );

    setActiveIndex = (idx) => this.setState({activeIndex: idx});

    setData = (data) => this.setState({data});
}
