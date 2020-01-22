// namespaces
var dwvjq = dwvjq || {};
/** @namespace */
dwvjq.gui = dwvjq.gui || {};
/** @namespace */
dwvjq.gui.filter = dwvjq.gui.filter || {};
/** @namespace */
dwvjq.gui.filter.base = dwvjq.gui.filter.base || {};

/**
 * Filter tool base gui.
 * @constructor
 */
dwvjq.gui.Filter = function (app)
{
    var filterGuis = {};

    /**
     * Setup the filter tool HTML.
     */
    this.setup = function (list)
    {
        // filter select
        var filterSelector = dwvjq.html.createHtmlSelect("filterSelect", list, "filter");
        filterSelector.onchange = function (event) {
            // show filter gui
            for ( var filterGui in filterGuis ) {
                filterGuis[filterGui].display(false);
            }
            filterGuis[event.currentTarget.value].display(true);
            // tell the app
            app.setImageFilter(event.currentTarget.value);
        };

        // filter list element
        var filterLi = dwvjq.html.createHiddenElement("li", "filterLi");
        filterLi.className += " ui-block-b";
        filterLi.appendChild(filterSelector);

        // append element
        var node = app.getElement("toolList").getElementsByTagName("ul")[0];
        dwvjq.html.appendElement(node, filterLi);

        // create tool gui and call setup
        for ( var key in list ) {
            var filterClass = list[key];
            var filterGui = new dwvjq.gui[filterClass](app);
            filterGui.setup(this.filterList);
            filterGuis[filterClass] = filterGui;
        }

    };

    /**
     * Display the tool HTML.
     * @param {Boolean} flag True to display, false to hide.
     */
    this.display = function (flag)
    {
        var node = app.getElement("filterLi");
        dwvjq.html.displayElement(node, flag);

        // set selected filter
        var filterSelector = app.getElement("filterSelect");
        if (flag) {
            var firstFilter = filterSelector.options[0].value;
            filterGuis[firstFilter].display(true);
            app.setImageFilter(firstFilter);
        } else {
            var optionKeys = Object.keys(filterSelector.options);
            for (var i = 0; i < optionKeys.length; ++i) {
                var option = filterSelector.options[optionKeys[i]];
                filterGuis[option.value].display(false);
            }
        }
    };

    /**
     * Initialise the tool HTML.
     * @returns Boolean True if the tool can be shown.
     */
    this.initialise = function ()
    {
        // filter select: reset selected options
        var filterSelector = app.getElement("filterSelect");
        filterSelector.selectedIndex = 0;

        // propagate
        for ( var filterGui in filterGuis ) {
            filterGuis[filterGui].initialise();
            filterGuis[filterGui].display(false);
        }

        // refresh
        dwvjq.gui.refreshElement(filterSelector);

        return true;
    };

}; // class dwvjq.gui.Filter

/**
 * Threshold filter base gui.
 * @constructor
 */
dwvjq.gui.Threshold = function (app)
{
    /**
     * Threshold slider.
     * @private
     * @type Object
     */
    var slider = new dwvjq.gui.Slider(app);

    /**
     * Setup the threshold filter HTML.
     */
    this.setup = function ()
    {
        // threshold list element
        var thresholdLi = dwvjq.html.createHiddenElement("li", "thresholdLi");
        thresholdLi.className += " ui-block-c";

        // node
        var node = app.getElement("toolList").getElementsByTagName("ul")[0];
        // append threshold
        node.appendChild(thresholdLi);
        // threshold slider
        slider.append();
        // refresh
        dwvjq.gui.refreshElement(node);
    };

    /**
     * Clear the threshold filter HTML.
     * @param {Boolean} flag True to display, false to hide.
     */
    this.display = function (flag)
    {
        // only initialise at display time
        // (avoids min/max calculation at startup)
        if (flag) {
            slider.initialise();
        }

        var node = app.getElement("thresholdLi");
        dwvjq.html.displayElement(node, flag);
    };

    /**
     * Initialise the threshold filter HTML.
     */
    this.initialise = function ()
    {
        // nothing to do
    };

}; // class dwvjq.gui.Threshold

/**
 * Create the apply filter button.
 */
dwvjq.gui.filter.base.createFilterApplyButton = function (app)
{
    var button = document.createElement("button");
    button.id = "runFilterButton";
    button.onclick = function (/*event*/) {
        app.runImageFilter();
    };
    button.setAttribute("style","width:100%; margin-top:0.5em;");
    button.setAttribute("class","ui-btn ui-btn-b");
    button.appendChild(document.createTextNode(dwv.i18n("basics.apply")));
    return button;
};

/**
 * Sharpen filter base gui.
 * @constructor
 */
dwvjq.gui.Sharpen = function (app)
{
    /**
     * Setup the sharpen filter HTML.
     */
    this.setup = function ()
    {
        // sharpen list element
        var sharpenLi = dwvjq.html.createHiddenElement("li", "sharpenLi");
        sharpenLi.className += " ui-block-c";
        sharpenLi.appendChild( dwvjq.gui.filter.base.createFilterApplyButton(app) );
        // append element
        var node = app.getElement("toolList").getElementsByTagName("ul")[0];
        dwvjq.html.appendElement(node, sharpenLi);
    };

    /**
     * Display the sharpen filter HTML.
     * @param {Boolean} flag True to display, false to hide.
     */
    this.display = function (flag)
    {
        var node = app.getElement("sharpenLi");
        dwvjq.html.displayElement(node, flag);
    };

    this.initialise = function () {
        // nothing to do
    };

}; // class dwvjq.gui.Sharpen

/**
 * Sobel filter base gui.
 * @constructor
 */
dwvjq.gui.Sobel = function (app)
{
    /**
     * Setup the sobel filter HTML.
     */
    this.setup = function ()
    {
        // sobel list element
        var sobelLi = dwvjq.html.createHiddenElement("li", "sobelLi");
        sobelLi.className += " ui-block-c";
        sobelLi.appendChild( dwvjq.gui.filter.base.createFilterApplyButton(app) );
        // append element
        var node = app.getElement("toolList").getElementsByTagName("ul")[0];
        dwvjq.html.appendElement(node, sobelLi);
    };

    /**
     * Display the sobel filter HTML.
     * @param {Boolean} flag True to display, false to hide.
     */
    this.display = function (flag)
    {
        var node = app.getElement("sobelLi");
        dwvjq.html.displayElement(node, flag);
    };

    this.initialise = function () {
        // nothing to do
    };

}; // class dwvjq.gui.Sobel
