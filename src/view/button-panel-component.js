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
        }

        this.playHandler = props.playHandler;
        this.drawCardsHandler = props.drawCardsHandler;
        this.toggleLockHandler = props.toggleLockHandler;
        this.nextPlayerHandler = props.nextPlayerHandler;
    }

    onPlay(playHandler) {
        this.playHandler = playHandler;
    }

    onDrawCards(drawCardsHandler) {
        this.drawCardsHandler = drawCardsHandler;
    }

    onToggleLock(toggleLockHandler) {
        this.toggleLockHandler = toggleLockHandler;
    }

    onNextPlayer(nextPlayerHandler) {
        this.nextPlayerHandler = nextPlayerHandler;
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
                    () => this.state.isPlayButtonEnabled && this.playHandler()
                ),
                new IconButton(
                    `button-panel-button refill-button ${
                        this.state.isDrawButtonEnabled ? "" : "button-panel-button-disabled"
                    }`,
                    () => this.state.isDrawButtonEnabled && this.drawCardsHandler()
                ),
                new IconButton(`button-panel-button ${this.state.isLocked ? "lock-button" : "lock-button-open"}`, () =>
                    this.toggleLockHandler()
                ),
                new IconButton(`md-64 defaultColor material-panel-button`, () =>
                    this.nextPlayerHandler(),
                    "next_plan"
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