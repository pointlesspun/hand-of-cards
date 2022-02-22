/**
 * Taken from Gaurav Singhal: https://www.pluralsight.com/guides/how-to-communicate-between-independent-components-in-reactjs
 */

const eventBus = {
    on(event, callback) {
      document.addEventListener(event, (e) => callback(e.detail));
    },
    /**
     * Send the given event to the document
     * @param {string} eventName 
     * @param {*} data filling the detail property of the event
     */
    dispatch(eventName, data) {
      document.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    },
    remove(event, callback) {
      document.removeEventListener(event, callback);
    },
  };
  
  export default eventBus;