// namespaces
var dwv = dwv || {};
var dwvjq = dwvjq || {};
dwvjq.gui = dwvjq.gui || {};
dwvjq.gui.info = dwvjq.gui.info || {};

/**
 * DICOM Header overlay info controller.
 * @constructor
 * @param {Object} app The assciated app.
 */
dwvjq.gui.info.Controller = function (app) {
  // Info layer overlay guis
  var overlayGuis = [];
  // flag to tell if guis have been created
  var guisCreated = false;

  // overlay data
  var overlayData = [];

  // flag to know if the info layer is listening on the image.
  var isInfoLayerListening = false;

  /**
   * Create the different info elements.
   */
  this.init = function () {
    // create overlay info at each corner
    var pos_list = ['tl', 'tc', 'tr', 'cl', 'cr', 'bl', 'bc', 'br'];

    for (var n = 0; n < pos_list.length; ++n) {
      var pos = pos_list[n];
      var infoElement = document.getElementById('info' + pos);
      if (infoElement) {
        overlayGuis.push(new dwvjq.gui.info.Overlay(infoElement, pos));
      }
    }

    // listen to update data
    app.addEventListener('positionchange', onSliceChange);
    // first toggle: set to listening
    this.toggleListeners();
  };

  /**
   * Handle a load start event: reset local vars.
   * @param {Object} event The load-start event.
   */
  this.onLoadStart = function (/*event*/) {
    overlayData = [];
    guisCreated = false;
  };

  /**
   * Handle a new loaded item event.
   * @param {Object} event The load-item event.
   */
  this.onLoadItem = function (event) {
    // create and store overlay data
    var data = event.data;
    var dataUid;
    // check if dicom data (x00020010: transfer syntax)
    if (typeof data.x00020010 !== 'undefined') {
      if (typeof data.x00080018 !== 'undefined') {
        // SOP instance UID
        dataUid = dwv.dicom.cleanString(data.x00080018.value[0]);
      } else {
        dataUid = overlayData.length;
      }
      overlayData[dataUid] = dwvjq.gui.info.createOverlayData(
        new dwv.dicom.DicomElementsWrapper(data)
      );
    } else {
      // image file case
      var keys = Object.keys(data);
      for (var d = 0; d < keys.length; ++d) {
        var obj = data[keys[d]];
        if (keys[d] === 'imageUid') {
          dataUid = obj.value;
          break;
        }
      }
      overlayData[dataUid] = dwvjq.gui.info.createOverlayDataForDom(data);
    }

    for (var i = 0; i < overlayGuis.length; ++i) {
      overlayGuis[i].setOverlayData(overlayData[dataUid]);
    }

    // create overlay guis if not done
    // TODO The first gui is maybe not the one disaplyed...
    if (!guisCreated) {
      for (var j = 0; j < overlayGuis.length; ++j) {
        overlayGuis[j].create();
      }
      guisCreated = true;
    }
  };

  /**
   * Handle a changed slice event.
   * @param {Object} event The slicechange event.
   */
  function onSliceChange(event) {
    // change the overlay data to the one of the new slice
    if (typeof event.data !== 'undefined' &&
      typeof event.data.imageUid !== 'undefined') {
      var dataUid = event.data.imageUid;
      for (var i = 0; i < overlayGuis.length; ++i) {
        overlayGuis[i].setOverlayData(overlayData[dataUid]);
      }
    }
  }

  /**
   * Toggle info listeners.
   */
  this.toggleListeners = function () {
    if (overlayGuis.length === 0) {
      return;
    }

    // parse overlays to get the list of events to listen to
    var events = [];
    var keys = Object.keys(dwvjq.gui.info.overlayMaps);
    for (var i = 0; i < keys.length; ++i) {
      var map = dwvjq.gui.info.overlayMaps[keys[i]];
      for (var j = 0; j < map.length; ++j) {
        var value = map[j].value;
        if (typeof value !== 'undefined') {
          if (!events.includes(value)) {
            events.push(value);
          }
        }
      }
    }

    var n;
    var e;
    if (isInfoLayerListening) {
      for (n = 0; n < overlayGuis.length; ++n) {
        // default slice change for tags
        app.removeEventListener('positionchange', overlayGuis[n].update);
        // from config
        for (e = 0; e < events.length; ++e) {
          app.removeEventListener(events[e], overlayGuis[n].update);
        }
      }
    } else {
      for (n = 0; n < overlayGuis.length; ++n) {
        // default slice change for tags
        app.addEventListener('positionchange', overlayGuis[n].update);
        // from config
        for (e = 0; e < events.length; ++e) {
          app.addEventListener(events[e], overlayGuis[n].update);
        }
      }
    }
    // update flag
    isInfoLayerListening = !isInfoLayerListening;
  };

  /**
   * Fit layer info to layer canvas.
   */
  this.fitContainer = function () {
    var layer = document.getElementById('layer-0-0');
    if (layer) {
      var canvas = layer.querySelector('canvas');
      var container = document.getElementById('infoLayer');
      container.style.width = canvas.width + 'px';
    }
  };

}; // class dwvjq.gui.info.Controller
