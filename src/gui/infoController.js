// namespaces
var dwv = dwv || {};
var dwvjq = dwvjq || {};
dwvjq.gui = dwvjq.gui || {};
dwvjq.gui.info = dwvjq.gui.info || {};

// get a number toprecision function with the povided precision
function getNumberToPrecision(precision) {
  return function (num) {
    return Number(num).toPrecision(precision);
  };
}

/**
 * DICOM Header overlay info controller.
 * @constructor
 * @param {Object} app The assciated app.
 */
dwvjq.gui.info.Controller = function (app) {

  // overlay data
  var overlayData = [];
  // current data uid: set on pos change
  var currentDataUid;
  // flag to know if the info layer is listening on the image.
  var isInfoLayerListening = false;
  // listener handler
  var listenerHandler = new dwvjq.utils.ListenerHandler();

  /**
   * Create the different info elements.
   */
  this.init = function () {
    // listen to update data
    app.addEventListener('positionchange', onSliceChange);
    // first toggle: set to listening
    this.toggleListeners();
  };

  /**
   * Reset the controller: clean internals.
   */
  this.reset = function () {
    overlayData = [];
  };

  /**
   * Handle a new loaded item event.
   * @param {Object} event The loaditem event.
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
      overlayData[dataUid] = createOverlayData(
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
      overlayData[dataUid] = createOverlayDataForDom(data);
    }
    // store uid
    currentDataUid = dataUid;
  };

  /**
   * Handle a changed slice event.
   * @param {Object} event The slicechange event.
   */
  function onSliceChange(event) {
    if (typeof event.data !== 'undefined' &&
      typeof event.data.imageUid !== 'undefined') {
      currentDataUid = event.data.imageUid;
      updateData(event);
    }
  }

  /**
   * Update the overlay data
   *
   * @param {object} event An event defined by the overlay map and
   *   registered in toggleListeners
   */
  function updateData(event) {

    var sliceOverlayData = overlayData[currentDataUid];
    if (typeof sliceOverlayData === 'undefined') {
      console.warn('No slice overlay data');
      return;
    }

    for (var n = 0; n < sliceOverlayData.length; ++n) {
      var text = undefined;
      if (typeof sliceOverlayData[n].tags !== 'undefined') {
        // update tags only on slice change
        if (event.type === 'positionchange') {
          text = sliceOverlayData[n].value;
        }
      } else {
        // update text if the value is an event type
        if (typeof sliceOverlayData[n].event !== 'undefined' &&
          sliceOverlayData[n].event === event.type) {
          var format = sliceOverlayData[n].format;
          var values = event.value;
          // optional number precision
          if (typeof sliceOverlayData[n].precision !== 'undefined') {
            var mapFunc = null;
            if (sliceOverlayData[n].precision === 'round') {
              mapFunc = Math.round;
            } else {
              mapFunc = getNumberToPrecision(sliceOverlayData[n].precision);
            }
            values = values.map(mapFunc);
          }
          text = replaceFlags(format, values);
        }
      }
      if (typeof text !== 'undefined') {
        sliceOverlayData[n].value = text;
      }
    }

    // fire valuechange for listeners
    fireEvent({type: 'valuechange', data: sliceOverlayData});
  }

  /**
   * Toggle info listeners.
   */
  this.toggleListeners = function () {
    // parse overlays to get the list of events to listen to
    var eventNames = [];
    var keys = Object.keys(dwvjq.gui.info.overlayMaps);
    for (var i = 0; i < keys.length; ++i) {
      var map = dwvjq.gui.info.overlayMaps[keys[i]];
      for (var j = 0; j < map.length; ++j) {
        var eventType = map[j].event;
        if (typeof eventType !== 'undefined') {
          if (!eventNames.includes(eventType)) {
            eventNames.push(eventType);
          }
        }
      }
    }
    // add or remove listeners
    if (isInfoLayerListening) {
      for (var e = 0; e < eventNames.length; ++e) {
        app.removeEventListener(eventNames[e], updateData);
      }
    } else {
      for (e = 0; e < eventNames.length; ++e) {
        app.addEventListener(eventNames[e], updateData);
      }
    }

    // update flag
    isInfoLayerListening = !isInfoLayerListening;
  };

  /**
   * Add an event listener to this class.
   *
   * @param {string} type The event type.
   * @param {object} callback The method associated with the provided
   *   event type, will be called with the fired event.
   */
  this.addEventListener = function (type, callback) {
    listenerHandler.add(type, callback);
  };

  /**
   * Remove an event listener from this class.
   *
   * @param {string} type The event type.
   * @param {object} callback The method associated with the provided
   *   event type.
   */
  this.removeEventListener = function (type, callback) {
    listenerHandler.remove(type, callback);
  };

  /**
   * Fire an event: call all associated listeners with the input event object.
   *
   * @param {object} event The event to fire.
   * @private
   */
  function fireEvent(event) {
    listenerHandler.fireEvent(event);
  }

}; // class dwvjq.gui.info.Controller

/**
 * Replace flags in a input string. Flags are keywords surrounded with curly
 * braces in the form: '{v0}, {v1}'.
 *
 * @param {string} inputStr The input string.
 * @param {Array} values An array of strings.
 * @example
 *    var values = ["a", "b"];
 *    var str = "The length is: {v0}. The size is: {v1}";
 *    var res = replaceFlags(str, values);
 *    // "The length is: a. The size is: b"
 * @returns {string} The result string.
 */
function replaceFlags(inputStr, values) {
  var res = inputStr;
  for (var j = 0; j < values.length; ++j) {
    res = res.replace('{v' + j + '}', values[j]);
  }
  return res;
}

/**
 * Create a default replace format from a given length.
 * For example: '{v0}, {v1}'.
 *
 * @param {number} length The length of the format.
 * @returns {string} A replace format.
 */
function createDefaultReplaceFormat(length) {
  var res = '';
  for (var j = 0; j < length; ++j) {
    if (j !== 0) {
      res += ', ';
    }
    res += '{v' + j + '}';
  }
  return res;
}

/**
 * Create overlay string array of the image in each corner
 * @param {Object} dicomElements DICOM elements of the image
 * @return {Array} Array of string to be shown in each corner
 */
function createOverlayData(dicomElements) {
  var overlays = [];
  var modality = dicomElements.getFromKey('x00080060');
  if (!modality) {
    return overlays;
  }
  var omaps = dwvjq.gui.info.overlayMaps;
  if (!omaps) {
    return overlays;
  }
  var omap = omaps[modality] || omaps['*'];
  if (!omap) {
    return overlays;
  }

  for (var n = 0; n < omap.length; ++n) {
    // deep copy
    var overlay = JSON.parse(JSON.stringify(omap[n]));

    // add tag values
    var tags = overlay.tags;
    if (typeof tags !== 'undefined' && tags.length !== 0) {
      // get values
      var values = [];
      for (var i = 0; i < tags.length; ++i) {
        values.push(dicomElements.getElementValueAsStringFromKey(tags[i]));
      }
      // format
      if (typeof overlay.format === 'undefined' || overlay.format === null) {
        overlay.format = createDefaultReplaceFormat(values.length);
      }
      overlay.value = replaceFlags(overlay.format, values).trim();
    }

    // store
    overlays.push(overlay);
  }

  // (0020,0020) Patient Orientation
  var valuePO = dicomElements.getFromKey('x00200020');
  if (
    typeof valuePO !== 'undefined' &&
    valuePO !== null &&
    valuePO.length === 2
  ) {
    var po0 = dwv.dicom.cleanString(valuePO[0]);
    var po1 = dwv.dicom.cleanString(valuePO[1]);
    overlays.push({
      pos: 'cr', value: po0, format: '{v0}'
    });
    overlays.push({
      pos: 'cl', value: dwv.dicom.getReverseOrientation(po0), format: '{v0}'
    });
    overlays.push({
      pos: 'bc', value: po1, format: '{v0}'
    });
    overlays.push({
      pos: 'tc', value: dwv.dicom.getReverseOrientation(po1), format: '{v0}'
    });
  }

  return overlays;
}

/**
 * Create overlay string array of the image in each corner
 * @param {Object} dicomElements DICOM elements of the image
 * @return {Array} Array of string to be shown in each corner
 */
function createOverlayDataForDom(info) {
  var overlays = [];
  var omaps = dwvjq.gui.info.overlayMaps;
  if (!omaps) {
    return overlays;
  }
  var omap = omaps.DOM;
  if (!omap) {
    return overlays;
  }

  var infoKeys = Object.keys(info);

  for (var n = 0; n < omap.length; ++n) {
    // deep copy
    var overlay = JSON.parse(JSON.stringify(omap[n]));

    // add tag values
    var tags = overlay.tags;
    if (typeof tags !== 'undefined' && tags.length !== 0) {
      // get values
      var values = [];
      for (var i = 0; i < tags.length; ++i) {
        for (var j = 0; j < infoKeys.length; ++j) {
          if (tags[i] === infoKeys[j]) {
            values.push(info[infoKeys[j]].value);
          }
        }
      }
      // format
      if (typeof overlay.format === 'undefined' || overlay.format === null) {
        overlay.format = createDefaultReplaceFormat(values.length);
      }
      overlay.value = replaceFlags(overlay.format, values).trim();
    }

    // store
    overlays.push(overlay);
  }

  return overlays;
}
