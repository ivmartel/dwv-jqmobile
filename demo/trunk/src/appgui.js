// namespaces
var dwvjq = dwvjq || {};
dwvjq.utils = dwvjq.utils || {};

/**
 * Application GUI.
 */

// Default colour maps.
dwv.luts = {
  plain: dwv.luts.plain,
  invPlain: dwv.luts.invPlain,
  rainbow: dwv.luts.rainbow,
  hot: dwv.luts.hot,
  hot_iron: dwv.luts.hot_iron,
  pet: dwv.luts.pet,
  hot_metal_blue: dwv.luts.hot_metal_blue,
  pet_20step: dwv.luts.pet_20step
};

// Default window level presets.
dwv.defaultpresets = {};
// Default window level presets for CT.
dwv.defaultpresets.CT = {
  mediastinum: {center: 40, width: 400},
  lung: {center: -500, width: 1500},
  bone: {center: 500, width: 2000},
  brain: {center: 40, width: 80},
  head: {center: 90, width: 350}
};

// decode query
dwvjq.utils.loadFromUri = function (uri, app) {
  var url = new URL(uri);
  var searchParams = url.searchParams;
  // check query
  var input = searchParams.get('input');
  if (input) {
    var type = searchParams.get('type');
    // special gdrive
    if (type) {
      var gAuth = new dwvjq.google.Auth();
      var gDrive = new dwvjq.google.Drive();
      gDrive.setIds(input.split(','));
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
      app.loadFromUri(uri);
    }
  }
};

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
      var infoLayer = document.getElementById('infoLayer');
      dwvjq.html.toggleDisplay(infoLayer);
      infoController.toggleListeners();
    };

    var tags = document.createElement('a');
    tags.href = '#tags_page';
    tags.setAttribute('class', buttonClass + ' ui-icon-grid');

    var drawList = document.createElement('a');
    drawList.href = '#drawList_page';
    drawList.setAttribute('class', buttonClass + ' ui-icon-edit');

    var node = document.getElementById('dwv-toolbar');
    node.appendChild(open);
    node.appendChild(undo);
    node.appendChild(redo);
    node.appendChild(toggleInfo);
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
