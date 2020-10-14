// namespaces
var dwvjq = dwvjq || {};
/** @namespace */
dwvjq.gui = dwvjq.gui || {};

/**
 * Display a progress value.
 * @param {Number} percent The progress percentage.
 */
/* global NProgress */
dwvjq.gui.displayProgress = function (percent) {
  NProgress.configure({showSpinner: false});
  if (percent < 100) {
    NProgress.set(percent / 100);
  } else if (percent >= 100) {
    NProgress.done();
  }
};

/**
 * Focus the view on the image.
 */
dwvjq.gui.focusImage = function () {
  $.mobile.changePage('#main');
};

/**
 * Refresh a HTML element.
 * @param {String} element The HTML element to refresh.
 */
dwvjq.gui.refreshElement = function (element) {
  if ($(element)[0].nodeName.toLowerCase() === 'select') {
    $(element).selectmenu('refresh');
  } else {
    $(element).enhanceWithin();
  }
};

/**
 * Slider base gui.
 * @constructor
 */
dwvjq.gui.Slider = function (app) {
  /**
   * Append the slider HTML.
   */
  this.append = function () {
    // default values
    var min = 0;
    var max = 1;

    // jquery-mobile range slider
    // minimum input
    var inputMin = document.createElement('input');
    inputMin.id = 'threshold-min';
    inputMin.type = 'range';
    inputMin.max = max;
    inputMin.min = min;
    inputMin.value = min;
    // maximum input
    var inputMax = document.createElement('input');
    inputMax.id = 'threshold-max';
    inputMax.type = 'range';
    inputMax.max = max;
    inputMax.min = min;
    inputMax.value = max;
    // slicer div
    var div = document.createElement('div');
    div.id = 'threshold-div';
    div.setAttribute('data-role', 'rangeslider');
    div.appendChild(inputMin);
    div.appendChild(inputMax);
    div.setAttribute('data-mini', 'true');
    // append to document
    app.getElement('thresholdLi').appendChild(div);
    // bind change
    $('#threshold-div').on('change', function (/*event*/) {
      app.setFilterMinMax({
        min: $('#threshold-min').val(),
        max: $('#threshold-max').val()
      });
    });
    // refresh
    dwvjq.gui.refreshElement(app.getElement('toolList'));
  };

  /**
   * Initialise the slider HTML.
   */
  this.initialise = function () {
    var min = app.getImage().getDataRange().min;
    var max = app.getImage().getDataRange().max;

    // minimum input
    var inputMin = document.getElementById('threshold-min');
    inputMin.max = max;
    inputMin.min = min;
    inputMin.value = min;
    // maximum input
    var inputMax = document.getElementById('threshold-max');
    inputMax.max = max;
    inputMax.min = min;
    inputMax.value = max;
    // refresh
    dwvjq.gui.refreshElement(app.getElement('toolList'));
  };
}; // class dwvjq.gui.Slider
