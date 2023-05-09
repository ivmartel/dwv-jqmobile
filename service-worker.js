// https://developers.google.com/web/fundamentals/primers/service-workers/
// chrome: chrome://inspect/#service-workers

var CACHE_NAME = 'dwv-jqmobile-cache_v0.8.0-beta';
var urlsToCache = [
  './',
  './index.html',
  // css
  './css/style.css',
  // js
  './src/applauncher.js',
  './src/appgui.js',
  './src/dropbox.js',
  './src/google.js',
  './src/register-sw.js',
  './src/gui/custom.js',
  './src/gui/dropboxLoader.js',
  './src/gui/filter.js',
  './src/gui/generic.js',
  './src/gui/help.js',
  './src/gui/html.js',
  './src/gui/infoController.js',
  './src/gui/infoOverlay.js',
  './src/gui/loader.js',
  './src/gui/tools.js',
  './src/gui/undo.js',
  './src/utils/browser.js',
  './src/utils/modernizr.js',
  // images
  './resources/icons/icon-16.png',
  './resources/icons/icon-32.png',
  './resources/icons/icon-64.png',
  './resources/icons/icon-128.png',
  './resources/icons/icon-256.png',
  './resources/help/double_tap.png',
  './resources/help/tap_and_hold.png',
  './resources/help/tap.png',
  './resources/help/touch_drag.png',
  './resources/help/twotouch_drag.png',
  './resources/help/twotouch_pinch.png',
  // translations
  './resources/locales/de/translation.json',
  './resources/locales/en/translation.json',
  './resources/locales/es/translation.json',
  './resources/locales/fr/translation.json',
  './resources/locales/it/translation.json',
  './resources/locales/jp/translation.json',
  './resources/locales/ru/translation.json',
  './resources/locales/zh/translation.json',
  // overlays
  './resources/locales/de/overlays.json',
  './resources/locales/en/overlays.json',
  './resources/locales/es/overlays.json',
  './resources/locales/fr/overlays.json',
  './resources/locales/it/overlays.json',
  './resources/locales/jp/overlays.json',
  './resources/locales/ru/overlays.json',
  './resources/locales/zh/overlays.json',

  // third party

  // css
  './ext/jquery-mobile/jquery.mobile-1.4.5.min.css',
  './ext/jquery-mobile/images/ajax-loader.gif',
  './ext/jquery-mobile/images/icons-svg/plus-white.svg',
  './ext/jquery-mobile/images/icons-svg/forward-white.svg',
  './ext/jquery-mobile/images/icons-svg/back-white.svg',
  './ext/jquery-mobile/images/icons-svg/info-white.svg',
  './ext/jquery-mobile/images/icons-svg/grid-black.svg',
  './ext/jquery-mobile/images/icons-png/plus-white.png',
  './ext/jquery-mobile/images/icons-png/forward-white.png',
  './ext/jquery-mobile/images/icons-png/back-white.png',
  './ext/jquery-mobile/images/icons-png/info-white.png',
  './ext/jquery-mobile/images/icons-png/grid-black.png',
  // js: dwv
  './node_modules/dwv/dist/dwv.min.js',
  './node_modules/jszip/dist/jszip.min.js',
  './node_modules/konva/konva.min.js',
  './node_modules/magic-wand-tool/dist/magic-wand.min.js',
  // js: viewer
  './node_modules/jquery/dist/jquery.min.js',
  './ext/jquery-mobile/jquery.mobile-1.4.5.min.js',
  './ext/jquery-mobile/jquery.mobile-1.4.5.min.map',
  './node_modules/nprogress/nprogress.js',
  './ext/flot/jquery.flot.min.js',
  './node_modules/i18next/i18next.min.js',
  './node_modules/i18next-http-backend/i18nextHttpBackend.min.js',
  './node_modules/i18next-browser-languagedetector/' +
    'i18nextBrowserLanguageDetector.min.js',
  './ext/dropbox-dropins/dropins.js',
  './ext/google-api-javascript-client/client.js',
  './ext/google-api-javascript-client/api.js',
  // js: decoders
  './node_modules/dwv/decoders/dwv/rle.js',
  './node_modules/dwv/decoders/dwv/decode-rle.js',
  './node_modules/dwv/decoders/pdfjs/jpx.js',
  './node_modules/dwv/decoders/pdfjs/arithmetic_decoder.js',
  './node_modules/dwv/decoders/pdfjs/decode-jpeg2000.js',
  './node_modules/dwv/decoders/pdfjs/util.js',
  './node_modules/dwv/decoders/pdfjs/jpg.js',
  './node_modules/dwv/decoders/pdfjs/decode-jpegbaseline.js',
  './node_modules/dwv/decoders/rii-mango/lossless-min.js',
  './node_modules/dwv/decoders/rii-mango/decode-jpegloss.js'
];

// install
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

// fetch
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches
      .match(event.request, {ignoreSearch: true})
      .then(function (response) {
        // cache hit: return response
        if (response) {
          return response;
        }
        // fetch on network
        return fetch(event.request);
      })
  );
});

// activate
self.addEventListener('activate', function (event) {
  // delete caches which name starts with the same root as this one
  var cacheRootName = CACHE_NAME;
  var uPos = cacheRootName.lastIndexOf('_');
  if (uPos !== -1) {
    cacheRootName = cacheRootName.substr(0, uPos);
  }

  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME && cacheName.startsWith(cacheRootName)) {
            console.log('Deleting cache: ' + cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
