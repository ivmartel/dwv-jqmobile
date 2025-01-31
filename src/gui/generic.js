// namespaces
var dwvjq = dwvjq || {};
dwvjq.gui = dwvjq.gui || {};

/**
 * Post process a HTML table.
 * @param {Object} table The HTML table to process.
 * @return The processed HTML table.
 */
dwvjq.gui.postProcessTable = function (table) {
  var tableClass = table.className;
  // css
  table.className += ' table-stripe ui-responsive';
  // add columntoggle
  table.setAttribute('data-role', 'table');
  //table.setAttribute('data-mode', 'columntoggle');
  table.setAttribute(
    'data-column-btn-text',
    dwvjq.i18n.t('basics.columns') + '...'
  );
  // add priority columns for columntoggle
  var addDataPriority = function (cell) {
    var text = cell.firstChild.data;
    if (tableClass === 'tagsTable') {
      if (text !== 'value' && text !== 'name') {
        cell.setAttribute('data-priority', '5');
      }
    } else if (tableClass === 'drawsTable') {
      if (text === 'description') {
        cell.setAttribute('data-priority', '1');
      } else if (text === 'frame' || text === 'slice') {
        cell.setAttribute('data-priority', '5');
      }
    }
  };
  if (table.rows.length !== 0) {
    var hCells = table.rows.item(0).cells;
    for (var c = 0; c < hCells.length; ++c) {
      addDataPriority(hCells[c]);
    }
  }
  // return
  return table;
};

/**
 * Set the selected item of a HTML select.
 * @param {String} element The HTML select element.
 * @param {String} value The value of the option to mark as selected.
 */
dwvjq.gui.setSelected = function (element, value) {
  if (element) {
    var index = 0;
    for (index in element.options) {
      if (element.options[index].value === value) {
        break;
      }
    }
    element.selectedIndex = index;
    dwvjq.gui.refreshElement(element);
  }
};

dwvjq.gui.isDicomMeta = function (meta) {
  return typeof meta['00020010'] !== 'undefined';
};

dwvjq.gui.getMetaArray = function (metadata, instanceNumber) {
  var keys = Object.keys(metadata);
  var reducer;
  if (dwvjq.gui.isDicomMeta(metadata)) {
    reducer = dwvjq.gui.getDicomTagReducer(metadata, instanceNumber, '');
  } else {
    reducer = dwvjq.gui.getTagReducer(metadata);
  }
  return keys.reduce(reducer, []);
};

dwvjq.gui.getTagReducer = function (tagData) {
  return function (accumulator, currentValue) {
    accumulator.push({
      name: currentValue,
      value: tagData[currentValue].value
    });
    return accumulator;
  };
};

dwvjq.gui.getDicomTagReducer = function (tagData, instanceNumber, prefix) {
  return function (accumulator, currentValue) {
    const tag = dwv.getTagFromKey(currentValue);
    let name = tag.getNameFromDictionary();
    if (typeof name === 'undefined') {
      // add 'x' to help sorting
      name = 'x' + tag.getKey();
    }
    const element = tagData[currentValue];
    let value = element.value;
    // possible 'merged' object
    // (use slice method as test for array and typed array)
    if (typeof value.slice === 'undefined' &&
      typeof value[instanceNumber] !== 'undefined') {
      value = value[instanceNumber];
    }
    // force instance number (otherwise takes value in non indexed array)
    if (name === 'InstanceNumber') {
      value = instanceNumber;
    }
    // recurse for sequence
    if (element.vr === 'SQ') {
      // sequence tag
      accumulator.push({
        name: (prefix ? prefix + ' ' : '') + name,
        value: ''
      });
      // sequence value
      for (let i = 0; i < value.length; ++i) {
        const sqItems = value[i];
        const keys = Object.keys(sqItems);
        const res = keys.reduce(
          dwvjq.gui.getDicomTagReducer(
            sqItems, instanceNumber, prefix + '[' + i + ']'), []
        );
        accumulator = accumulator.concat(res);
      }
    } else {
      // shorten long 'o'ther data
      if (element.vr[0] === 'O' && value.length > 5) {
        value = value.slice(0, 5).toString() + '... (len:' + value.length + ')';
      }
      accumulator.push({
        name: (prefix ? prefix + ' ' : '') + name,
        value: value.toString()
      });
    }
    return accumulator;
  };
};

/**
 * MetaData base gui: shows DICOM tags or file meta data.
 * @constructor
 */
dwvjq.gui.MetaData = function () {
  // closure to self
  var self = this;
  // div ids
  var containerDivId = 'dwv-tags';
  var searchFormId = containerDivId + '-search';
  // search input handler
  var searchHandler;
  // meta data
  var fullMetaData;
  // instance number slider min
  var min;
  // instance number slider max
  var max;

  /**
   * Update the DICOM tags table with the input info.
   * @param {Object} dataInfo The data information.
   */
  this.update = function (dataInfo) {
    // store
    fullMetaData = dataInfo;

    var instanceElement = dataInfo['00200013'];
    if (typeof instanceElement !== 'undefined') {
      // set slider with instance numbers ('00200013')
      var instanceNumbers = instanceElement.value;
      // convert string to numbers
      var numbers = instanceNumbers.map(Number);
      numbers.sort((a, b) => a - b);
      // store
      min = numbers[0];
      max = numbers[numbers.length - 1];
    }

    // HTML node
    var node = document.getElementById(containerDivId);
    if (node === null) {
      console.warn('Cannot find a node to append the meta data.');
      return;
    }
    // remove possible previous
    while (node.hasChildNodes()) {
      node.removeChild(node.firstChild);
    }

    var div = document.createElement('div');
    div.className = 'ui-field-contain';

    // instance number input
    if (typeof instanceElement !== 'undefined') {
      var instNumInputId = containerDivId + '-instance-number';
      var instNumInput = document.createElement('input');
      instNumInput.type = 'range';
      instNumInput.id = instNumInputId;
      instNumInput.min = min;
      instNumInput.max = max;
      instNumInput.value = min;

      var label = document.createElement('label');
      label.setAttribute('for', instNumInput.id);
      label.appendChild(document.createTextNode('Instance number: '));

      div.appendChild(label);
      div.appendChild(instNumInput);

      // handle slider change
      var changeHandler = function (event) {
        var instanceNumber = event.target.value;
        var newDataInfoArray =
          dwvjq.gui.getMetaArray(fullMetaData, instanceNumber);
        self.updateTable(newDataInfoArray);
      };
      dwvjq.gui.setSliderChangeHandler(instNumInput, changeHandler);
    }

    // search form + slider
    var formSearch = dwvjq.html.getHtmlSearchForm(searchFormId);
    formSearch.appendChild(div);

    // append search form
    node.appendChild(formSearch);

    // update table with instance number meta data
    var dataInfoArray = dwvjq.gui.getMetaArray(fullMetaData, min);
    this.updateTable(dataInfoArray);
  };

  /**
   * update the
   *
   * @param {object} metaData The meta data.
   */
  this.updateTable = function (metaData) {
    // exit if no tags
    if (metaData.length === 0) {
      console.warn('No meta data tags to show.');
      return;
    }

    // HTML node
    var node = document.getElementById(containerDivId);
    // remove all but form
    if (node !== null) {
      // remove possible previous
      for (const child of node.children) {
        if (child.id !== searchFormId) {
          node.removeChild(child);
        }
      }
    }

    // tags HTML table
    var table = dwvjq.html.toTable(metaData);
    table.id = containerDivId + '-table';
    table.className = 'tagsTable';

    // optional gui specific table post process
    dwvjq.gui.postProcessTable(table);

    // check processed table
    if (table.rows.length === 0) {
      console.warn('The processed table does not contain data.');
      return;
    }

    // translate first row
    dwvjq.html.translateTableRow(table.rows.item(0));

    // append tags table
    node.appendChild(table);

    // refresh
    dwvjq.gui.refreshElement(node);

    // update search input
    var inputSearch = node.querySelector('input[type=text]');
    if (typeof searchHandler !== 'undefined') {
      inputSearch.removeEventListener('keyup', searchHandler);
    }
    searchHandler = function () {
      dwvjq.html.filterTable(inputSearch, table);
    };
    inputSearch.addEventListener('keyup', searchHandler);

    // launch search (in case a search is already active)
    searchHandler();
  };
}; // class dwvjq.gui.DicomTags

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function precisionRound(number, precision) {
  var factor = Math.pow(10, precision);
  var delta = 0.01 / factor; // fixes precisionRound(1.005, 2)
  return Math.round(number * factor + delta) / factor;
}

function pointToString(point) {
  var res = '(';
  var values = point.getValues();
  for (var i = 0; i < values.length; ++i) {
    if (i !== 0) {
      res += ',';
    }
    res += precisionRound(values[i], 2);
  }
  res += ')';
  return res;
}

/**
 * Drawing list base gui.
 * @param {Object} app The associated application.
 * @constructor
 */
dwvjq.gui.DrawList = function (app) {
  /**
   * Closure to self.
   */
  //var self = this;

  /**
   * Initialise.
   */
  this.init = function () {
    app.addEventListener('drawlayeradd', update);
    app.addEventListener('annotationadd', update);
    app.addEventListener('annotationupdate', update);
    app.addEventListener('annotationremove', update);
  };

  /**
   * Update the draw list html element
   * @param {Object} event A change event, decides if the table is editable
   *  or not.
   */
  function update(event) {
    var isEditable = false;
    if (typeof event.editable !== 'undefined') {
      isEditable = event.editable;
    }

    // find annotationGroup
    var dataIds = app.getDataIds();
    var annotationGroup;
    var dataId;
    for (var j = 0; j < dataIds.length; ++j) {
      var ag = app.getData(dataIds[j]).annotationGroup;
      if (typeof ag !== 'undefined') {
        annotationGroup = ag;
        dataId = dataIds[j];
      }
    }
    if (typeof annotationGroup === 'undefined') {
      return;
    }

    // draw layer
    const drawLayer = app.getDrawLayersByDataId(dataId)[0];

    // HTML node
    var node = document.getElementById('dwv-drawList');
    if (node === null) {
      console.warn('Cannot find a node to append the drawing list.');
      return;
    }
    // remove possible previous
    while (node.hasChildNodes()) {
      node.removeChild(node.firstChild);
    }

    var annotations = annotationGroup.getList();
    if (annotations.length === 0) {
      return;
    }

    // simpler details
    var simpleDetails = [];
    for (var i = 0; i < annotations.length; ++i) {
      var annotation = annotations[i];
      var simpleDetail = {
        id: annotation.id,
        position: pointToString(annotation.getCentroid()),
        type: capitalizeFirstLetter(annotation.getFactory().getName()),
        color: annotation.colour,
        description: annotation.textExpr
      };
      simpleDetails.push(simpleDetail);
    }

    // tags HTML table
    var table = dwvjq.html.toTable(simpleDetails);
    table.className = 'drawsTable';

    // cell indices
    var shapeCellIndex = 2;
    var colorCellIndex = shapeCellIndex + 1;
    var descCellIndex = colorCellIndex + 1;

    // optional gui specific table post process
    dwvjq.gui.postProcessTable(table);

    // check processed table
    if (table.rows.length === 0) {
      console.warn('The processed table does not contain data.');
      return;
    }

    // translate first row
    dwvjq.html.translateTableRow(table.rows.item(0));

    // translate shape names
    dwvjq.html.translateTableColumn(table, shapeCellIndex, 'shape', 'name');

    // create a color onkeyup handler
    var createColorOnKeyUp = function (annot) {
      return function () {
        const drawController = new dwv.DrawController(annotationGroup);
        drawController.updateAnnotationWithCommand(
          annot.id,
          {colour: annotation.colour},
          {colour: this.value},
          app.addToUndoStack
        );
      };
    };
    // create a text onkeyup handler
    var createDescriptionOnKeyUp = function (annot) {
      return function () {
        const drawController = new dwv.DrawController(annotationGroup);
        drawController.updateAnnotationWithCommand(
          annot.id,
          {textExpr: annotation.textExpr},
          {textExpr: this.value},
          app.addToUndoStack
        );
      };
    };
    // create a row onclick handler
    var createRowOnClick = function (annot) {
      return function () {
        var layerGroup = app.getActiveLayerGroup();
        var viewController =
          layerGroup.getActiveViewLayer().getViewController();
        viewController.setCurrentPosition(annot.getCentroid());
        // focus on the image
        dwvjq.gui.focusImage();
      };
    };

    // create visibility handler
    var createVisibleOnClick = function (ann, element) {
      return function () {
        drawLayer.setAnnotationVisibility(ann.id);
        if (drawLayer.isAnnotationVisible(ann.id)) {
          element.className = 'text-button checked';
        } else {
          element.className = 'text-button unchecked';
        }
      };
    };
    // delete handler
    var createDeleteOnClick = function (annot) {
      return function () {
        const drawController = new dwv.DrawController(annotationGroup);
        drawController.removeAnnotationWithCommand(
          annot.id,
          app.addToUndoStack
        );
      };
    };

    // append action column to the header row
    var row0 = table.rows.item(0);
    var cell00 = row0.insertCell(0);
    cell00.outerHTML = '<th>' + dwvjq.i18n.t('basics.action') + '</th>';

    // loop through rows
    for (var r = 1; r < table.rows.length; ++r) {
      var drawId = r - 1;
      var annot = annotations[drawId];
      var row = table.rows.item(r);
      var cells = row.cells;

      // loop through cells
      for (var c = 0; c < cells.length; ++c) {
        if (isEditable) {
          // color
          if (c === colorCellIndex) {
            dwvjq.html.makeCellEditable(
              cells[c],
              createColorOnKeyUp(annot),
              'color'
            );
          } else if (c === descCellIndex) {
            // text
            dwvjq.html.makeCellEditable(
              cells[c],
              createDescriptionOnKeyUp(annot)
            );
          }
        } else {
          // id: link to image
          cells[0].onclick = createRowOnClick(annot);
          cells[0].onmouseover = dwvjq.html.setCursorToPointer;
          cells[0].onmouseout = dwvjq.html.setCursorToDefault;
          // color: just display the input color with no callback
          if (c === colorCellIndex) {
            dwvjq.html.makeCellEditable(cells[c], null, 'color');
          }
        }
      }

      // append actions
      var cell0 = row.insertCell(0);
      // visibility
      var visibilitySpan = document.createElement('span');
      if (drawLayer.isAnnotationVisible(annot.id)) {
        visibilitySpan.className = 'text-button checked';
      } else {
        visibilitySpan.className = 'text-button unchecked';
      }
      visibilitySpan.title = 'Show/hide';
      visibilitySpan.appendChild(document.createTextNode('\u{1F441}')); // eye
      visibilitySpan.onclick =
        createVisibleOnClick(annot, visibilitySpan);
      cell0.appendChild(visibilitySpan);
      // delete
      var deleteSpan = document.createElement('span');
      deleteSpan.className = 'text-button checked';
      deleteSpan.title = 'Delete annotation';
      deleteSpan.appendChild(document.createTextNode('\u{274C}')); // cross
      deleteSpan.onclick = createDeleteOnClick(annot, deleteSpan);
      cell0.appendChild(deleteSpan);
    }

    // editable checkbox
    var tickBox = document.createElement('input');
    tickBox.setAttribute('type', 'checkbox');
    tickBox.id = 'checkbox-editable';
    tickBox.checked = isEditable;
    tickBox.onclick = function () {
      update({editable: this.checked});
    };
    // checkbox label
    var tickLabel = document.createElement('label');
    tickLabel.setAttribute('for', tickBox.id);
    tickLabel.setAttribute('class', 'inline');
    tickLabel.appendChild(document.createTextNode(
      dwvjq.i18n.t('basics.editMode')));
    // checkbox div
    var tickDiv = document.createElement('div');
    tickDiv.appendChild(tickLabel);
    tickDiv.appendChild(tickBox);

    // search form
    var searchForm = dwvjq.html.getHtmlSearchForm(table, 'draw-search');
    var inputSearch = searchForm.querySelector('input[type=text]');
    inputSearch.addEventListener('keyup', function () {
      dwvjq.html.filterTable(inputSearch, table);
    });
    node.appendChild(searchForm);

    // tick form
    node.appendChild(tickDiv);

    // draw list table
    node.appendChild(table);

    // save draw button
    var saveButton = document.createElement('button');
    saveButton.onclick = function () {
      var factory = new dwv.AnnotationGroupFactory();
      var dicomElements = factory.toDicom(annotationGroup);
      // write
      var writer = new dwv.DicomWriter();
      let dicomBuffer = null;
      try {
        dicomBuffer = writer.getBuffer(dicomElements);
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
      var blob = new Blob([dicomBuffer], {type: 'application/dicom'});

      // temporary link to download
      var element = document.createElement('a');
      element.href = window.URL.createObjectURL(blob);
      element.download = 'dicom-sr-' + dataId + '.dcm';
      // trigger download
      element.click();
      URL.revokeObjectURL(element.href);
    };
    saveButton.setAttribute('class', 'ui-btn ui-btn-inline');
    saveButton.appendChild(
      document.createTextNode(dwvjq.i18n.t('basics.downloadAnnotations'))
    );
    node.appendChild(saveButton);

    // delete draw button
    var deleteButton = document.createElement('button');
    deleteButton.onclick = function () {
      drawLayer.deleteDraws(app.addToUndoStack);
    };
    deleteButton.setAttribute('class', 'ui-btn ui-btn-inline');
    deleteButton.appendChild(
      document.createTextNode(dwvjq.i18n.t('basics.deleteDraws'))
    );
    if (!isEditable) {
      deleteButton.style.display = 'none';
    }
    node.appendChild(deleteButton);

    // refresh
    dwvjq.gui.refreshElement(node);
  }
}; // class dwvjq.gui.DrawList
