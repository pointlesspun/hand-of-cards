import { ELEMENT_TYPES } from "./element-types.js";
import eventBus from "./event-bus.js";

export const TOAST_TOPIC = "topic.toast";

const MESSAGE_KEY_PREFIX = "toast-message-";

export class ToastComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            messages: props.initialMessages.map( (text, idx) => ({
                text, 
                key: MESSAGE_KEY_PREFIX + idx
            })),
            keyCounter: props.initialMessages.length,
        };
    }

    componentDidMount() {
        eventBus.on(TOAST_TOPIC , (data) => this.addMessage(data.message, data.id));
      }

      componentWillUnmount() {
        eventBus.remove(TOAST_TOPIC);
      }

      /**
       * Send a message to the toaster 
       * @param {html} message contains the html text displayed
       * @param {string} [id] if defined the message will be ignored if there are other messages showing 
       * with the same id
       */
    addMessage(message, id) {
        if (!id || !this.state.messages.find( m => m.id === id)) {
            this.setState({
                messages: [{
                        text: message, 
                        key: MESSAGE_KEY_PREFIX + this.state.keyCounter,
                        id
                    },
                    ...this.state.messages
                ],
                keyCounter: this.state.keyCounter +1
            });
        }
    }

    removeMessage(key) {
        this.setState({messages: this.state.messages.filter( m => m.key !== key)});
    }

    render() {

        const containerProperties = {
            className: "toast-container"
        };

        const rows = this.state.messages.map( (message) => 
            React.createElement(ELEMENT_TYPES.DIV, {className: "toast-row", key: message.key }, 
                React.createElement(ELEMENT_TYPES.DIV, {
                    className: "toast-component",
                    onAnimationEnd: () => this.removeMessage(message.key),
                    dangerouslySetInnerHTML: { __html: message.text }
                }))
        );
        
        return React.createElement(ELEMENT_TYPES.DIV, containerProperties, rows);
    }
}