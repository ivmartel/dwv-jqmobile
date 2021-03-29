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
  var dropboxClassName = 'dropBox';
  var borderClassName = 'dropBoxBorder';
  var hoverClassName = 'hover';

  /**
   * Initialise the drop box.
   */
  this.init = function () {
    // start listening to drag events on the layerContainer
    var layerDiv = app.getElement('layerContainer');
    if (layerDiv) {
      // show
      this.showDropbox(true);
      // start listening to drag events on the layer container
      layerDiv.addEventListener('dragover', onDragOver);
      layerDiv.addEventListener('dragleave', onDragLeave);
      layerDiv.addEventListener('drop', onDrop);
    }
  };

  /**
   * Show or hide the data load drop box.
   * @param {boolean} show Flag to show or hide.
   */
  this.showDropbox = function (show) {
    var box = app.getElement(dropboxClassName);
    if (box) {
      if (show) {
        // reset css class
        box.className = dropboxClassName + ' ' + borderClassName;
        // check content
        if (box.innerHTML === '') {
          box.innerHTML = 'Drag and drop data here.';
        }
        var size = app.getLayerContainerSize();
        // set the drop box size
        var dropBoxSize = 2 * size.height / 3;
        box.setAttribute(
          'style',
          'width:' + dropBoxSize + 'px;height:' + dropBoxSize + 'px');
      } else {
        // remove border css class
        box.className = dropboxClassName;
        // remove content
        box.innerHTML = '';
        // make not visible
        box.setAttribute(
          'style',
          'visible:false;');
      }
    }
  };

  /**
   * Handle a drag over.
   * @private
   * @param {Object} event The event to handle.
   */
  function onDragOver(event) {
    // prevent default handling
    event.stopPropagation();
    event.preventDefault();
    // update box border
    var box = app.getElement(borderClassName);
    if (box && box.className.indexOf(hoverClassName) === -1) {
      box.className += ' ' + hoverClassName;
    }
  }

  /**
   * Handle a drag leave.
   * @private
   * @param {Object} event The event to handle.
   */
  function onDragLeave(event) {
    // prevent default handling
    event.stopPropagation();
    event.preventDefault();
    // update box border
    var box = app.getElement(borderClassName);
    if (box && box.className.indexOf(hoverClassName) !== -1) {
      box.className = box.className.replace(' ' + hoverClassName, '');
    }
  }

  /**
   * Handle a drop event.
   * @private
   * @param {Object} event The event to handle.
   */
  function onDrop(event) {
    // prevent default handling
    event.stopPropagation();
    event.preventDefault();
    // load files
    app.loadFiles(event.dataTransfer.files);
  }
}; // dwvjq.gui.dropboxLoader
