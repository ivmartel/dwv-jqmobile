/**
 * Google related utils.
 * Depends upon:
 * - https://apis.google.com/js/api.js: auth and picker
 * - https://apis.google.com/js/client.js: drive and request
 */
var dwvjq = dwvjq || {};
dwvjq.gui = dwvjq.gui || {};
/** @namespace */
dwvjq.google = dwvjq.google || {};
// external
var gapi = gapi || {};
var google = google || {};

/**
 * Google Authentification class.
 * Allows to authentificate to google services.
 */
dwvjq.google.Auth = function () {
  // closure to self
  var self = this;
  // immediate mode: behind the scenes token refresh
  var immediate = false;

  // The Client ID obtained from the Google Developers Console.
  // Replace with your own Client ID.
  this.clientId =
    '544445548355-7pli7rbg578hslnngnkj7ledcg6g5ejo.apps.googleusercontent.com';
  // The scope to use to access user's Drive items.
  this.scope = ['https://www.googleapis.com/auth/drive.file'];

  /**
   * Load the API and authentify.
   */
  this.load = function () {
    immediate = false;
    gapi.load('auth', {callback: onApiLoad});
  };

  /**
   * Load the API and authentify silently.
   */
  this.loadSilent = function () {
    immediate = true;
    gapi.load('auth', {callback: onApiLoad});
  };

  /**
   * Called if the authentification is successful.
   * Default does nothing. No input parameters.
   */
  this.onload = function () {};

  /**
   * Callback to be overloaded.
   * Default does nothing. No input parameters.
   */
  this.onfail = function () {};

  /**
   * Authentificate.
   */
  function onApiLoad() {
    // see https://developers.google.com/api-client-library/...
    //   ...javascript/reference/referencedocs#gapiauthauthorizeparams
    gapi.auth.authorize(
      {
        client_id: self.clientId,
        scope: self.scope,
        immediate: immediate
      },
      handleResult
    );
  }

  /**
   * Launch callback if all good.
   * @param {Object} authResult An OAuth 2.0 Token Object.
   * See https://developers.google.com/api-client-library/...
   *   ...javascript/reference/referencedocs#OAuth20TokenObject
   */
  function handleResult(authResult) {
    if (authResult && !authResult.error) {
      self.onload();
    } else {
      self.onfail();
    }
  }
};

/**
 * Google Picker class.
 * Allows to create a picker and handle its result.
 */
dwvjq.google.Picker = function () {
  // closure to self
  var self = this;

  /**
   * Load API and create picker.
   */
  this.load = function () {
    gapi.load('picker', {callback: onApiLoad});
  };

  /**
   * Called after user picked files.
   * @param {Array} ids The list of picked files ids.
   */
  this.onload = null;

  /**
   * Create the picker.
   */
  function onApiLoad() {
    var view = new google.picker.View(google.picker.ViewId.DOCS);
    view.setMimeTypes('application/dicom');
    // see https://developers.google.com/picker/docs/reference#PickerBuilder
    var picker = new google.picker.PickerBuilder()
      .enableFeature(google.picker.Feature.NAV_HIDDEN)
      .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
      .setOAuthToken(gapi.auth.getToken().access_token)
      .addView(view)
      .setCallback(handleResult)
      .build();
    picker.setVisible(true);
  }

  /**
   * Launch callback if all good.
   * @param {Object} data The data returned by the picker.
   * See https://developers.google.com/picker/docs/results
   */
  function handleResult(data) {
    if (data.action === google.picker.Action.PICKED && data.docs.length !== 0) {
      var ids = [];
      for (var i = 0; i < data.docs.length; ++i) {
        ids[ids.length] = data.docs[i].id;
      }
      self.onload(ids);
    }
  }
};

/**
 * Google Drive class.
 * Allows to request google drive for file download links from a list
 * of file ids.
 */
dwvjq.google.Drive = function () {
  // closure to self
  var self = this;
  // list of ids
  var idList = null;

  // The Browser API key obtained from the Google Developers Console.
  this.apiKey = 'AIzaSyA5YAedAwoQsBZ-TzVEEVkv2ezD5hqe4s0';

  /**
   * Set the ids to ask for download link.
   * @param {Array} ids The list of file ids to ask for download link.
   */
  this.setIds = function (ids) {
    idList = ids;
  };

  /**
   * Get the ids to ask for download link.
   */
  this.getIds = function () {
    return idList;
  };

  /**
   * Load API and query drive for download links.
   * @param {Array} ids The list of file ids to ask for download link.
   */
  this.loadIds = function (ids) {
    self.setIds(ids);
    self.load();
  };

  /**
   * Load API and query drive for download links.
   * The ids to ask for have been provided via the setIds.
   */
  this.load = function () {
    // set the api key
    gapi.client.setApiKey(self.apiKey);

    var func = createApiLoad(self.getIds());
    gapi.client.load('drive', 'v3', func);
  };

  /**
   * Called after drive response with the file urls.
   * @param {Array} urls The list of files urls corresponding to the input ids.
   */
  this.onload = null;

  /**
   * Create an API load handler.
   * @param {Array} ids The list of file ids to ask for download link.
   */
  function createApiLoad(ids) {
    var f = function () {
      onApiLoad(ids);
    };
    return f;
  }

  /**
   * Run the drive request.
   * @param {Array} ids The list of file ids to ask for download link.
   */
  function onApiLoad(ids) {
    // group requests in batch (ans stay bellow quotas)
    var batch = gapi.client.newBatch();

    for (var i = 0; i < ids.length; ++i) {
      // Can't make it work, HTTPRequest sends CORS error...
      // see https://developers.google.com/drive/v3/reference/files/get
      //var request = gapi.client.drive.files.get({
      //    'fileId': fileId, 'fields': 'webViewLink'
      //});

      // File path with v2??
      // see https://developers.google.com/api-client-library/...
      //   ...javascript/reference/referencedocs#gapiclientrequestargs
      var request = gapi.client.request({
        path: 'drive/v2/files/' + ids[i],
        method: 'GET'
      });

      // add to batch
      batch.add(request);
    }

    // execute the batch
    batch.execute(handleDriveLoad);
  }

  /**
   * Launch callback when all queries have returned.
   * @param {Object} resp The batch request response.
   * See https://developers.google.com/api-client-library/...
   *   ...javascript/reference/referencedocs#gapiclientRequestexecute
   */
  function handleDriveLoad(resp) {
    // link list
    var urls = [];
    // ID-response map of each requests response
    var respKeys = Object.keys(resp);
    var url;
    // if the download url uses the google content root,
    // replace it with the api root... (see #32)
    var contentRoot = 'https://content.googleapis.com';
    var apiRoot = 'https://www.googleapis.com';
    for (var i = 0; i < respKeys.length; ++i) {
      url = resp[respKeys[i]].result.downloadUrl;
      if (url.substr(0, contentRoot.length) === contentRoot) {
        url = apiRoot + url.substr(contentRoot.length, url.length);
      }
      urls[urls.length] = url;
    }
    // call onload
    self.onload(urls);
  }
};

/**
 * Append authorized header to the input callback arguments.
 * @param {Function} callback The callback to append headers to.
 */
dwvjq.google.getAuthorizedCallback = function (callback) {
  return function (urls) {
    //see https://developers.google.com/api-client-library/javascript/features/cors
    callback(urls, {
      requestHeaders: [
        {
          name: 'Authorization',
          value: 'Bearer ' + gapi.auth.getToken().access_token
        },
        {
          name: 'Accept',
          value: 'application/dicom'
        }
      ]
    });
  };
};

/**
 * GoogleDriveLoad gui.
 * @constructor
 */
dwvjq.gui.GoogleDriveLoad = function (app) {
  /**
   * Setup the gdrive load HTML to the page.
   */
  this.setup = function () {
    // behind the scenes authentification to avoid popup blocker
    var gAuth = new dwvjq.google.Auth();
    gAuth.loadSilent();

    // associated div
    var gdriveLoadDiv = document.createElement('div');
    gdriveLoadDiv.className = 'gdrivediv';
    gdriveLoadDiv.style.display = 'none';

    // node
    var node = document.getElementById('dwv-loaderlist');
    // append
    node.appendChild(gdriveLoadDiv);
    // refresh
    dwvjq.gui.refreshElement(node);
  };

  /**
   * Display the file load HTML.
   * @param {Boolean} bool True to display, false to hide.
   */
  this.display = function (bool) {
    // gdrive div element
    var node = document.getElementById('dwv-loaderlist');
    var filediv = node.getElementsByClassName('gdrivediv')[0];
    filediv.style.display = bool ? '' : 'none';

    if (bool) {
      // jquery mobile dependent
      $('#popupOpen').popup('close');
      //app.resetLoadbox();

      var gAuth = new dwvjq.google.Auth();
      var gPicker = new dwvjq.google.Picker();
      var gDrive = new dwvjq.google.Drive();
      // pipeline
      gAuth.onload = gPicker.load;
      gPicker.onload = gDrive.loadIds;
      gDrive.onload = dwvjq.google.getAuthorizedCallback(app.loadURLs);
      // launch
      gAuth.load();
    }
  };
};
