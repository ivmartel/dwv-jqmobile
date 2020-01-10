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
dwvjq.gui.DropboxLoader = function (app)
{
    // drop box class name
    var dropboxClassName = "dropBox";

    /**
     * Initialise the drop box.
     */
    this.init = function () {
        // start listening to drag events on the layerContainer
        var layerDiv = app.getElement("layerContainer");
        if (layerDiv) {
            layerDiv.addEventListener("dragover", onDragOver);
            layerDiv.addEventListener("dragleave", onDragLeave);
            layerDiv.addEventListener("drop", onDrop);
        }

        // set the initial drop box size
        var box = app.getElement(dropboxClassName);
        if (box) {
            var size = app.getLayerContainerSize();
            var dropBoxSize = 2 * size.height / 3;
            box.setAttribute("style","width:"+dropBoxSize+"px;height:"+dropBoxSize+"px");
        }
    };

    /**
     * Remove the drop box gui.
     */
    this.removeDropboxElement = function () {
        var box = app.getElement(dropboxClassName);
        if (box) {
            dwvjq.html.removeNode(box);
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
        // update box
        var box = app.getElement(dropboxClassName);
        if (box) {
            box.className = dropboxClassName + " hover";
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
        // update box class
        var box = app.getElement(dropboxClassName + " hover");
        if (box) {
            box.className = dropboxClassName;
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
