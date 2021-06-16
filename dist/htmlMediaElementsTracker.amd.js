/*!
* 
*   @analytics-debugger/html-media-elements 0.0.1
*   https://github.com/analytics-debugger/html-media-elements-tracking-library
*
*   Copyright (c) David Vallejo (https://www.thyngster.com).
*   This source code is licensed under the MIT license found in the
*   LICENSE file in the root directory of this source tree.
*
*/

define(function () { 'use strict';

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);

      if (enumerableOnly) {
        symbols = symbols.filter(function (sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
      }

      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var _htmlMediaElementsTracker = function _htmlMediaElementsTracker(customSettings) {};

  _htmlMediaElementsTracker.prototype = {};

  _htmlMediaElementsTracker.init = function () {
    var customSettings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var config = _objectSpread2({
      tms: 'debug',
      datalayerVariableNames: ['auto'],
      debug: false,
      observe: false,
      data_elements: false,
      start: false,
      play: false,
      pause: false,
      mute: false,
      unmute: false,
      complete: false,
      seek: false,
      progress: false,
      progress_tracking_method: 'percentages',
      //thresholds
      progress_percentages: [],
      progress_thresholds: []
    }, customSettings);

    var logDebug = function logDebug() {
      if (config.debug) {
        Function.apply.call(console.log, console, arguments);
      }
    };

    logDebug("[ADSLU::DEBUG] - @thyngster / HTML MEDIA ELEMENTS TRACKING", config); // If the dataLayer Variable names is set to 'auto' let's find out the current
    // dataLayer Available in the page  

    if (window.google_tag_manager && config.tms.match(/gtm|gtag/) && !config.dataLayer && config.datalayerVariableNames[0] === 'auto') {
      config.datalayerVariableNames = Object.entries(window.google_tag_manager).filter(function (e) {
        if (e[1].gtmDom) return e;
        return false;
      }).map(function (e) {
        return e[0];
      });
    }

    if (config.datalayerVariableNames[0] === 'auto') {
      config.datalayerVariableNames = null;
    } // Helper Function to check and element visibility within the viewport


    var elementIsVisible = function elementIsVisible(elem) {
      var bounds = elem.getBoundingClientRect();

      if (bounds.top < 0 || bounds.left < 0 || bounds.bottom > (window.innerHeight || document.documentElement.clientHeight) || bounds.right > (window.innerWidth || document.documentElement.clientWidth)) {
        return false;
      }

      return true;
    }; // Function to push data to the TMS


    var pushData = function pushData(data) {
      var prefix = config.tms === 'gtm' ? 'gtm.' : '';
      if (!config[data["".concat(prefix).concat(data.elementNodeName, "Status")]]) return;

      switch (config.tms) {
        case 'gtm':
          if (config.datalayerVariableNames) {
            config.datalayerVariableNames.forEach(function (e) {
              try {
                window[e].push(data);
              } catch (err) {}
            });
          } else if (config.debug) logDebug("[ADSLU::DEBUG] - Defined TMS not found");

          break;

        case 'tealium':
          if (window.utag && window.utag.link) {
            window.utag.link(data);
          } else {
            logDebug("[ADSLU::DEBUG] - Defined TMS not found");
          }

          logDebug("[ADSLU::DEBUG] - TEALIUM", data);
          break;

        case 'debug':
          logDebug("[ADSLU::DEBUG - HTML Element Event]", data);
          break;
      }
    };

    var processVideoElement = function processVideoElement(element) {
      if (element.getAttribute('data-html-media-element-tracked')) return;
      var elementTagId = Math.random().toString(36).slice(2);
      element.setAttribute('data-html-media-element-id', elementTagId);
      element.setAttribute('data-html-media-element-tracked', Math.round(new Date() * 1 / 1000)); // Video Status Object declaration

      HTMLMediaElementStatus[elementTagId] = {
        progressMarkers: {},
        type: element.nodeName.toLowerCase(),
        greatest_marker: 0,
        playEvent: false,
        muted: false,
        currentTime: 0,
        state: 'loaded',
        elapsedTime: 0,
        lastUpdateTime: new Date() * 1,
        elementData: {}
      };
      var dataset = JSON.parse(JSON.stringify(element.dataset));

      for (var attr in dataset) {
        var match = attr.match(/^htmlMediaElementParam(.+)/);

        if (match) {
          HTMLMediaElementStatus[elementTagId].elementData[match[1].toLowerCase()] = dataset[attr];
        }
      } // Build up Markers


      if (config.progress_tracking_method === "percentages") {
        config.progress_percentages.forEach(function (e) {
          HTMLMediaElementStatus[elementTagId].progressMarkers[e] = false;
        });
      } // Add the listeners


      element.addEventListener('play', eventHandler, false);
      element.addEventListener('pause', eventHandler, false);
      element.addEventListener('ended', eventHandler, false);
      element.addEventListener('timeupdate', eventHandler, false);
      element.addEventListener('seeked', eventHandler, false);
      element.addEventListener('volumechange', eventHandler, false);
      element.addEventListener('error', eventHandler, false);
    }; // Event Handler Function


    var eventHandler = function eventHandler(e) {
      var _pushModel;

      var mediaType = e.target.nodeName.toLowerCase();
      var prefix = config.tms === 'gtm' ? 'gtm.' : '';
      var pushModel = (_pushModel = {
        event: "".concat(prefix).concat(mediaType)
      }, _defineProperty(_pushModel, "".concat(prefix, "elementClasses"), e.target.className || ''), _defineProperty(_pushModel, "".concat(prefix, "elementId"), e["for"] || e.target.dataset.htmlMediaElementId || ''), _defineProperty(_pushModel, "".concat(prefix, "elementTarget"), e.target || ''), _defineProperty(_pushModel, "".concat(prefix, "element"), e.srcElement || ''), _defineProperty(_pushModel, "".concat(prefix, "elementUrl"), e.baseURI || document.location.href), _defineProperty(_pushModel, "".concat(prefix).concat(mediaType, "Provider"), 'html5'), _defineProperty(_pushModel, "".concat(prefix).concat(mediaType, "Status"), e.type), _defineProperty(_pushModel, "".concat(prefix).concat(mediaType, "Url"), e.target.currentSrc), _defineProperty(_pushModel, "".concat(prefix).concat(mediaType, "Title"), e.target.getAttribute('data-html-media-element-title') && config.data_elements ? e.target.getAttribute('data-html-media-element-title') : decodeURIComponent(e.target.currentSrc.split('/')[e.target.currentSrc.split('/').length - 1])), _defineProperty(_pushModel, "".concat(prefix).concat(mediaType, "Duration"), Math.round(e.target.duration)), _defineProperty(_pushModel, "".concat(prefix).concat(mediaType, "CurrentTime"), Math.round(e.target.currentTime)), _defineProperty(_pushModel, "".concat(prefix).concat(mediaType, "ElapsedTime"), Math.round(HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].elapsedTime / 1000)), _defineProperty(_pushModel, "".concat(prefix).concat(mediaType, "Percent"), Math.floor(100 * e.target.currentTime / e.target.duration)), _defineProperty(_pushModel, "".concat(prefix).concat(mediaType, "Visible"), elementIsVisible(e.target)), _defineProperty(_pushModel, "".concat(prefix).concat(mediaType, "IsMuted"), e.target.muted), _defineProperty(_pushModel, "".concat(prefix).concat(mediaType, "PlaybackRate"), e.target.playbackRate), _defineProperty(_pushModel, "".concat(prefix).concat(mediaType, "Loop"), e.target.loop), _defineProperty(_pushModel, "".concat(prefix).concat(mediaType, "Volume"), e.target.volume), _defineProperty(_pushModel, "".concat(prefix).concat(mediaType, "NetworkState"), e.target.networkState), _defineProperty(_pushModel, "".concat(prefix).concat(mediaType, "Data"), HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].elementData), _defineProperty(_pushModel, "elementNodeName", e.target.nodeName ? e.target.nodeName.toLowerCase() : 'video'), _pushModel); // Current supported events

      var skipEvent = false;

      switch (e.type) {
        case 'volumechange':
          // Only track when the video is muted, either by lowering the volume to 0 or setting the muted switch
          if (pushModel["".concat(prefix).concat(mediaType, "IsMuted")] === true || pushModel["".concat(prefix).concat(mediaType, "Volume")] === 0) {
            HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].muted = true;
            pushModel["".concat(prefix).concat(mediaType, "Status")] = 'mute';
          } else if (HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].muted === true && pushModel["".concat(prefix).concat(mediaType, "IsMuted")] === false) {
            HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].muted = false;
            pushModel["".concat(prefix).concat(mediaType, "Status")] = 'unmute';
          }

          break;

        case 'seeked':
          // When user goes fwd, or rwd
          pushModel["".concat(prefix).concat(mediaType, "Status")] = 'seek';
          HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].playEvent = false;
          break;
        // This event type is sent everytime the player updated it's current time,
        // We're using for the % of the video played.

        case 'timeupdate':
          HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].currentTime = Math.round(e.target.currentTime);
          var ctime = new Date() * 1;
          HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].elapsedTime = HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].elapsedTime + (ctime - HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].lastUpdateTime);
          HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].lastUpdateTime = ctime;
          Object.entries(HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].progressMarkers).forEach(function (progressMarkers) {
            var _progressMarkers = _slicedToArray(progressMarkers, 1),
                k = _progressMarkers[0];

            if (pushModel["".concat(prefix).concat(mediaType, "Percent")] >= k && k > HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].greatest_marker) {
              HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].greatest_marker = k;
            }
          }); // current bucket hasn't been already sent to GA?, let's push it

          if (HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].greatest_marker && !HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].progressMarkers[HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].greatest_marker]) {
            HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].progressMarkers[HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].greatest_marker] = true;
            pushModel["".concat(prefix).concat(mediaType, "Status")] = 'progress';
            pushModel["".concat(prefix).concat(mediaType, "Percent")] = parseInt(HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].greatest_marker);
          }

          break;

        case 'play':
          HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].lastUpdateTime = new Date() * 1; // We only want to push the play event once, and report is as "start"

          if (HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].state === "loaded") {
            HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].state = "playing";
            pushModel["".concat(prefix).concat(mediaType, "Status")] = 'start';
          } else {
            skipEvent = !0;
          }

          break;

        case 'pause':
          // Pause shouldn't be firing before ended or seeking events
          HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].state = "paused";

          if (pushModel["".concat(prefix).concat(mediaType, "Status")] !== 100 && e.target.seeking !== true && Math.round(e.target.currentTime) !== Math.round(e.target.duration)) ; else {
            skipEvent = !0;
          }

          HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].playEvent = true;
          break;

        case 'ended':
          pushModel["".concat(prefix).concat(mediaType, "Status")] = 'complete';
          HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].playEvent = true;
          break;

        case 'error':
          pushModel["".concat(prefix).concat(mediaType, "ErrorCode")] = e.target.error.code;
          pushModel["".concat(prefix).concat(mediaType, "ErrorMessage")] = e.target.error.message;
          break;
      }

      if (!skipEvent) pushData(pushModel);
    };

    var HTMLMediaElementStatus = {};
    var HTMLMediaElements = [].concat(_toConsumableArray(document.getElementsByTagName('audio')), _toConsumableArray(document.getElementsByTagName('video')));
    logDebug("[ADSLU::DEBUG] - FOUND ".concat(Object.keys(HTMLMediaElements).length, " ELEMENTS"), HTMLMediaElements); // Loop elements, fill the status info and set the listeners

    HTMLMediaElements.forEach(function (element) {
      processVideoElement(element);
    });

    if (config.observe) {
      logDebug("[ADSLU::DEBUG - OBSERVER ENABLED]");

      if (window.MutationObserver) {
        var observer = new MutationObserver(function (mutations) {
          mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (addedNode) {
              if (addedNode.tagName === "VIDEO") {
                logDebug("[NEW VIDEO::mutation]", addedNode);
                processVideoElement(addedNode);
              }
            });
          });
        });
        observer.observe(document.body, {
          attributes: true,
          childList: true,
          subtree: true,
          characterData: true
        });
      }
    }
  };

  return _htmlMediaElementsTracker;

});
