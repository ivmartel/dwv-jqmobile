// namespaces
var dwv = dwv || {};
dwv.utils = dwv.utils || {};

/**
 * ListenerHandler class: handles add/removing and firing listeners.
 *
 * @class
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget#example
 */
dwv.utils.ListenerHandler = function () {
  /**
   * listeners.
   *
   * @private
   */
  var listeners = {};

  /**
   * Add an event listener.
   *
   * @param {string} type The event type.
   * @param {object} callback The method associated with the provided
   *    event type, will be called with the fired event.
   */
  this.add = function (type, callback) {
    // create array if not present
    if (typeof listeners[type] === 'undefined') {
      listeners[type] = [];
    }
    // add callback to listeners array
    listeners[type].push(callback);
  };

  /**
   * Remove an event listener.
   *
   * @param {string} type The event type.
   * @param {object} callback The method associated with the provided
   *   event type.
   */
  this.remove = function (type, callback) {
    // check if the type is present
    if (typeof listeners[type] === 'undefined') {
      return;
    }
    // remove from listeners array
    for (var i = 0; i < listeners[type].length; ++i) {
      if (listeners[type][i] === callback) {
        listeners[type].splice(i, 1);
      }
    }
  };

  /**
   * Fire an event: call all associated listeners with the input event object.
   *
   * @param {object} event The event to fire.
   */
  this.fireEvent = function (event) {
    // check if they are listeners for the event type
    if (typeof listeners[event.type] === 'undefined') {
      return;
    }
    // fire events from a copy of the listeners array
    // to avoid interference from possible add/remove
    var stack = listeners[event.type].slice();
    for (var i = 0; i < stack.length; ++i) {
      stack[i](event);
    }
  };
};
