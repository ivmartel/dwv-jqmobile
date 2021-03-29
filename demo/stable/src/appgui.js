// namespaces
var dwvjq = dwvjq || {};
dwvjq.utils = dwvjq.utils || {};

/**
 * Application GUI.
 */

// Default colour maps.
dwv.tool.colourMaps = {
  plain: dwv.image.lut.plain,
  invplain: dwv.image.lut.invPlain,
  rainbow: dwv.image.lut.rainbow,
  hot: dwv.image.lut.hot,
  hotiron: dwv.image.lut.hot_iron,
  pet: dwv.image.lut.pet,
  hotmetalblue: dwv.image.lut.hot_metal_blue,
  pet20step: dwv.image.lut.pet_20step
};
// Default window level presets.
dwv.tool.defaultpresets = {};
// Default window level presets for CT.
dwv.tool.defaultpresets.CT = {
  mediastinum: {center: 40, width: 400},
  lung: {center: -500, width: 1500},
  bone: {center: 500, width: 2000},
  brain: {center: 40, width: 80},
  head: {center: 90, width: 350}
};

// decode query
dwvjq.utils.loadFromUri = function (uri, app) {
  var query = dwv.utils.getUriQuery(uri);
  // check query
  if (query && typeof query.input !== 'undefined') {
    // special gdrive
    if (query.type === 'gdrive') {
      var gAuth = new dwvjq.google.Auth();
      var gDrive = new dwvjq.google.Drive();
      gDrive.setIds(query.input.split(','));
      // pipeline
      gAuth.onload = gDrive.load;
      gAuth.onfail = function () {
        $('#popupAuth').popup('open');
        var authorizeButton = document.getElementById('gauth-button');
        // explicit auth from button to allow popup
        authorizeButton.onclick = function () {
          $('#popupAuth').popup('close');
          gAuth.load();
        };
      };
      gDrive.onload = dwvjq.google.getAuthorizedCallback(app.loadURLs);
      // launch with silent auth
      gAuth.loadSilent();
    } else {
      // default
      dwv.utils.loadFromQuery(query, app);
    }
  }
};

// dwv overrides -------------------------

// prompt
dwv.gui.prompt = dwvjq.gui.prompt;
// get element
dwv.gui.getElement = dwvjq.gui.getElement;

// [end] dwv overrides -------------------------

// special close dialog on change
dwvjq.gui.FileLoad.prototype.onchange = function (/*event*/) {
  $('#popupOpen').popup('close');
};
dwvjq.gui.FolderLoad.prototype.onchange = function (/*event*/) {
  $('#popupOpen').popup('close');
};
dwvjq.gui.UrlLoad.prototype.onchange = function (/*event*/) {
  $('#popupOpen').popup('close');
};

// Toolbox
dwvjq.gui.ToolboxContainer = function (app, infoController) {
  var base = new dwvjq.gui.Toolbox(app);

  this.setup = function (list) {
    base.setup(list);

    // toolbar
    var buttonClass = 'ui-btn ui-btn-inline ui-btn-icon-notext ui-mini';

    var open = document.createElement('a');
    open.href = '#popupOpen';
    open.setAttribute('class', buttonClass + ' ui-icon-plus');
    open.setAttribute('data-rel', 'popup');
    open.setAttribute('data-position-to', 'window');

    var undo = document.createElement('a');
    undo.setAttribute('class', buttonClass + ' ui-icon-back');
    undo.onclick = function (/*event*/) {
      app.undo();
    };

    var redo = document.createElement('a');
    redo.setAttribute('class', buttonClass + ' ui-icon-forward');
    redo.onclick = function (/*event*/) {
      app.redo();
    };

    var toggleInfo = document.createElement('a');
    toggleInfo.setAttribute('class', buttonClass + ' ui-icon-info');
    toggleInfo.onclick = function () {
      var infoLayer = app.getElement('infoLayer');
      dwvjq.html.toggleDisplay(infoLayer);
      infoController.toggleListeners();
    };

    var toggleSaveState = document.createElement('a');
    toggleSaveState.setAttribute(
      'class',
      buttonClass + ' download-state ui-icon-action'
    );
    toggleSaveState.onclick = function () {
      var blob = new Blob([app.getState()], {type: 'application/json'});
      toggleSaveState.href = window.URL.createObjectURL(blob);
    };
    toggleSaveState.download = 'state.json';

    var tags = document.createElement('a');
    tags.href = '#tags_page';
    tags.setAttribute('class', buttonClass + ' ui-icon-grid');

    var drawList = document.createElement('a');
    drawList.href = '#drawList_page';
    drawList.setAttribute('class', buttonClass + ' ui-icon-edit');

    var node = app.getElement('toolbar');
    node.appendChild(open);
    node.appendChild(undo);
    node.appendChild(redo);
    node.appendChild(toggleInfo);
    node.appendChild(toggleSaveState);
    node.appendChild(tags);
    node.appendChild(drawList);
    dwvjq.gui.refreshElement(node);
  };

  this.display = function (flag) {
    base.display(flag);
  };
  this.initialise = function () {
    base.initialise();
  };
};
