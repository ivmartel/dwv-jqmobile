/* global self, caches, Promise */

// https://developers.google.com/web/fundamentals/primers/service-workers/
// chrome: chrome://inspect/#service-workers

var CACHE_NAME = 'dwv-jqmobile-cache_v0.2.0';
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
    // images
    './resources/icons/dwv-16.png',
    './resources/icons/dwv-32.png',
    './resources/icons/dwv-64.png',
    './resources/icons/dwv-128.png',
    './resources/icons/dwv-256.png',
    './resources/help/double_tap.png',
    './resources/help/tap_and_hold.png',
    './resources/help/tap.png',
    './resources/help/touch_drag.png',
    './resources/help/twotouch_drag.png',
    './resources/help/twotouch_pinch.png',
    // translations
    './node_modules/dwv/locales/de/translation.json',
    './node_modules/dwv/locales/en/translation.json',
    './node_modules/dwv/locales/es/translation.json',
    './node_modules/dwv/locales/fr/translation.json',
    './node_modules/dwv/locales/it/translation.json',
    './node_modules/dwv/locales/jp/translation.json',
    './node_modules/dwv/locales/ru/translation.json',
    './node_modules/dwv/locales/zh/translation.json',
    // overlays
    './node_modules/dwv/locales/de/overlays.json',
    './node_modules/dwv/locales/en/overlays.json',
    './node_modules/dwv/locales/es/overlays.json',
    './node_modules/dwv/locales/fr/overlays.json',
    './node_modules/dwv/locales/it/overlays.json',
    './node_modules/dwv/locales/jp/overlays.json',
    './node_modules/dwv/locales/ru/overlays.json',
    './node_modules/dwv/locales/zh/overlays.json',

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
    './node_modules/i18next/i18next.min.js',
    './node_modules/i18next-xhr-backend/i18nextXHRBackend.min.js',
    './node_modules/i18next-browser-languagedetector/i18nextBrowserLanguageDetector.min.js',
    './node_modules/jszip/dist/jszip.min.js',
    './node_modules/konva/konva.min.js',
    './node_modules/magic-wand-js/js/magic-wand-min.js',
    // js: viewer
    './node_modules/jquery/dist/jquery.min.js',
    './ext/jquery-mobile/jquery.mobile-1.4.5.min.js',
    './ext/jquery-mobile/jquery.mobile-1.4.5.min.map',
    './node_modules/nprogress/nprogress.js',
    './ext/flot/jquery.flot.min.js',
    './ext/dropbox-dropins/dropins.js',
    './ext/google-api-javascript-client/client.js',
    './ext/google-api-javascript-client/api.js',
    // js: decoders
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
        caches.open(CACHE_NAME).then( function (cache) {
            return cache.addAll(urlsToCache);
        })
    );
});

// fetch
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match( event.request, {'ignoreSearch': true} ).then( function (response) {
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
    if ( uPos !== -1 ) {
        cacheRootName = cacheRootName.substr(0, uPos);
    }

    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map( function (cacheName) {
                    if ( cacheName !== CACHE_NAME && cacheName.startsWith( cacheRootName ) ) {
                        console.log('Deleting cache: '+cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
