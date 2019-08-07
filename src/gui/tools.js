// namespaces
var dwvjq = dwvjq || {};
dwvjq.gui = dwvjq.gui || {};

/**
 * Toolbox base gui.
 * @constructor
 */
dwvjq.gui.Toolbox = function (app)
{
    /**
     * Setup the toolbox HTML.
     */
    this.setup = function (list)
    {
        // tool select
        var toolSelector = dwvjq.html.createHtmlSelect("toolSelect", list, "tool");
        toolSelector.onchange = app.onChangeTool;

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
    this.initialise = function (displays)
    {
        // tool select: reset selected option
        var toolSelector = app.getElement("toolSelect");

        // update list
        var options = toolSelector.options;
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
        toolSelector.selectedIndex = selectedIndex;

        // refresh
        dwvjq.gui.refreshElement(toolSelector);
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
        wlSelector.onchange = app.onChangeWindowLevelPreset;
        // colour map select
        var cmSelector = dwvjq.html.createHtmlSelect("colourMapSelect", dwv.tool.colourMaps, "colourmap");
        cmSelector.onchange = app.onChangeColourMap;

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
    };

    /**
     * Initialise the tool HTML.
     */
    this.initialise = function ()
    {
        // create new preset select
        var wlSelector = dwvjq.html.createHtmlSelect("presetSelect",
            app.getViewController().getWindowLevelPresetsNames(), "wl.presets", true);
        wlSelector.onchange = app.onChangeWindowLevelPreset;
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
        shapeSelector.onchange = app.onChangeShape;
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
        colourSelector.onchange = app.onChangeLineColour;

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
    };

    /**
     * Initialise the tool HTML.
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
        colourSelector.onchange = app.onChangeLineColour;

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
     */
    this.initialise = function ()
    {
        var colourSelector = app.getElement(colourSelectClassName);
        if ( !dwvjq.browser.hasInputColor() ) {
            colourSelector.selectedIndex = 0;
        }
        dwvjq.gui.refreshElement(colourSelector);
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
        button.onclick = app.onZoomReset;
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

}; // class dwvjq.gui.Scroll
