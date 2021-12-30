// namespaces
var dwvjq = dwvjq || {};
dwvjq.gui = dwvjq.gui || {};

/**
 * Dropbox loader.
 * Listens to drag events on the layer container and
 * uses a drop box element as first display.
 * @constructor
 * @param {Object} app The associated application.
 */
dwvjq.gui.DropboxLoader = function (app) {

  // drop box class name
  var dropboxDivId = 'dropBox';
  var dropboxClassName = 'dropBox';
  var borderClassName = 'dropBoxBorder';
  var hoverClassName = 'hover';

  /**
   * Initialise the drop box.
   */
  this.init = function () {
    this.showDropbox(true);
  };

  /**
  * Basic handle drag event.
  * @private
  * @param {Object} event The event to handle.
   */
  function defaultHandleDragEvent(event) {
    // prevent default handling
    event.stopPropagation();
    event.preventDefault();
  }

  /**
  * Switch the hover css.
  * @private
  * @param {boolean} show Is the box shown or not.
   */
  function switchHoverCss(show) {
    var box = document.getElementById(dropboxDivId);
    if (box) {
      if (show && box.className.indexOf(hoverClassName) === -1) {
        box.className += ' ' + hoverClassName;
      }
      if (!show && box.className.indexOf(hoverClassName) !== -1) {
        box.className = box.className.replace(' ' + hoverClassName, '');
      }
    }
  }

  /**
   * Handle a drag over.
   * @private
   * @param {Object} event The event to handle.
   */
  function onBoxDragOver(event) {
    defaultHandleDragEvent(event);
    // update box border
    switchHoverCss(true);
  }

  /**
   * Handle a drag leave.
   * @private
   * @param {Object} event The event to handle.
   */
  function onBoxDragLeave(event) {
    defaultHandleDragEvent(event);
    // update box border
    switchHoverCss(false);
  }

  /**
   * Handle a drop event.
   * @private
   * @param {Object} event The event to handle.
   */
  function onDrop(event) {
    defaultHandleDragEvent(event);
    // load files
    var files = event.dataTransfer.files;
    if (files.length !== 0) {
      app.loadFiles(files);
    } else {
      console.warn('Drop of empty file list.');
      switchHoverCss(false);
    }
  }

  /**
   * Show or hide the data load drop box.
   * @param {boolean} show Flag to show or hide.
   */
  this.showDropbox = function (show) {
    var box = document.getElementById(dropboxDivId);
    if (!box) {
      return;
    }
    var layerDiv = document.getElementById('layerGroup0');

    if (show) {
      // reset css class
      box.className = dropboxClassName + ' ' + borderClassName;
      // add content if empty
      if (box.innerHTML === '') {
        var p = document.createElement('p');
        p.appendChild(document.createTextNode('Drag and drop data here'));
        box.appendChild(p);
      }
      // show box
      box.setAttribute('style', 'display:initial');
      // stop layer listening
      if (layerDiv) {
        layerDiv.removeEventListener('dragover', defaultHandleDragEvent);
        layerDiv.removeEventListener('dragleave', defaultHandleDragEvent);
        layerDiv.removeEventListener('drop', onDrop);
      }
      // listen to box events
      box.addEventListener('dragover', onBoxDragOver);
      box.addEventListener('dragleave', onBoxDragLeave);
      box.addEventListener('drop', onDrop);
    } else {
      // remove border css class
      box.className = dropboxClassName;
      // remove content
      box.innerHTML = '';
      // hide box
      box.setAttribute('style', 'display:none');
      // stop box listening
      box.removeEventListener('dragover', onBoxDragOver);
      box.removeEventListener('dragleave', onBoxDragLeave);
      box.removeEventListener('drop', onDrop);
      // listen to layer events
      if (layerDiv) {
        layerDiv.addEventListener('dragover', defaultHandleDragEvent);
        layerDiv.addEventListener('dragleave', defaultHandleDragEvent);
        layerDiv.addEventListener('drop', onDrop);
      }
    }
  };
}; // dwvjq.gui.dropboxLoader
