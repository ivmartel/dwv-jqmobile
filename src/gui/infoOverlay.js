// namespaces
var dwv = dwv || {};
var dwvjq = dwvjq || {};
dwvjq.gui = dwvjq.gui || {};
dwvjq.gui.info = dwvjq.gui.info || {};

/**
 * DICOM Header overlay info layer.
 * @constructor
 * @param {Object} div The HTML element to add Header overlay info to.
 * @param {String} pos The string to specify the corner position:
 *  (tl,tc,tr,cl,cr,bl,bc,br)
 */
dwvjq.gui.info.Overlay = function (div, pos) {
  var overlayData = null;

  /**
   * Set the overlay data.
   * @param {Object} data The overlay data for all positions.
   */
  this.setOverlayData = function (data) {
    overlayData = data[pos];
  };

  function getLiClassName(pos, data) {
    var type = '';
    if (typeof data.tags !== 'undefined') {
      var tagStr = '';
      for (var i = 0; i < data.tags.length; ++i) {
        tagStr += data.tags[i];
      }
      type = tagStr;
    } else {
      type = data.value;
    }
    var format = encodeURIComponent(data.format.toLowerCase());
    format = format.replace(/%[0-9A-F]{2}/gi, '');
    return 'info-' + pos + '-' + type + '-' + format;
  }

  /**
   * Create the overlay info div.
   */
  this.create = function () {
    // check data
    if (!overlayData) {
      return;
    }

    // remove all  elements from ref element
    dwvjq.html.cleanNode(div);

    if (pos === 'bc' || pos === 'tc' || pos === 'cr' || pos === 'cl') {
      div.textContent = overlayData[0].value;
    } else {
      // create list element
      var ul = document.createElement('ul');

      // list items
      for (var n = 0; n < overlayData.length; ++n) {
        var li = document.createElement('li');
        li.className = getLiClassName(pos, overlayData[n]);
        // fill in tags
        if (typeof overlayData[n].tags !== 'undefined') {
          li.appendChild(document.createTextNode(overlayData[n].value));
        }
        // append to list
        ul.appendChild(li);
      }

      // append list element to ref element
      div.appendChild(ul);
    }
  };

  /**
   * Update the overlay info div.
   * @param {Object} event A change event.
   */
  this.update = function (event) {
    if (!overlayData) {
      return;
    }

    // get a number toprecision function with the povided precision
    function getNumberToPrecision(precision) {
      return function (num) {
        return Number(num).toPrecision(precision);
      };
    }

    if (pos === 'bc' || pos === 'tc' || pos === 'cr' || pos === 'cl') {
      div.textContent = overlayData[0].value;
    } else {
      for (var n = 0; n < overlayData.length; ++n) {
        var text = null;
        var value = overlayData[n].value;
        if (typeof overlayData[n].tags !== 'undefined') {
          // update tags only on slice change
          if (event.type === 'positionchange') {
            text = value;
          }
        } else {
          // update text if the value is an event type
          if (value === event.type) {
            var format = overlayData[n].format;
            var values = event.value;
            // optional number precision
            if (typeof overlayData[n].precision !== 'undefined') {
              var mapFunc = null;
              if (overlayData[n].precision === 'round') {
                mapFunc = Math.round;
              } else {
                mapFunc = getNumberToPrecision(overlayData[n].precision);
              }
              values = values.map(mapFunc);
            }
            text = dwv.utils.replaceFlags2(format, values);
          }
        }

        var className = getLiClassName(pos, overlayData[n]);
        var li = div.getElementsByClassName(className)[0];

        if (text && li) {
          dwvjq.html.cleanNode(li);
          li.appendChild(document.createTextNode(text));
        }
      }
    }
  };
}; // class dwvjq.gui.info.Overlay

/**
 * Create overlay string array of the image in each corner
 * @param {Object} dicomElements DICOM elements of the image
 * @return {Array} Array of string to be shown in each corner
 */
dwvjq.gui.info.createOverlayData = function (dicomElements) {
  var overlays = {};
  var modality = dicomElements.getFromKey('x00080060');
  if (!modality) {
    return overlays;
  }

  var omaps = dwvjq.gui.info.overlayMaps;
  if (!omaps) {
    return overlays;
  }
  var omap = omaps[modality] || omaps['*'];

  for (var n = 0; n < omap.length; n++) {
    // deep copy
    var overlay = JSON.parse(JSON.stringify(omap[n]));

    var value = overlay.value;

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
        overlay.format = dwv.utils.createDefaultReplaceFormat(values);
      }
      value = dwv.utils.replaceFlags2(overlay.format, values);
    }

    if (!value || value.length === 0) {
      continue;
    }

    overlay.value = value.trim();

    // add value to overlays
    var pos = overlay.pos;
    if (!overlays[pos]) {
      overlays[pos] = [];
    }
    overlays[pos].push(overlay);
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
    overlays.cr = [{value: po0}];
    overlays.cl = [{value: dwv.dicom.getReverseOrientation(po0)}];
    overlays.bc = [{value: po1}];
    overlays.tc = [{value: dwv.dicom.getReverseOrientation(po1)}];
  }

  return overlays;
};

/**
 * Create overlay string array of the image in each corner
 * @param {Object} dicomElements DICOM elements of the image
 * @return {Array} Array of string to be shown in each corner
 */
dwvjq.gui.info.createOverlayDataForDom = function (info) {
  var overlays = {};
  var omaps = dwvjq.gui.info.overlayMaps;
  if (!omaps) {
    return overlays;
  }
  var omap = omaps.DOM;
  if (!omap) {
    return overlays;
  }

  for (var n = 0; n < omap.length; n++) {
    // deep copy
    var overlay = JSON.parse(JSON.stringify(omap[n]));

    var value = overlay.value;

    var tags = overlay.tags;
    if (typeof tags !== 'undefined' && tags.length !== 0) {
      // get values
      var values = [];
      for (var i = 0; i < tags.length; ++i) {
        for (var j = 0; j < info.length; ++j) {
          if (tags[i] === info[j].name) {
            values.push(info[j].value);
          }
        }
      }
      // format
      if (typeof overlay.format === 'undefined' || overlay.format === null) {
        overlay.format = dwv.utils.createDefaultReplaceFormat(values);
      }
      value = dwv.utils.replaceFlags2(overlay.format, values);
    }

    if (!value || value.length === 0) {
      continue;
    }

    overlay.value = value.trim();

    // add value to overlays
    var pos = overlay.pos;
    if (!overlays[pos]) {
      overlays[pos] = [];
    }
    overlays[pos].push(overlay);
  }

  return overlays;
};
