// namespaces
var dwvjq = dwvjq || {};
/**
 * The i18next namespace.
 *
 * @external i18next
 * @see https://www.i18next.com
 */
var i18next = i18next || {};
/**
 * The i18nextHttpBackend namespace.
 *
 * @external i18nextHttpBackend
 * @see https://github.com/i18next/i18next-http-backend
 */
var i18nextHttpBackend = i18nextHttpBackend || {};
/**
 * The i18nextBrowserLanguageDetector namespace.
 *
 * @external i18nextBrowserLanguageDetector
 * @see https://github.com/i18next/i18next-browser-languageDetector
 */
var i18nextBrowserLanguageDetector = i18nextBrowserLanguageDetector || {};

// This is mainly a wrapper around the i18next object.
// see its API: http://i18next.com/docs/api/

// global locales path
dwvjq.i18nLocalesPath = null;

/**
 * Initialise i18n.
 *
 * @param {string} language The language to translate to. Defaults to 'auto' and
 *   gets the language from the browser.
 * @param {string} localesPath Path to the locales directory.
 */
dwvjq.i18nInitialise = function (language, localesPath) {
  var lng = (typeof language === 'undefined') ? 'auto' : language;
  var lpath = (typeof localesPath === 'undefined') ? '../..' : localesPath;
  // store as global
  dwvjq.i18nLocalesPath = lpath;
  // i18n options: default 'en' language and
  //  only load language, not specialised (for ex en-GB)
  var options = {
    fallbackLng: 'en',
    load: 'languageOnly',
    backend: {loadPath: lpath + '/locales/{{lng}}/{{ns}}.json'}
  };
    // use the HTTP backend to get translation files
  var i18n = i18next.use(i18nextHttpBackend);
  // use browser language or the specified one
  if (lng === 'auto') {
    i18n.use(i18nextBrowserLanguageDetector);
  } else {
    options.lng = lng;
  }
  // init i18n: will be ready when the 'loaded' event is fired
  i18n.init(options);
};

/**
 * Initialise i18n with recources as input.
 *
 * @param {string} language The language to translate to. Defaults to 'auto' and
 *   gets the language from the browser.
 * @param {object} resources Languages provided as object.
 */
dwvjq.i18nInitialiseWithResources = function (language, resources) {
  var lng = (typeof language === 'undefined') ? 'auto' : language;
  // i18n options: default 'en' language and
  //  only load language, not specialised (for ex en-GB)
  var options = {
    fallbackLng: 'en',
    load: 'languageOnly',
    resources: resources
  };
    // use browser language or the specified one
    // init i18n: will be ready when the 'loaded' event is fired
  if (lng === 'auto') {
    var i18n = i18next.use(i18nextBrowserLanguageDetector);
    i18n.init(options);
  } else {
    options.lng = lng;
    i18next.init(options);
  }
};

/**
 * Handle i18n 'initialized' event.
 *
 * @param {object} callback The callback function to call when i18n
 *   is initialised.
 * It can take one argument that will be replaced with the i18n options.
 */
dwvjq.i18nOnInitialised = function (callback) {
  i18next.on('initialized', callback);
};

/**
 * Stop handling i18n load event.
 */
dwvjq.i18nOffInitialised = function () {
  i18next.off('initialized');
};

/**
 * Handle i18n failed load event.
 *
 * @param {object} callback The callback function to call when i18n is loaded.
 *  It can take three arguments: lng, ns and msg.
 */
dwvjq.i18nOnFailedLoad = function (callback) {
  i18next.on('failedLoading', callback);
};

/**
 * Stop handling i18n failed load event.
 */
dwvjq.i18nOffFailedLoad = function () {
  i18next.off('failedLoading');
};

/**
 * Get the translated text.
 *
 * @param {string} key The key to the text entry.
 * @param {object} _options The translation options such as plural, context...
 * @returns {string} The translated text.
 */
dwv.i18n = function (key, options) {
  return i18next.t(key, options);
};

/**
 * Check the existence of a translation.
 *
 * @param {string} key The key to the text entry.
 * @param {object} options The translation options such as plural, context...
 * @returns {boolean} True if the key has a translation.
 */
dwvjq.i18nExists = function (key, options) {
  return i18next.exists(key, options);
};

/**
 * Translate all data-i18n tags in the current html page. If an html tag defines
 * the data-i18n attribute, its value will be used as key to find its
 * corresponding text and will replace the content of the html tag.
 */
dwvjq.i18nPage = function () {
  // get all elements
  var elements = document.getElementsByTagName('*');
  // if the element defines data-i18n, replace its content with the tranlation
  for (var i = 0; i < elements.length; ++i) {
    if (typeof elements[i].dataset.i18n !== 'undefined') {
      elements[i].innerHTML = dwv.i18n(elements[i].dataset.i18n);
    }
  }
};

/**
 * Get the current locale resource path.
 * Warning: to be used once i18next is initialised.
 *
 * @param {string} filename The file to locate.
 * @returns {string} The path to the locale resource.
 */
dwvjq.i18nGetLocalePath = function (filename) {
  var lng = i18next.language.substring(0, 2);
  return dwvjq.i18nLocalesPath +
        '/locales/' + lng + '/' + filename;
};

/**
 * Get the current locale resource path.
 * Warning: to be used once i18next is initialised.
 *
 * @param {string} filename The file to locate.
 * @returns {string} The path to the locale resource.
 */
dwvjq.i18nGetFallbackLocalePath = function (filename) {
  var lng = i18next.languages[i18next.languages.length - 1].substring(0, 2);
  return dwvjq.i18nLocalesPath +
        '/locales/' + lng + '/' + filename;
};
