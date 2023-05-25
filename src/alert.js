// namespaces
var dwvjq = dwvjq || {};
dwvjq.tool = dwvjq.tool || {};

/**
 * Alert tool: demo tool that does a lot of logging and alerts.
 * In order to activate it:
 * - include it in your html
 * - add it in the app tools when calling app.init
 * @constructor
 * @param {Object} app The associated application.
 */
dwvjq.tool.Alert = function (app) {
  /**
   * Associated GUI.
   * @type Object
   */
  var gui = null;

  /**
   * Handle mouse down event.
   * @param {Object} event The mouse down event.
   */
  this.mousedown = function (event) {
    console.log('[alert:tool:mousedown]');
    console.log(event);
    alert('Alert: mousedown.');
  };

  /**
   * Handle mouse move event.
   * @param {Object} event The mouse move event.
   */
  this.mousemove = function (event) {
    console.log('[alert:tool:mousemove]');
    console.log(event);
  };

  /**
   * Handle mouse up event.
   * @param {Object} event The mouse up event.
   */
  this.mouseup = function (event) {
    console.log('[alert:tool:mouseup]');
    console.log(event);
    alert('Alert: mouseup.');
  };

  /**
   * Setup the tool GUI.
   * Called when the app is created.
   */
  this.setup = function () {
    console.log('[alert:tool:setup]');

    gui = new dwvjq.gui.Alert(app);
    gui.setup();
  };

  /**
   * Display the tool.
   * Called when switching tools: the last enabled tool is hidden
   *  and the current one shown.
   * @param {Boolean} bool The flag to display or not.
   */
  this.display = function (bool) {
    console.log('[alert:tool:display]');
    console.log('bool: ' + bool);

    gui.display(bool);
  };

  /**
   * Initialise the tool.
   * Called once an image has been loaded.
   */
  this.init = function () {
    console.log('[alert:tool:init]');

    gui.initialise();
  };
}; // Alert class

/**
 * Help for this tool.
 * @return {Object} The help content.
 */
dwvjq.tool.Alert.prototype.getHelp = function () {
  return {
    title: 'Alert',
    brief: 'Keeps calling alert!',
    mouse: {
      mouse_drag: 'This will launch an alert!'
    },
    touch: {
      touch_drag: 'This will launch an alert!'
    }
  };
};

/**
 * Alert tool GUI.
 * @param {Object} app The associated application.
 */
dwvjq.gui.Alert = function (app) {
  /**
   * Setup the tool GUI.
   * Called by the tool setup method.
   */
  this.setup = function () {
    console.log('[alert:gui:setup]');

    var button = document.createElement('button');
    button.id = 'alert-button';
    button.value = 'Alert';
    // let the app handle the tool change
    button.onclick = function (event) {
      app.setTool(event.currentTarget.value);
    };
    button.appendChild(document.createTextNode('Alert!'));

    // the app handles finding the document HTML element
    // so that they are all in the same div.
    var node = document.getElementById('dwv-toolbar');
    node.appendChild(button);
  };

  /**
   * Display the tool.
   * Called by the tool display method.
   * @param {Boolean} bool The flag to display or not.
   */
  this.display = function (bool) {
    console.log('[alert:gui:display]');
    console.log('bool: ' + bool);

    var button = document.getElementById('alert-button');
    button.disabled = bool;
  };

  /**
   * Initialise the tool.
   * Called by the tool init method.
   */
  this.initialise = function () {
    console.log('[alert:gui:initialise]');
  };
};
