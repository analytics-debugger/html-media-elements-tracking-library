const _htmlMediaElementsTracker = function (customSettings) {};

_htmlMediaElementsTracker.prototype = {};
_htmlMediaElementsTracker.init = (customSettings = {}) => {
  
  const config = {
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
    progress_tracking_method: 'percentages', //thresholds
    progress_percentages: [],
    progress_thresholds: [],
    ...customSettings,
  }; 

  const logDebug = function(){
    if(config.debug){
      Function.apply.call(console.log, console, arguments);
    }    
  }; 
  
  logDebug("[ADSLU::DEBUG] - @analytics-debugger / HTML MEDIA ELEMENTS TRACKING", config);
  // If the dataLayer Variable names is set to 'auto' let's find out the current
  // dataLayer Available in the page  
  if (window.google_tag_manager && config.tms.match(/gtm|gtag/)  && !config.dataLayer && config.datalayerVariableNames[0] === 'auto') {
    config.datalayerVariableNames = Object.entries(window.google_tag_manager).filter((e) => {
      if (e[1].gtmDom) return e; return false;
    }).map((e) => e[0]);
  }

  if(config.datalayerVariableNames[0] === 'auto'){
    config.datalayerVariableNames = null;
  }
  
  // Helper Function to check and element visibility within the viewport
  const elementIsVisible = (elem) => {
    const bounds = elem.getBoundingClientRect();
    if (bounds.top < 0 || bounds.left < 0 || bounds.bottom > (window.innerHeight || document.documentElement.clientHeight) || bounds.right > (window.innerWidth || document.documentElement.clientWidth)) {
      return false;
    }
    return true;
  };  
  
  // Function to push data to the TMS
  const pushData = (data) => { 
    var prefix = config.tms === 'gtm' ? 'gtm.' : '';
    if(!config[data[`${prefix}${data.elementNodeName}Status`]]) return;
    switch (config.tms) {
      case 'gtm':
        if (config.datalayerVariableNames) {
          config.datalayerVariableNames.forEach((e) => {
            try {
              window[e].push(data);
            } catch (err) {}
          });
        } else if (config.debug) logDebug(`[ADSLU::DEBUG] - Defined TMS not found`); 
        break;
      case 'tealium': 
          if(window.utag && window.utag.link){
            window.utag.link(data);
          }else {
            logDebug(`[ADSLU::DEBUG] - Defined TMS not found`);             
          }
          logDebug(`[ADSLU::DEBUG] - TEALIUM`, data); 
        break;
      case 'debug':
        logDebug(`[ADSLU::DEBUG - HTML Element Event]`, data);
        break;
    }
  };
  // This function helps on adding the tracking to the elements.
  const processVideoElement = (element) => {
    if(element.getAttribute('data-html-media-element-tracked')) return;
    const elementTagId = Math.random().toString(36).slice(2);
    element.setAttribute('data-html-media-element-id', elementTagId);
    element.setAttribute('data-html-media-element-tracked', Math.round(new Date() * 1 / 1000));

    // Video Status Object declaration
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
    const dataset = JSON.parse(JSON.stringify(element.dataset));
    for(const attr in dataset){
        const match = attr.match(/^htmlMediaElementParam(.+)/);
        if(match){
            HTMLMediaElementStatus[elementTagId].elementData[match[1].toLowerCase()] = dataset[attr];
        }        
    }
    
    // Build up Markers
    if(config.progress_tracking_method==="percentages"){
      config.progress_percentages.forEach((e) => {
        HTMLMediaElementStatus[elementTagId].progressMarkers[e] = false;
      });  
    }

    // Add the listeners
    element.addEventListener('play', eventHandler, false);
    element.addEventListener('pause', eventHandler, false);
    element.addEventListener('ended', eventHandler, false);
    element.addEventListener('timeupdate', eventHandler, false);
    element.addEventListener('seeked', eventHandler, false);
    element.addEventListener('volumechange', eventHandler, false);
    element.addEventListener('error', eventHandler, false);
  };
  // Event Handler Function
  const eventHandler = (e) => {       
    const mediaType = e.target.nodeName.toLowerCase();
    const prefix = config.tms === 'gtm' ? 'gtm.' : '';
    const pushModel = {
      event: `${prefix}${mediaType}`,            
        [`${prefix}elementClasses`]: e.target.className || '',
        [`${prefix}elementId`]: e.for || e.target.dataset.htmlMediaElementId || '',
        [`${prefix}elementTarget`]: e.target || '',
        [`${prefix}element`]: e.srcElement || '',
        [`${prefix}elementUrl`]: e.baseURI || document.location.href,        
        [`${prefix}${mediaType}Provider`]: 'html5',
        [`${prefix}${mediaType}Status`]: e.type,
        [`${prefix}${mediaType}Url`]: e.target.currentSrc,
        [`${prefix}${mediaType}Title`]: (e.target.getAttribute('data-html-media-element-title') && config.data_elements) ? e.target.getAttribute('data-html-media-element-title') : decodeURIComponent(e.target.currentSrc.split('/')[e.target.currentSrc.split('/').length - 1]),
        [`${prefix}${mediaType}Duration`]: Math.round(e.target.duration),
        [`${prefix}${mediaType}CurrentTime`]: Math.round(e.target.currentTime),
        [`${prefix}${mediaType}ElapsedTime`]: Math.round(HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].elapsedTime / 1000),        
        [`${prefix}${mediaType}Percent`]: Math.floor((100 * e.target.currentTime) / e.target.duration),
        [`${prefix}${mediaType}Visible`]: elementIsVisible(e.target),
        [`${prefix}${mediaType}IsMuted`]: e.target.muted,
        [`${prefix}${mediaType}PlaybackRate`]: e.target.playbackRate,
        [`${prefix}${mediaType}Loop`]: e.target.loop,
        [`${prefix}${mediaType}Volume`]: e.target.volume,
        [`${prefix}${mediaType}NetworkState`]: e.target.networkState, 
        [`${prefix}${mediaType}Data`]: HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].elementData,        
        [`elementNodeName`]: e.target.nodeName ? e.target.nodeName.toLowerCase() : 'video',        
    };    

    // Current supported events
    let skipEvent = false;
    switch (e.type) {      
      case 'volumechange':
        // Only track when the video is muted, either by lowering the volume to 0 or setting the muted switch
        if (pushModel[`${prefix}${mediaType}IsMuted`] === true || pushModel[`${prefix}${mediaType}Volume`] === 0) {
          HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].muted = true;
          pushModel[`${prefix}${mediaType}Status`] = 'mute';
        } else if (HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].muted === true && pushModel[`${prefix}${mediaType}IsMuted`] === false) {          
          HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].muted = false;
          pushModel[`${prefix}${mediaType}Status`] = 'unmute';
        }
        break;
      case 'seeked':
        // When user goes fwd, or rwd
        pushModel[`${prefix}${mediaType}Status`] = 'seek';
        HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].playEvent = false;
        break;
      // This event type is sent everytime the player updated it's current time,
      // We're using for the % of the video played.
      case 'timeupdate':                 
        HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].currentTime = Math.round(e.target.currentTime);
        let ctime = new Date() * 1;
        HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].elapsedTime = HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].elapsedTime + (ctime - HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].lastUpdateTime);
        HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].lastUpdateTime = ctime;
        Object.entries(HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].progressMarkers).forEach((progressMarkers) => {
          const [k] = progressMarkers;
          if (pushModel[`${prefix}${mediaType}Percent`] >= k && k > HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].greatest_marker) {
            HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].greatest_marker = k;
          }
        });
        
        // current bucket hasn't been already sent, let's push it
        if (HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].greatest_marker && !HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].progressMarkers[HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].greatest_marker]) {
          HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].progressMarkers[HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].greatest_marker] = true;
          pushModel[`${prefix}${mediaType}Status`] = 'progress';
          pushModel[`${prefix}${mediaType}Percent`] = parseInt(HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].greatest_marker);
        }
        break;
      case 'play':        
        HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].lastUpdateTime = new Date() * 1;
        // We only want to push the play event once, and report is as "start"
        if (HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].state === "loaded") {
          HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].state = "playing";
          pushModel[`${prefix}${mediaType}Status`] = 'start';            
        }else {
          skipEvent = !0;   
        }                     
        break;
      case 'pause':
        // Pause shouldn't be firing before ended or seeking events
        HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].state = "paused";
        if (pushModel[`${prefix}${mediaType}Status`] !== 100 && e.target.seeking !== true && (Math.round(e.target.currentTime) !== Math.round(e.target.duration))) ;else {
          skipEvent = !0;
        }
        HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].playEvent = true;
        break;
      case 'ended':
        pushModel[`${prefix}${mediaType}Status`] = 'complete';
        HTMLMediaElementStatus[e.target.dataset.htmlMediaElementId].playEvent = true;
        break;
      case 'error':
        pushModel[`${prefix}${mediaType}ErrorCode`] = e.target.error.code;
        pushModel[`${prefix}${mediaType}ErrorMessage`] = e.target.error.message;
        break;
    }    
    if(!skipEvent) pushData(pushModel);    
  };
  
  const HTMLMediaElementStatus = {};
  const HTMLMediaElements = [...document.getElementsByTagName('audio'), ...document.getElementsByTagName('video')];  
  logDebug(`[ADSLU::DEBUG] - FOUND ${Object.keys(HTMLMediaElements).length} ELEMENTS`, HTMLMediaElements);
  
  // Loop elements, fill the status info and set the listeners
  HTMLMediaElements.forEach((element) => {
    processVideoElement(element);
  });  

  if(config.observe){
    logDebug(`[ADSLU::DEBUG - OBSERVER ENABLED]`);
    if (window.MutationObserver){
      var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          mutation.addedNodes.forEach(addedNode => {
            if(addedNode.tagName === "VIDEO"){
              logDebug(`[NEW VIDEO::mutation]`, addedNode);   
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

export default _htmlMediaElementsTracker;
