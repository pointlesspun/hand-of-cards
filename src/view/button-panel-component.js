import { IconButton, IconButtonPanelComponent } from "../framework/icon-button-panel-component.js";

/**
 * Component which contains all action buttons for a given card game.
 */
export class ButtonPanelComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLocked: props.isLocked,
            isPlayButtonEnabled: props.playButtonEnabled,
            isDrawButtonEnabled: props.drawButtonEnabled,
            playHandler: props.playHandler,
            drawCardsHandler: props.drawCardsHandler,
            toggleLockHandler: props.toggleLockHandler
        }
    }

    render() {
        return React.createElement(IconButtonPanelComponent, {
            key: "cards-button-panel",
            keyReference: "cards-button-panel",
            buttons: [
                new IconButton(
                    `button-panel-button play-button ${
                        this.state.isPlayButtonEnabled ? "" : "button-panel-button-disabled"
                    }`,
                    () => this.state.playHandler()
                ),
                new IconButton(
                    `button-panel-button refill-button ${
                        this.state.isDrawButtonEnabled ? "" : "button-panel-button-disabled"
                    }`,
                    () => this.state.drawCardsHandler()
                ),
                new IconButton(`button-panel-button ${this.state.isLocked ? "lock-button" : "lock-button-open"}`, () =>
                    this.state.toggleLockHandler()
                ),
            ],
        });
    }

    setIsLocked(isLocked) {
        this.setState({isLocked});
    }

    isLocked = () => this.state.isLocked;

    setEnablePlayButton(isPlayButtonEnabled) {
        this.setState({isPlayButtonEnabled});
    }

    setEnableDrawButton(isDrawButtonEnabled) {
        this.setState({isDrawButtonEnabled});
    }
}