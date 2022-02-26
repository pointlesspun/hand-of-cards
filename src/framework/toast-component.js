import { ELEMENT_TYPES } from "./element-types.js";
import eventBus from "./event-bus.js";

/**
 * Topic used to identify toast messages on the global event bus. Example of usage:
 * <pre>eventBus.dispatch(TOAST_TOPIC, { message, id: "platform-changed" });</pre>
 */
export const TOAST_TOPIC = "topic.toast";

/**
 * Message format to define information relevant to the toast.
 */
export class ToastMessage {
    static keyCounter = 0;

    text = "";
    delay = 2.0;
    id = null;

    constructor(text, delay = 2.0, id = null) {
        /**
         * Used to identify messages
         * @private
         * @type {number}
         */
        this.key = ToastMessage.keyCounter;
        this.text = text;
        this.delay = delay;
        this.id = id;

        ToastMessage.keyCounter++;
    }
}

/**
 * Component which can show toast messages either added directly or send via an eventbus.
 */
export class ToastComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            messages: props.initialMessages.map((msg) => (typeof msg !== "string" ? msg : new ToastMessage(msg))),
        };
    }

    // --- React overrides --------------------------------------------------------------------------------------------
    
    render() {
        const containerProperties = {
            className: "toast-container",
        };

        const rows = this.state.messages.map((message) => {
            const ref = React.createRef();

            return React.createElement(
                ELEMENT_TYPES.DIV,
                { className: "toast-row", key: message.key },
                React.createElement(ELEMENT_TYPES.DIV, {
                    ref,
                    key: message.key + "-component",
                    className: "toast-component",
                    onAnimationEnd: () => this.handleAnimationComplete(ref, message.key, message.delay),
                    dangerouslySetInnerHTML: { __html: message.text },
                })
            );
        });

        return React.createElement(ELEMENT_TYPES.DIV, containerProperties, rows);
    }

    componentDidMount() {
        eventBus.on(TOAST_TOPIC, (message) => this.addToastMessage(message));
    }

    componentWillUnmount() {
        eventBus.remove(TOAST_TOPIC);           
    }

    // --- State mutations & queries ----------------------------------------------------------------------------------

    /**
     * Send a message to the toaster
     * @param {string} message (html) contains the html text displayed
     * @param {string} [id] if defined the message will be ignored if there are other messages showing
     * with the same id
     */
    addMessage(message, id, delay = 2.0) {
        if (!id || !this.state.messages.find((m) => m.id === id)) {
            this.setState({
                messages: [new ToastMessage(message, delay, id), ...this.state.messages],
            });
        }
    }

    addToastMessage(message) {
        if (!message.id || !this.state.messages.find((m) => m.id === message.id)) {
            this.setState({
                messages: [message, ...this.state.messages],
            });
        }
    }

    removeMessage(key) {
        this.setState({ messages: this.state.messages.filter((m) => m.key !== key) });
    }

    // --- Utility methods  -------------------------------------------------------------------------------------------

    /**
     *
     * @private
     * @param {React.ref} ref
     * @param {*} key an id to indentitfy the message which was completed
     * @param {number} delay in seconds. How long before the toastAnimationLeave animation is played.
     */
    handleAnimationComplete(ref, key, delay) {
        if (ref.current && ref.current.style["animation-name"] !== "toastAnimationLeave") {
            ref.current.style["animation-name"] = "toastAnimationLeave";
            ref.current.style["animation-delay"] = `${delay}s`;
        } else {
            this.removeMessage(key);
        }
    }
}
