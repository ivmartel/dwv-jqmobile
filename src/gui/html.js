// namespaces
var dwvjq = dwvjq || {};
/** @namespace */
dwvjq.html = dwvjq.html || {};

/**
 * Append a cell to a given row.
 * @param {Object} row The row to append the cell to.
 * @param {Object} content The content of the cell.
 */
dwvjq.html.appendCell = function (row, content) {
  var cell = row.insertCell(-1);
  var str = content;
  // special care for arrays
  if (
    content instanceof Array ||
    content instanceof Uint8Array ||
    content instanceof Int8Array ||
    content instanceof Uint16Array ||
    content instanceof Int16Array ||
    content instanceof Uint32Array
  ) {
    if (content.length > 10) {
      content = Array.prototype.slice.call(content, 0, 10);
      content[10] = '...';
    }
    str = Array.prototype.join.call(content, ', ');
  } else if (dwv.utils.isObject(content)) {
    str = '';
    var keys = Object.keys(content);
    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i];
      if (str.length !== 0) {
        str += ', ';
      }
      str += key + ': ' + content[key];
    }
  }
  // append
  cell.appendChild(document.createTextNode(str));
};

/**
 * Append a header cell to a given row.
 * @param {Object} row The row to append the header cell to.
 * @param {String} text The text of the header cell.
 */
dwvjq.html.appendHCell = function (row, text) {
  var cell = document.createElement('th');
  cell.appendChild(document.createTextNode(text));
  row.appendChild(cell);
};

/**
 * Append a row to an array.
 * @param {Object} table The HTML table to append a row to.
 * @param {Array} input The input row array.
 * @param {Number} level The depth level of the input array.
 * @param {Number} maxLevel The maximum depth level.
 * @param {String} rowHeader The content of the first cell of a row
 *   (mainly for objects).
 */
dwvjq.html.appendRowForArray = function (
  table,
  input,
  level,
  maxLevel,
  rowHeader
) {
  var row = null;
  // loop through
  for (var i = 0; i < input.length; ++i) {
    var value = input[i];
    // last level
    if (
      typeof value === 'number' ||
      typeof value === 'string' ||
      value === null ||
      value === undefined ||
      level >= maxLevel
    ) {
      if (!row) {
        row = table.insertRow(-1);
      }
      dwvjq.html.appendCell(row, value);
    } else {
      var rheader = '';
      if (input.length !== 1 && level > 1) {
        rheader += '[' + i + '] ';
      }
      if (typeof rowHeader !== 'undefined') {
        rheader = rowHeader + rheader;
      }
      // more to come
      dwvjq.html.appendRow(table, value, level + 1, maxLevel, rheader);
    }
  }

  // header row for array of objects
  // warn: need to create the header after the rest
  // otherwise the data will be inserted in the thead...
  if (input.length !== 0 && level === 0) {
    var keys = Object.keys(input[0]);
    if (keys.length !== 0) {
      var header = table.createTHead();
      var th = header.insertRow(-1);
      if (rowHeader) {
        dwvjq.html.appendHCell(th, '');
      }
      for (var k = 0; k < keys.length; ++k) {
        dwvjq.html.appendHCell(th, keys[k]);
      }
    }
  }

};

/**
 * Append a row to an object.
 * @param {Object} table The HTML table to append a row to.
 * @param {Array} input The input row array.
 * @param {Number} level The depth level of the input array.
 * @param {Number} maxLevel The maximum depth level.
 * @param {String} rowHeader The content of the first cell of a row
 *  (mainly for objects).
 */
dwvjq.html.appendRowForObject = function (
  table,
  input,
  level,
  maxLevel,
  rowHeader
) {
  var keys = Object.keys(input);
  var row = null;
  for (var o = 0; o < keys.length; ++o) {
    var value = input[keys[o]];
    // last level
    if (
      typeof value === 'number' ||
      typeof value === 'string' ||
      value === null ||
      value === undefined ||
      level >= maxLevel
    ) {
      if (!row) {
        row = table.insertRow(-1);
      }
      var prefix = '';
      if (o === 0 && typeof rowHeader !== 'undefined') {
        prefix = rowHeader;
      }
      dwvjq.html.appendCell(row, prefix + value);
    } else {
      // if the value is an array, add an empty cell
      if (dwv.utils.isArray(value) &&
        value.length !== 0 &&
        dwv.utils.isObject(value[0])) {
        if (!row) {
          row = table.insertRow(-1);
        }
        dwvjq.html.appendCell(row, '');
      }
      // add row
      dwvjq.html.appendRow(table, value, level + 1, maxLevel, rowHeader);
    }
  }
};

/**
 * Append a row to an object or an array.
 * @param {Object} table The HTML table to append a row to.
 * @param {Array} input The input row array.
 * @param {Number} level The depth level of the input array.
 * @param {Number} maxLevel The maximum depth level.
 * @param {String} rowHeader The content of the first cell of a row
 *  (mainly for objects).
 */
dwvjq.html.appendRow = function (table, input, level, maxLevel, rowHeader) {
  // call specific append
  if (dwv.utils.isArray(input)) {
    dwvjq.html.appendRowForArray(table, input, level, maxLevel, rowHeader);
  } else if (dwv.utils.isObject(input)) {
    dwvjq.html.appendRowForObject(table, input, level, maxLevel, rowHeader);
  } else {
    throw new Error('Unsupported input data type.');
  }
};

/**
 * Converts the input to an HTML table.
 * @input {Mixed} input Allowed types are: array, array of object, object.
 * @return {Object} The created HTML table or null if the input is empty.
 * @warning Null is interpreted differently in browsers,
 *  Firefox will not display it.
 */
dwvjq.html.toTable = function (input) {
  // check content
  if (input.length === 0) {
    return null;
  }

  var table = document.createElement('table');
  dwvjq.html.appendRow(table, input, 0, 20);
  return table;
};

/**
 * Get an HTML search form.
 * @param {Object} htmlTableToSearch The table to do the search on.
 * @param {string} elementId The HTML element id.
 * @return {Object} The HTML search form.
 */
dwvjq.html.getHtmlSearchForm = function (htmlTableToSearch, elementId) {
  // input
  var input = document.createElement('input');
  input.id = elementId;
  // TODO Use new html5 search type
  //input.setAttribute("type", "search");
  input.onkeyup = function () {
    dwvjq.html.filterTable(input, htmlTableToSearch);
  };
  // label
  var label = document.createElement('label');
  label.setAttribute('for', input.id);
  label.appendChild(document.createTextNode(dwv.i18n('basics.search') + ': '));
  // form
  var form = document.createElement('form');
  form.setAttribute('class', 'filter');
  form.onsubmit = function (event) {
    event.preventDefault();
  };
  form.appendChild(label);
  form.appendChild(input);
  // return
  return form;
};

/**
 * Filter a table with a given parameter: sets the display css of rows to
 * true or false if it contains the term.
 * @param {String} inputElement The search input element.
 * @param {Object} table The table to filter.
 */
dwvjq.html.filterTable = function (inputElement, table) {
  // de-highlight
  dwvjq.html.dehighlight(table);
  // split search terms
  var terms = inputElement.value.toLowerCase().split(' ');

  // search
  var text = 0;
  var display = 0;
  for (var r = 1; r < table.rows.length; ++r) {
    display = '';
    for (var i = 0; i < terms.length; ++i) {
      text = table.rows[r].innerHTML.replace(/<[^>]+>/g, '').toLowerCase();
      if (text.indexOf(terms[i]) < 0) {
        display = 'none';
      } else {
        if (terms[i].length) {
          dwvjq.html.highlight(terms[i], table.rows[r]);
        }
      }
      table.rows[r].style.display = display;
    }
  }
};

/**
 * Transform back each
 * 'preText <span class="highlighted">term</span> postText'
 * into its original 'preText term postText'.
 * @param {Object} container The container to de-highlight.
 */
dwvjq.html.dehighlight = function (container) {
  for (var i = 0; i < container.childNodes.length; i++) {
    var node = container.childNodes[i];

    if (
      node.attributes &&
      node.attributes['class'] &&
      node.attributes['class'].value === 'highlighted'
    ) {
      node.parentNode.parentNode.replaceChild(
        document.createTextNode(
          node.parentNode.innerHTML.replace(/<[^>]+>/g, '')
        ),
        node.parentNode
      );
      // Stop here and process next parent
      return;
    } else if (node.nodeType !== 3) {
      // Keep going onto other elements
      dwvjq.html.dehighlight(node);
    }
  }
};

/**
 * Create a
 * 'preText <span class="highlighted">term</span> postText'
 * around each search term.
 * @param {String} term The term to highlight.
 * @param {Object} container The container where to highlight the term.
 */
dwvjq.html.highlight = function (term, container) {
  for (var i = 0; i < container.childNodes.length; i++) {
    var node = container.childNodes[i];

    if (node.nodeType === 3) {
      // Text node
      var data = node.data;
      var data_low = data.toLowerCase();
      if (data_low.indexOf(term) >= 0) {
        //term found!
        var new_node = document.createElement('span');
        node.parentNode.replaceChild(new_node, node);

        var result;
        while ((result = data_low.indexOf(term)) !== -1) {
          // before term
          new_node.appendChild(document.createTextNode(data.substr(0, result)));
          // term
          new_node.appendChild(
            dwvjq.html.createHighlightNode(
              document.createTextNode(data.substr(result, term.length))
            )
          );
          // reduce search string
          data = data.substr(result + term.length);
          data_low = data_low.substr(result + term.length);
        }
        new_node.appendChild(document.createTextNode(data));
      }
    } else {
      // Keep going onto other elements
      dwvjq.html.highlight(term, node);
    }
  }
};

/**
 * Highlight a HTML node.
 * @param {Object} child The child to highlight.
 * @return {Object} The created HTML node.
 */
dwvjq.html.createHighlightNode = function (child) {
  var node = document.createElement('span');
  node.setAttribute('class', 'highlighted');
  node.attributes['class'].value = 'highlighted';
  node.appendChild(child);
  return node;
};

/**
 * Remove all children of a HTML node.
 * @param {Object} node The node to remove kids.
 */
dwvjq.html.cleanNode = function (node) {
  // remove its children if node exists
  if (!node) {
    return;
  }
  while (node.hasChildNodes()) {
    node.removeChild(node.firstChild);
  }
};

/**
 * Remove a HTML node and all its children.
 * @param {String} nodeId The string id of the node to delete.
 */
dwvjq.html.removeNode = function (node) {
  // check node
  if (!node) {
    return;
  }
  // remove its children
  dwvjq.html.cleanNode(node);
  // remove it from its parent
  var top = node.parentNode;
  top.removeChild(node);
};

/**
 * Remove a list of HTML nodes and all their children.
 * @param {Array} nodes The list of nodes to delete.
 */
dwvjq.html.removeNodes = function (nodes) {
  for (var i = 0; i < nodes.length; ++i) {
    dwvjq.html.removeNode(nodes[i]);
  }
};

/**
 * Translate the content of an HTML row.
 * @param {Object} row The HTML row to parse.
 * @param {String} i18nPrefix The i18n prefix to use to find the translation.
 */
dwvjq.html.translateTableRow = function (row, i18nPrefix) {
  var prefix = typeof i18nPrefix === 'undefined' ? 'basics' : i18nPrefix;
  if (prefix.length !== 0) {
    prefix += '.';
  }
  var cells = row.cells;
  for (var c = 0; c < cells.length; ++c) {
    var text = cells[c].firstChild.data;
    cells[c].firstChild.data = dwv.i18n(prefix + text);
  }
};

/**
 * Translate the content of an HTML column.
 * @param {Object} table The HTML table to parse.
 * @param {Number} columnNumber The number of the column to translate.
 * @param {String} i18nPrefix The i18n prefix to use to find the translation.
 * @param {String} i18nSuffix The i18n suffix to use to find the translation.
 */
dwvjq.html.translateTableColumn = function (
  table,
  columnNumber,
  i18nPrefix,
  i18nSuffix
) {
  var prefix = typeof i18nPrefix === 'undefined' ? 'basics' : i18nPrefix;
  if (prefix.length !== 0) {
    prefix += '.';
  }
  var suffix = typeof i18nSuffix === 'undefined' ? '' : i18nSuffix;
  if (suffix.length !== 0) {
    suffix = '.' + suffix;
  }
  if (table.rows.length !== 0) {
    for (var r = 1; r < table.rows.length; ++r) {
      var cells = table.rows.item(r).cells;
      if (cells.length >= columnNumber) {
        var text = cells[columnNumber].firstChild.data;
        cells[columnNumber].firstChild.data = dwv.i18n(prefix + text + suffix);
      }
    }
  }
};

/**
 * Make a HTML table cell editable by putting its content inside an
 * input element.
 * @param {Object} cell The cell to make editable.
 * @param {Function} onchange The callback to call when cell's content
 *  is changed. If set to null, the HTML input will be disabled.
 * @param {String} inputType The type of the HTML input, default to 'text'.
 */
dwvjq.html.makeCellEditable = function (cell, onchange, inputType) {
  // check event
  if (typeof cell === 'undefined') {
    console.warn('Cannot create input for non existing cell.');
    return;
  }
  // HTML input
  var input = document.createElement('input');
  // handle change
  if (onchange) {
    input.onchange = onchange;
  } else {
    input.disabled = true;
  }
  // set input value
  input.value = cell.firstChild.data;
  // input type
  if (
    typeof inputType === 'undefined' ||
    (inputType === 'color' && !dwvjq.browser.hasInputColor())
  ) {
    input.type = 'text';
  } else {
    input.type = inputType;
  }

  // clean cell
  dwvjq.html.cleanNode(cell);

  // HTML form
  var form = document.createElement('form');
  form.onsubmit = function (event) {
    event.preventDefault();
  };
  form.appendChild(input);
  // add form to cell
  cell.appendChild(form);
};

/**
 * Set the document cursor to 'pointer'.
 */
dwvjq.html.setCursorToPointer = function () {
  document.body.style.cursor = 'pointer';
};

/**
 * Set the document cursor to 'default'.
 */
dwvjq.html.setCursorToDefault = function () {
  document.body.style.cursor = 'default';
};

/**
 * Create a HTML select from an input array of options.
 * The values of the options are the name of the option made lower case.
 * It is left to the user to set the 'onchange' method of the select.
 * @param {String} id The id of the HTML select.
 * @param {Mixed} list The list of options of the HTML select.
 * @param {String} i18nPrefix An optional namespace prefix to find the
 *  translation values.
 * @param {Bool} i18nSafe An optional flag to check translation existence.
 * @return {Object} The created HTML select.
 */
dwvjq.html.createHtmlSelect = function (id, list, i18nPrefix, i18nSafe) {
  // select
  var select = document.createElement('select');
  select.id = id;
  var prefix = typeof i18nPrefix === 'undefined' ? '' : i18nPrefix + '.';
  var safe = typeof i18nSafe === 'undefined' ? false : true;
  var getText = function (value) {
    var key = prefix + value + '.name';
    var text = '';
    if (safe) {
      if (dwvjq.i18nExists(key)) {
        text = dwv.i18n(key);
      } else {
        text = value;
      }
    } else {
      text = dwv.i18n(key);
    }
    return text;
  };
  // options
  var option;
  if (list instanceof Array) {
    for (var i in list) {
      if (Object.prototype.hasOwnProperty.call(list, i)) {
        option = document.createElement('option');
        option.value = list[i];
        option.appendChild(document.createTextNode(getText(list[i])));
        select.appendChild(option);
      }
    }
  } else if (typeof list === 'object') {
    for (var item in list) {
      option = document.createElement('option');
      option.value = item;
      option.appendChild(document.createTextNode(getText(item)));
      select.appendChild(option);
    }
  } else {
    throw new Error('Unsupported input list type.');
  }
  return select;
};

/**
 * Display or not an element.
 * @param {Object} element The HTML element to display.
 * @param {Boolean} flag True to display the element.
 */
dwvjq.html.displayElement = function (element, flag) {
  element.style.display = flag ? '' : 'none';
};

/**
 * Toggle the display of an element.
 * @param {Object} element The HTML element to display.
 */
dwvjq.html.toggleDisplay = function (element) {
  if (element.style.display === 'none') {
    element.style.display = '';
  } else {
    element.style.display = 'none';
  }
};

/**
 * Append an element.
 * @param {Object} parent The HTML element to append to.
 * @param {Object} element The HTML element to append.
 */
dwvjq.html.appendElement = function (parent, element) {
  // append
  parent.appendChild(element);
  // refresh
  dwvjq.gui.refreshElement(parent);
};

/**
 * Create an element.
 * @param {String} type The type of the elemnt.
 * @param {String} id The id of the element.
 */
dwvjq.html.createHiddenElement = function (type, id) {
  var element = document.createElement(type);
  element.id = id;
  // hide by default
  element.style.display = 'none';
  // return
  return element;
};
