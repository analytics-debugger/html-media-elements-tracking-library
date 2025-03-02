/*!
* 
*   @analytics-debugger/html-media-elements 1.0.0-beta
*   https://github.com/analytics-debugger/html-media-elements-tracking-library
*
*   Copyright (c) Analytics Debugger S.L.U. (https://www.analytics-debugger.com)
*   Author: David Vallejo (https://www.thyngster.com)
*   This source code is licensed under the MIT license found in the
*   LICENSE file in the root directory of this source tree.
*
*/

var _mediaElementsTracker = (function () {
    'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol, Iterator */


    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    var HtmlMediaElementsTracker = /** @class */function () {
      function HtmlMediaElementsTracker() {
        this.config = {
          start: false,
          play: false,
          pause: false,
          mute: false,
          unmute: false,
          complete: false,
          seek: false,
          progress: false,
          ratechange: false,
          debug: false,
          observe: false,
          data_elements: false,
          progress_tracking_method: 'percentages',
          progress_percentages: [],
          progress_thresholds: []
        };
        this.HTMLMediaElementStatus = {};
      }
      /**
       * Initialize the HTML Media Elements Tracker
       * @param customSettings - Custom configuration settings
       */
      HtmlMediaElementsTracker.prototype.init = function (customSettings) {
        var _this = this;
        if (customSettings === void 0) {
          customSettings = {};
        }
        // Merge custom settings with defaults
        this.config = __assign(__assign({}, this.config), customSettings);
        this.logDebug("[DTA::DEBUG] - @analytics-debugger / HTML MEDIA ELEMENTS TRACKER", this.config);
        // Find all HTML audio and video elements on the page
        var HTMLMediaElements = __spreadArray(__spreadArray([], Array.from(document.getElementsByTagName('audio')), true), Array.from(document.getElementsByTagName('video')), true);
        this.logDebug("[DTA::DEBUG] - FOUND ".concat(HTMLMediaElements.length, " ELEMENTS"), HTMLMediaElements);
        // Process each media element
        HTMLMediaElements.forEach(function (element) {
          _this.processVideoElement(element);
        });
        // Set up mutation observer if observing is enabled
        if (this.config.observe) {
          this.logDebug("[DTA::DEBUG - OBSERVER ENABLED]");
          // Check for MutationObserver support
          var MutationObserver_1 = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
          if (MutationObserver_1) {
            var observer = new MutationObserver_1(function (mutations) {
              mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (addedNode) {
                  if (addedNode instanceof HTMLElement && addedNode.tagName === "VIDEO") {
                    _this.logDebug("[NEW VIDEO::mutation]", addedNode);
                    _this.processVideoElement(addedNode);
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
      /**
       * Log debug information if debug mode is enabled
       */
      HtmlMediaElementsTracker.prototype.logDebug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        if (this.config.debug) {
          console.log.apply(console, args);
        }
      };
      /**
       * Check if an element is visible within the viewport
       * @param elem - Element to check for visibility
       */
      HtmlMediaElementsTracker.prototype.elementIsVisible = function (elem) {
        var bounds = elem.getBoundingClientRect();
        return !(bounds.top < 0 || bounds.left < 0 || bounds.bottom > (window.innerHeight || document.documentElement.clientHeight) || bounds.right > (window.innerWidth || document.documentElement.clientWidth));
      };
      /**
       * Push data to the tag management system
       * @param data - Data to push to the TMS
       */
      HtmlMediaElementsTracker.prototype.pushData = function (data) {
        console.log("DAVID", data);
      };
      /**
       * Process a video or audio element for tracking
       * @param element - The HTML media element to process
       */
      HtmlMediaElementsTracker.prototype.processVideoElement = function (element) {
        var _this = this;
        if (element.getAttribute('data-html-media-element-tracked')) return;
        var elementTagId = Math.random().toString(36).slice(2);
        element.setAttribute('data-html-media-element-id', elementTagId);
        element.setAttribute('data-html-media-element-tracked', String(Math.round(Date.now() / 1000)));
        // Video Status Object declaration
        this.HTMLMediaElementStatus[elementTagId] = {
          progressMarkers: {},
          type: element.nodeName.toLowerCase(),
          greatest_marker: 0,
          playEvent: false,
          muted: false,
          currentTime: 0,
          state: 'loaded',
          elapsedTime: 0,
          lastUpdateTime: Date.now(),
          elementData: {}
        };
        // Get custom data attributes
        var dataset = JSON.parse(JSON.stringify(element.dataset));
        for (var attr in dataset) {
          var match = attr.match(/^htmlMediaElementParam(.+)/);
          if (match) {
            this.HTMLMediaElementStatus[elementTagId].elementData[match[1].toLowerCase()] = dataset[attr];
          }
        }
        // Build up Markers
        if (this.config.progress_tracking_method === "percentages") {
          this.config.progress_percentages.forEach(function (e) {
            _this.HTMLMediaElementStatus[elementTagId].progressMarkers[e] = false;
          });
        }
        // Add the listeners - bind this to maintain context
        element.addEventListener('play', this.eventHandler.bind(this), false);
        element.addEventListener('pause', this.eventHandler.bind(this), false);
        element.addEventListener('ended', this.eventHandler.bind(this), false);
        element.addEventListener('timeupdate', this.eventHandler.bind(this), false);
        element.addEventListener('seeked', this.eventHandler.bind(this), false);
        element.addEventListener('volumechange', this.eventHandler.bind(this), false);
        element.addEventListener('error', this.eventHandler.bind(this), false);
      };
      /**
       * Event handler for media element events
       * @param e - The event object
       */
      HtmlMediaElementsTracker.prototype.eventHandler = function (e) {
        var _this = this;
        var target = e.target;
        if (!target || !target.dataset || !target.dataset.htmlMediaElementId) return;
        var elementId = target.dataset.htmlMediaElementId;
        var mediaType = "DTA:" + target.nodeName.toLowerCase();
        var pushModel = {
          event: "".concat(mediaType, ".").concat(e.type),
          element: {
            classes: target.className || '',
            id: e.for || target.dataset.htmlMediaElementId || '',
            target: target || '',
            element: e.srcElement || '',
            url: e.baseURI || document.location.href
          },
          media: {
            type: 'mediaType',
            provider: 'html5',
            url: target.currentSrc,
            title: target.getAttribute('data-html-media-element-title') && this.config.data_elements ? target.getAttribute('data-html-media-element-title') : decodeURIComponent(target.currentSrc.split('/')[target.currentSrc.split('/').length - 1]),
            duration: Math.round(target.duration),
            currentTime: Math.round(target.currentTime),
            elapsedTime: Math.round(this.HTMLMediaElementStatus[elementId].elapsedTime / 1000),
            percent: Math.floor(100 * target.currentTime / target.duration),
            visible: this.elementIsVisible(target),
            isMuted: target.muted,
            playbackRate: target.playbackRate,
            loop: target.loop,
            volume: target.volume,
            networkState: target.networkState,
            data: this.HTMLMediaElementStatus[elementId].elementData
          }
        };
        console.log(e.type);
        switch (e.type) {
          case 'volumechange':
            // Only track when the video is muted, either by lowering the volume to 0 or setting the muted switch
            if (pushModel.isMuted === true || pushModel.volume === 0) {
              this.HTMLMediaElementStatus[elementId].muted = true;
              pushModel.event = "".concat(mediaType, ".mute");
              pushModel.status = 'mute';
            } else if (this.HTMLMediaElementStatus[elementId].muted === true && pushModel.isMuted === false) {
              this.HTMLMediaElementStatus[elementId].muted = false;
              pushModel.event = "".concat(mediaType, ".unmute");
              pushModel.status = 'unmute';
            }
            break;
          case 'seeked':
            // When user goes fwd, or rwd
            pushModel.status = 'seek';
            pushModel.event = "".concat(mediaType, ".seek");
            this.HTMLMediaElementStatus[elementId].playEvent = false;
            break;
          case 'timeupdate':
            this.HTMLMediaElementStatus[elementId].currentTime = Math.round(target.currentTime);
            var ctime = Date.now();
            this.HTMLMediaElementStatus[elementId].elapsedTime = this.HTMLMediaElementStatus[elementId].elapsedTime + (ctime - this.HTMLMediaElementStatus[elementId].lastUpdateTime);
            this.HTMLMediaElementStatus[elementId].lastUpdateTime = ctime;
            Object.entries(this.HTMLMediaElementStatus[elementId].progressMarkers).forEach(function (progressMarkers) {
              var k = progressMarkers[0];
              var key = parseInt(k);
              if (pushModel.percent >= key && key > _this.HTMLMediaElementStatus[elementId].greatest_marker) {
                _this.HTMLMediaElementStatus[elementId].greatest_marker = key;
              }
            });
            // current bucket hasn't been already sent, let's push it
            if (this.HTMLMediaElementStatus[elementId].greatest_marker && !this.HTMLMediaElementStatus[elementId].progressMarkers[this.HTMLMediaElementStatus[elementId].greatest_marker]) {
              console.log("ASDASDASD: TIMEUPDATE", pushModel);
              this.HTMLMediaElementStatus[elementId].progressMarkers[this.HTMLMediaElementStatus[elementId].greatest_marker] = true;
              pushModel.status = 'progress';
              pushModel.event = "".concat(mediaType, ".progress");
              pushModel.percent = this.HTMLMediaElementStatus[elementId].greatest_marker;
            }
            break;
          case 'play':
            this.HTMLMediaElementStatus[elementId].lastUpdateTime = Date.now();
            // We only want to push the play event once, and report is as "start"
            if (this.HTMLMediaElementStatus[elementId].state === "loaded") {
              this.HTMLMediaElementStatus[elementId].state = "playing";
              pushModel.event = "".concat(mediaType, ".start");
              pushModel.status = 'start';
            }
            break;
          case 'pause':
            // Pause shouldn't be firing before ended or seeking events
            this.HTMLMediaElementStatus[elementId].state = "paused";
            if (pushModel.status !== 100 && target.seeking !== true && Math.round(target.currentTime) !== Math.round(target.duration)) ;
            this.HTMLMediaElementStatus[elementId].playEvent = true;
            break;
          case 'ended':
            pushModel.status = 'complete';
            pushModel.event = "".concat(mediaType, ".complete");
            this.HTMLMediaElementStatus[elementId].playEvent = true;
            break;
          case 'error':
            if (target.error) {
              pushModel.event = "".concat(mediaType, ".error");
              pushModel.errorCode = target.error.code;
              pushModel.errorMessage = target.error.message;
            }
            break;
        }
        this.pushData(pushModel);
        /*  if (!skipEvent) this.pushData(pushModel); */
      };
      return HtmlMediaElementsTracker;
    }();
    // Create a singleton instance
    var htmlMediaElementsTracker = new HtmlMediaElementsTracker();

    return htmlMediaElementsTracker;

})();
