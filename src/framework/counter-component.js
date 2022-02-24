import { ELEMENT_TYPES } from "./element-types.js";

export const INCREMENT_UNITS = {
    ABSOLUTE: 0,
    PERCENTAGE: 1,
};

/**
 * Component implementing an auto-update counter. 
 */
export class CounterComponent extends React.Component {
    constructor(props) {
        super(props);

        this.timerHandle = -1;
        this.divRef = React.createRef();

        this.state = {
            currentValue: props.startValue ?? 0,
            goalValue: props.goalValue,
            minIncrement: props.minIncrement ?? 1,
            increment: props.increment ?? 0.1,
            incrementUnits: props.incrementUnits ?? INCREMENT_UNITS.PERCENTAGE,
            digits: props.digits ?? 0,
            interval: props.interval ?? 50,
            className: props.className,
        };
    }

    // --- React overrides --------------------------------------------------------------------------------------------

    componentDidMount() {
        this.timerHandle = setInterval(() => this.update(), this.state.interval);
    }

    componentWillUnmount() {
        clearInterval(this.timerHandle);
    }

    render() {
        return React.createElement(
            ELEMENT_TYPES.DIV,
            {
                ref: this.divRef,
                className: this.state.className,
            },
            this.state.currentValue.toFixed(this.state.digits)
        );
    }

    // --- State mutations & queries ----------------------------------------------------------------------------------

    setGoalValue(goalValue) {
        this.setState({
            goalValue,
        });
    }

    // --- Utility methods  -------------------------------------------------------------------------------------------

    getBoundingClientRect = () => this.divRef.current.getBoundingClientRect();
        
    update() {
        const difference = this.state.goalValue - this.state.currentValue;
        const distance = Math.abs(difference);

        if (distance > 0) {
            const delta = this.calculateDelta(distance);

            if (delta >= distance) {
                this.setState({
                    currentValue: this.state.goalValue,
                });
            } else {
                this.setState({
                    currentValue: this.state.currentValue + delta * Math.sign(difference),
                });
            }
        }
    }

    calculateDelta(distance) {
        const deltaIncrement =
            this.state.incrementUnits === INCREMENT_UNITS.ABSOLUTE
                ? this.state.increment
                : distance * this.state.increment;

        return deltaIncrement > this.state.minIncrement ? deltaIncrement : this.state.minIncrement;
    }
}
