// namespaces
var dwvjq = dwvjq || {};

/**
 * Application GUI.
 */

// Default colour maps.
dwv.tool.colourMaps = {
    "plain": dwv.image.lut.plain,
    "invplain": dwv.image.lut.invPlain,
    "rainbow": dwv.image.lut.rainbow,
    "hot": dwv.image.lut.hot,
    "hotiron": dwv.image.lut.hot_iron,
    "pet": dwv.image.lut.pet,
    "hotmetalblue": dwv.image.lut.hot_metal_blue,
    "pet20step": dwv.image.lut.pet_20step
};
// Default window level presets.
dwv.tool.defaultpresets = {};
// Default window level presets for CT.
dwv.tool.defaultpresets.CT = {
    "mediastinum": {"center": 40, "width": 400},
    "lung": {"center": -500, "width": 1500},
    "bone": {"center": 500, "width": 2000},
    "brain": {"center": 40, "width": 80},
    "head": {"center": 90, "width": 350}
};

//decode query
dwv.utils.decodeQuery = function (query, callback)
{
    if (query.type === "gdrive") {
        var gAuth = new dwv.google.Auth();
        var gDrive = new dwv.google.Drive();
        gDrive.setIds( query.input.split(',') );
        // pipeline
        gAuth.onload = gDrive.load;
        gAuth.onfail = function () {
            $("#popupAuth").popup("open");
            var authorizeButton = document.getElementById('gauth-button');
            // explicit auth from button to allow popup
            authorizeButton.onclick = function() {
                $("#popupAuth").popup("close");
                gAuth.load();
            };
        };
        gDrive.onload = dwv.google.getAuthorizedCallback(callback);
        // launch with silent auth
        gAuth.loadSilent();
    }
    else {
        // default
        dwv.utils.base.decodeQuery(query, callback);
    }
};

// Prompt
dwv.gui.prompt = dwvjq.gui.prompt;
// get element
dwv.gui.getElement = dwvjq.gui.getElement;
// refresh
dwv.gui.refreshElement = dwvjq.gui.refreshElement;
// set selected
dwv.gui.setSelected = dwvjq.gui.setSelected;

// Post process table
dwv.gui.postProcessTable = dwvjq.gui.postProcessTable;

// Loaders
dwv.gui.Loadbox = dwvjq.gui.Loadbox;
// File loader
dwv.gui.FileLoad = dwvjq.gui.FileLoad;
dwvjq.gui.FileLoad.prototype.onchange = function (/*event*/) {
    $("#popupOpen").popup("close");
};
// Folder loader
dwv.gui.FolderLoad = dwvjq.gui.FolderLoad;
dwvjq.gui.FolderLoad.prototype.onchange = function (/*event*/) {
    $("#popupOpen").popup("close");
};
// Url loader
dwv.gui.UrlLoad = dwvjq.gui.UrlLoad;
dwvjq.gui.UrlLoad.prototype.onchange = function (/*event*/) {
    $("#popupOpen").popup("close");
};

// Toolbox
dwv.gui.Toolbox = function (app)
{
    var base = new dwvjq.gui.Toolbox(app);

    this.setup = function (list)
    {
        base.setup(list);

        // toolbar
        var buttonClass = "ui-btn ui-btn-inline ui-btn-icon-notext ui-mini";

        var open = document.createElement("a");
        open.href = "#popupOpen";
        open.setAttribute("class", buttonClass + " ui-icon-plus");
        open.setAttribute("data-rel", "popup");
        open.setAttribute("data-position-to", "window");

        var undo = document.createElement("a");
        undo.setAttribute("class", buttonClass + " ui-icon-back");
        undo.onclick = app.onUndo;

        var redo = document.createElement("a");
        redo.setAttribute("class", buttonClass + " ui-icon-forward");
        redo.onclick = app.onRedo;

        var toggleInfo = document.createElement("a");
        toggleInfo.setAttribute("class", buttonClass + " ui-icon-info");
        toggleInfo.onclick = app.onToggleInfoLayer;

        var toggleSaveState = document.createElement("a");
        toggleSaveState.setAttribute("class", buttonClass + " download-state ui-icon-action");
        toggleSaveState.onclick = app.onStateSave;
        toggleSaveState.download = "state.json";

        var tags = document.createElement("a");
        tags.href = "#tags_page";
        tags.setAttribute("class", buttonClass + " ui-icon-grid");

        var drawList = document.createElement("a");
        drawList.href = "#drawList_page";
        drawList.setAttribute("class", buttonClass + " ui-icon-edit");

        var node = app.getElement("toolbar");
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
    this.setFilterList = function (list) {
        base.setFilterList(list);
    };
    this.setShapeList = function (list) {
        base.setShapeList(list);
    };

};

// Window/level
dwv.gui.WindowLevel = dwvjq.gui.WindowLevel;
// Draw
dwv.gui.Draw = dwvjq.gui.Draw;
// ColourTool
dwv.gui.ColourTool = dwvjq.gui.ColourTool;
// ZoomAndPan
dwv.gui.ZoomAndPan = dwvjq.gui.ZoomAndPan;
// Scroll
dwv.gui.Scroll = dwvjq.gui.Scroll;
// Filter
dwv.gui.Filter = dwvjq.gui.Filter;

// Filter: threshold
dwv.gui.Threshold = dwvjq.gui.Threshold;
// Filter: sharpen
dwv.gui.Sharpen = dwvjq.gui.Sharpen;
// Filter: sobel
dwv.gui.Sobel = dwvjq.gui.Sobel;

// Undo/redo
dwv.gui.Undo = dwvjq.gui.Undo;
