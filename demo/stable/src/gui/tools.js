// namespaces
var dwvjq = dwvjq || {};
dwvjq.gui = dwvjq.gui || {};

/**
 * Toolbox base gui.
 * @constructor
 */
dwvjq.gui.Toolbox = function (app)
{
    var toolGuis = {};

    /**
     * Setup the toolbox HTML.
     * @param {Object} list The tool list
     */
    this.setup = function (list)
    {
        // tool select
        var toolSelector = dwvjq.html.createHtmlSelect("toolSelect", list, "tool");
        toolSelector.onchange = function (event) {
            // tell the app
            app.setTool(event.currentTarget.value);
            // show tool gui
            for ( var gui in toolGuis ) {
                toolGuis[gui].display(false);
            }
            toolGuis[event.currentTarget.value].display(true);
        };

        // tool list element
        var toolLi = document.createElement("li");
        toolLi.className = "toolLi ui-block-a";
        toolLi.style.display = "none";
        toolLi.appendChild(toolSelector);

        // tool ul
        var toolUl = document.createElement("ul");
        toolUl.appendChild(toolLi);
        toolUl.className = "ui-grid-b";

        // node
        var node = app.getElement("toolList");
        // append
        node.appendChild(toolUl);
        // refresh
        dwvjq.gui.refreshElement(node);

        // create tool gui and call setup
        toolGuis = [];
        for ( var key in list ) {
            var guiClass = key;
            var gui = null;
            if (guiClass === "Livewire") {
                gui = new dwvjq.gui.ColourTool(app, "lw");
            } else if (guiClass === "Floodfill") {
                gui = new dwvjq.gui.ColourTool(app, "ff");
            } else {
                if (typeof dwvjq.gui[guiClass] === "undefined") {
                    console.warn("Could not create unknown loader gui: "+guiClass);
                    continue;
                }
                gui = new dwvjq.gui[guiClass](app);
            }

            if (guiClass === "Filter" ||
                guiClass === "Draw") {
                gui.setup(list[key].options);
            } else {
                gui.setup();
            }

            // store
            toolGuis[guiClass] = gui;
        }
    };

    /**
     * Display the toolbox HTML.
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function (bool)
    {
        // tool list element
        var node = app.getElement("toolLi");
        dwvjq.html.displayElement(node, bool);
    };

    /**
     * Initialise the toolbox HTML.
     */
    this.initialise = function ()
    {
        // tool select: reset selected option
        var selector = app.getElement("toolSelect");

        // propagate and check if tool can be displayed
        var displays = [];
        var first = true;
        for ( var guiClass in toolGuis ) {
            toolGuis[guiClass].display(false);
            var canInit = toolGuis[guiClass].initialise();
            // activate first tool
            if (canInit && first) {
                app.setTool(guiClass);
                toolGuis[guiClass].display(true);
                first = false;
            }
            // store state
            displays.push(canInit);
        }

        // update list display according to gui states
        var options = selector.options;
        var selectedIndex = -1;
        for ( var i = 0; i < options.length; ++i ) {
            if ( !displays[i] ) {
                options[i].style.display = "none";
            }
            else {
                if ( selectedIndex === -1 ) {
                    selectedIndex = i;
                }
                options[i].style.display = "";
            }
        }
        selector.selectedIndex = selectedIndex;

        // refresh
        dwvjq.gui.refreshElement(selector);
    };

}; // dwvjq.gui.Toolbox

/**
 * WindowLevel tool base gui.
 * @constructor
 */
dwvjq.gui.WindowLevel = function (app)
{
    /**
     * Setup the tool HTML.
     */
    this.setup = function ()
    {
        // preset select
        var wlSelector = dwvjq.html.createHtmlSelect("presetSelect", []);
        wlSelector.onchange = function (event) {
            app.setWindowLevelPreset(event.currentTarget.value);
        };
        // colour map select
        var cmSelector = dwvjq.html.createHtmlSelect("colourMapSelect", dwv.tool.colourMaps, "colourmap");
        cmSelector.onchange = function (event) {
            app.setColourMap(event.currentTarget.value);
        };

        // preset list element
        var wlLi = document.createElement("li");
        wlLi.className = "wlLi ui-block-b";
        //wlLi.className = "wlLi";
        wlLi.style.display = "none";
        wlLi.appendChild(wlSelector);
        // colour map list element
        var cmLi = document.createElement("li");
        cmLi.className = "cmLi ui-block-c";
        //cmLi.className = "cmLi";
        cmLi.style.display = "none";
        cmLi.appendChild(cmSelector);

        // node
        var node = app.getElement("toolList").getElementsByTagName("ul")[0];
        // append preset
        node.appendChild(wlLi);
        // append colour map
        node.appendChild(cmLi);
        // refresh
        dwvjq.gui.refreshElement(node);
    };

    /**
     * Display the tool HTML.
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function (bool)
    {
        // presets list element
        var node = app.getElement("wlLi");
        dwvjq.html.displayElement(node, bool);
        // colour map list element
        node = app.getElement("cmLi");
        dwvjq.html.displayElement(node, bool);

        var onAddPreset = function (event) {
            var wlSelector = app.getElement("presetSelect");
            // add preset
            wlSelector.add(new Option(capitalizeFirstLetter(event.name), event.name));
            // set as selected
            wlSelector.selectedIndex = wlSelector.options.length - 1;
            // refresh
            dwvjq.gui.refreshElement(wlSelector);
        };

        if (bool) {
            app.addEventListener('wl-preset-add', onAddPreset);
        } else {
            app.removeEventListener('wl-preset-add', onAddPreset);
        }
    };

    /**
     * Initialise the tool HTML.
     * @returns Boolean True if the tool can be shown.
     */
    this.initialise = function ()
    {
        if (!app.canWindowLevel()) {
            return false;
        }

        // create new preset select
        var wlSelector = dwvjq.html.createHtmlSelect("presetSelect",
            app.getViewController().getWindowLevelPresetsNames(), "wl.presets", true);
        wlSelector.onchange = function (event) {
            app.setWindowLevelPreset(event.currentTarget.value);
        };
        wlSelector.title = "Select w/l preset.";

        // copy html list
        var wlLi = app.getElement("wlLi");
        // clear node
        dwvjq.html.cleanNode(wlLi);
        // add children
        wlLi.appendChild(wlSelector);
        // refresh
        dwvjq.gui.refreshElement(wlLi);

        // colour map select
        var cmSelector = app.getElement("colourMapSelect");
        cmSelector.selectedIndex = 0;
        // special monochrome1 case
        if( app.getImage().getPhotometricInterpretation() === "MONOCHROME1" )
        {
            cmSelector.selectedIndex = 1;
        }
        // refresh
        dwvjq.gui.refreshElement(cmSelector);

        return true;
    };

}; // class dwvjq.gui.WindowLevel

/**
 * Draw tool base gui.
 * @constructor
 */
dwvjq.gui.Draw = function (app)
{
    // default colours
    var colours = [
       "Yellow", "Red", "White", "Green", "Blue", "Lime", "Fuchsia", "Black"
    ];
    /**
     * Get the default colour.
     */
    this.getDefaultColour = function () {
        if ( dwvjq.browser.hasInputColor() ) {
            return "#FFFF80";
        }
        else {
            return colours[0];
        }
    };

    /**
     * Setup the tool HTML.
     */
    this.setup = function (shapeList)
    {
        // shape select
        var shapeSelector = dwvjq.html.createHtmlSelect("shapeSelect", shapeList, "shape");
        shapeSelector.onchange = function (event) {
            app.setDrawShape(event.currentTarget.value);
        };
        // colour select
        var colourSelector = null;
        if ( dwvjq.browser.hasInputColor() ) {
            colourSelector = document.createElement("input");
            colourSelector.className = "colourSelect";
            colourSelector.type = "color";
            colourSelector.value = "#FFFF80";
        }
        else {
            colourSelector = dwvjq.html.createHtmlSelect("colourSelect", colours, "colour");
        }
        colourSelector.onchange = function (event) {
            app.setDrawLineColour(event.currentTarget.value);
        };

        // shape list element
        var shapeLi = document.createElement("li");
        shapeLi.className = "shapeLi ui-block-c";
        shapeLi.style.display = "none";
        shapeLi.appendChild(shapeSelector);
        //shapeLi.setAttribute("class","ui-block-c");
        // colour list element
        var colourLi = document.createElement("li");
        colourLi.className = "colourLi ui-block-b";
        colourLi.style.display = "none";
        colourLi.appendChild(colourSelector);
        //colourLi.setAttribute("class","ui-block-b");

        // node
        var node = app.getElement("toolList").getElementsByTagName("ul")[0];
        // apend shape
        node.appendChild(shapeLi);
        // append colour
        node.appendChild(colourLi);
        // refresh
        dwvjq.gui.refreshElement(node);
    };

    /**
     * Display the tool HTML.
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function (bool)
    {
        // colour list element
        var node = app.getElement("colourLi");
        dwvjq.html.displayElement(node, bool);
        // shape list element
        node = app.getElement("shapeLi");
        dwvjq.html.displayElement(node, bool);

        // set selected shape
        if (bool) {
            var shapeSelector = app.getElement("shapeSelect");
            app.setDrawShape(shapeSelector.options[0].value);
        }
    };

    /**
     * Initialise the tool HTML.
     * @returns Boolean True if the tool can be shown.
     */
    this.initialise = function ()
    {
        // shape select: reset selected option
        var shapeSelector = app.getElement("shapeSelect");
        shapeSelector.selectedIndex = 0;
        // refresh
        dwvjq.gui.refreshElement(shapeSelector);

        // colour select: reset selected option
        var colourSelector = app.getElement("colourSelect");
        if ( !dwvjq.browser.hasInputColor() ) {
            colourSelector.selectedIndex = 0;
        }
        // refresh
        dwvjq.gui.refreshElement(colourSelector);

        return true;
    };

}; // class dwvjq.gui.Draw

/**
 * Base gui for a tool with a colour setting.
 * @constructor
 */
dwvjq.gui.ColourTool = function (app, prefix)
{
    // default colours
    var colours = [
       "Yellow", "Red", "White", "Green", "Blue", "Lime", "Fuchsia", "Black"
    ];
    // colour selector class
    var colourSelectClassName = prefix + "ColourSelect";
    // colour selector class
    var colourLiClassName = prefix + "ColourLi";

    /**
     * Get the default colour.
     */
    this.getDefaultColour = function () {
        if ( dwvjq.browser.hasInputColor() ) {
            return "#FFFF80";
        }
        else {
            return colours[0];
        }
    };

    /**
     * Setup the tool HTML.
     */
    this.setup = function ()
    {
        // colour select
        var colourSelector = null;
        if ( dwvjq.browser.hasInputColor() ) {
            colourSelector = document.createElement("input");
            colourSelector.className = colourSelectClassName;
            colourSelector.type = "color";
            colourSelector.value = "#FFFF80";
        }
        else {
            colourSelector = dwvjq.html.createHtmlSelect(colourSelectClassName, colours, "colour");
        }
        colourSelector.onchange = function (event) {
            app.setDrawLineColour(event.currentTarget.value);
        };

        // colour list element
        var colourLi = document.createElement("li");
        colourLi.className = colourLiClassName + " ui-block-b";
        colourLi.style.display = "none";
        //colourLi.setAttribute("class","ui-block-b");
        colourLi.appendChild(colourSelector);

        // node
        var node = app.getElement("toolList").getElementsByTagName("ul")[0];
        // apend colour
        node.appendChild(colourLi);
        // refresh
        dwvjq.gui.refreshElement(node);
    };

    /**
     * Display the tool HTML.
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function (bool)
    {
        // colour list
        var node = app.getElement(colourLiClassName);
        dwvjq.html.displayElement(node, bool);
    };

    /**
     * Initialise the tool HTML.
     * @returns Boolean True if the tool can be shown.
     */
    this.initialise = function ()
    {
        var colourSelector = app.getElement(colourSelectClassName);
        if ( !dwvjq.browser.hasInputColor() ) {
            colourSelector.selectedIndex = 0;
        }
        dwvjq.gui.refreshElement(colourSelector);

        return true;
    };

}; // class dwvjq.gui.ColourTool

/**
 * ZoomAndPan tool base gui.
 * @constructor
 */
dwvjq.gui.ZoomAndPan = function (app)
{
    /**
     * Setup the tool HTML.
     */
    this.setup = function()
    {
        // reset button
        var button = document.createElement("button");
        button.className = "zoomResetButton";
        button.name = "zoomResetButton";
        button.onclick = function (/*event*/) {
            app.resetZoom();
        };
        button.setAttribute("style","width:100%; margin-top:0.5em;");
        button.setAttribute("class","ui-btn ui-btn-b");
        var text = document.createTextNode(dwv.i18n("basics.reset"));
        button.appendChild(text);

        // list element
        var liElement = document.createElement("li");
        liElement.className = "zoomLi ui-block-c";
        liElement.style.display = "none";
        //liElement.setAttribute("class","ui-block-c");
        liElement.appendChild(button);

        // node
        var node = app.getElement("toolList").getElementsByTagName("ul")[0];
        // append element
        node.appendChild(liElement);
        // refresh
        dwvjq.gui.refreshElement(node);
    };

    /**
     * Display the tool HTML.
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function(bool)
    {
        // display list element
        var node = app.getElement("zoomLi");
        dwvjq.html.displayElement(node, bool);
    };

    /**
     * Initialise the tool HTML.
     * @returns Boolean True if the tool can be shown.
     */
    this.initialise = function () {
        return true;
    };

}; // class dwvjq.gui.ZoomAndPan

/**
 * Scroll tool base gui.
 * @constructor
 */
dwvjq.gui.Scroll = function (app)
{
    /**
     * Setup the tool HTML.
     */
    this.setup = function()
    {
        // list element
        var liElement = document.createElement("li");
        liElement.className = "scrollLi ui-block-c";
        liElement.style.display = "none";

        // node
        var node = app.getElement("toolList").getElementsByTagName("ul")[0];
        // append element
        node.appendChild(liElement);
        // refresh
        dwvjq.gui.refreshElement(node);
    };

    /**
     * Display the tool HTML.
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function(bool)
    {
        // display list element
        var node = app.getElement("scrollLi");
        dwvjq.html.displayElement(node, bool);
    };

    /**
     * Initialise the tool HTML.
     * @returns Boolean True if the tool can be shown.
     */
    this.initialise = function () {
        return app.canScroll();
    };

}; // class dwvjq.gui.Scroll

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
