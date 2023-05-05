// namespaces
var dwv = dwv || {};
var dwvjq = dwvjq || {};
dwvjq.gui = dwvjq.gui || {};
dwvjq.gui.info = dwvjq.gui.info || {};

/**
 * Get the HTML LI class name for a data.
 *
 * @param {object} data The associated data.
 * @returns {string} The class name.
 */
function getLiClassName(data) {
  var type = '';
  if (typeof data.tags !== 'undefined') {
    var tagStr = '';
    for (var i = 0; i < data.tags.length; ++i) {
      tagStr += data.tags[i];
    }
    type = tagStr;
  } else {
    type = data.event;
  }
  var format = encodeURIComponent(data.format.toLowerCase());
  format = format.replace(/%[0-9A-F]{2}/gi, '');

  return 'info-' + data.pos + '-' + type + '-' + format;
}

/**
 * DICOM Header overlay info layer.
 *
 * @constructor
 * @param {Object} div The HTML element to add overlay info to.
 */
dwvjq.gui.info.Overlay = function (div) {
  // closure to self
  var self = this;
  // html creation flag
  var created = false;

  /**
   * Handle overlay data change.
   *
   * @param {Array} data The overlay data for all positions.
   */
  this.onDataChange = function (event) {
    if (typeof event.data === 'undefined') {
      return;
    }
    if (!created) {
      self.create(event.data);
      created = true;
    }
    self.update(event.data);
  };

  /**
   * Create the overlay info HTML.
   *
   * @param {Array} data The overlay data array.
   */
  this.create = function (data) {
    // possible info pos
    var posList = [];
    for (var j = 0; j < data.length; ++j) {
      var dataPos = data[j].pos;
      if (!posList.includes(dataPos)) {
        posList.push(dataPos);
      }
    }

    for (var i = 0; i < posList.length; ++i) {
      var pos = posList[i];
      // create list element
      var ul = document.createElement('ul');

      // list items
      for (var n = 0; n < data.length; ++n) {
        if (data[n].pos === pos) {
          var li = document.createElement('li');
          li.className = getLiClassName(data[n]);
          // fill in tags
          if (typeof data[n].tags !== 'undefined') {
            li.appendChild(document.createTextNode(data[n].value));
          }
          // append to list
          ul.appendChild(li);
        }
      }

      // append list element to ref element
      var posElement = document.getElementById('info' + pos);
      // clean node
      dwvjq.html.cleanNode(posElement);
      // append list
      posElement.appendChild(ul);
    }

  };

  /**
   * Update the overlay info HTML.
   *
   * @param {Array} data The overlay data array.
   */
  this.update = function (data) {
    // updates all the data
    for (var n = 0; n < data.length; ++n) {
      var className = getLiClassName(data[n]);
      var li = div.getElementsByClassName(className)[0];
      var text = data[n].value;
      if (text && li) {
        dwvjq.html.cleanNode(li);
        li.appendChild(document.createTextNode(text));
      }
    }
  };
}; // class dwvjq.gui.info.Overlay
