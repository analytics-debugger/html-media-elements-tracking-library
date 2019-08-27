(function () {
    // Configuration Variables
    const config = Object.assign({}, {
        percentages: [10,20,30,40,50,60,70,80,90],
        tms: 'gtm',
        datalayerVariableNames: ['auto'],
        debug: false
    }, window.__htmlMediaElementsTrackingConfig);

    // We'll hold the current media elements statuses on this object
    let HTMLMediaElementStatus = {};

    // If the dataLayer Variable names is set to 'auto' let's find out the current dataLayer Avaialable in the page
    if (window.google_tag_manager && config.tms === 'gtm' && !config.dataLayer && config.datalayerVariableNames[0] === 'auto') {
        config.datalayerVariableNames = Object.entries(window.google_tag_manager).filter(e => { if (e[1].gtmDom) return e; }).map(e => e[0]);
    }

    // Helper Function to check and element visibility within the viewport
    const elementIsVisible = function (elem) {
        const bounds = elem.getBoundingClientRect();
        if (bounds.top < 0 || bounds.left < 0 || bounds.bottom > (window.innerHeight || document.documentElement.clientHeight) || bounds.right > (window.innerWidth || document.documentElement.clientWidth))
            return false;
        else
            return true;
    };

    // Function to push data to the TMS
    const pushData = (data) => {
        switch (config.tms) {
            case 'gtm':
                if (config.datalayerVariableNames) {
                    config.datalayerVariableNames.forEach(e => {
                        try {
                            if (config.debug) console.info("PUSHING DATA TO GTM dataLayer > " + e, data);
                            window[e].push(data);
                        } catch (e) { }
                    });                    
                } else {
                    if (config.debug) console.error("HTML5 Media Tracker: Defined TMS not found");
                }
                if (config.debug) {
                    console.log((data.gtm.audioStatus||data.gtm.videoStatus));
                    console.info(JSON.stringify(data.gtm,null,"\t"));    
                }
                break;
        }
    };

    // Event Handler Function
    const eventHandler = (e) => {     
        const mediaType = e.target.nodeName.toLowerCase();
        const pushModel = {
            event: ['gtm', mediaType].join('.'),
            gtm: {
                elementClasses: e.target.className,
                elementId: e["for"] || e.target.id || "",
                elementTarget: e.target,
                elementUrl: e.baseURI || document.location.href,
                [mediaType + 'Provider']: "html5",
                [mediaType + 'Status']: e.type,
                [mediaType + 'Url']: e.target.currentSrc,
                [mediaType + 'Title']: decodeURIComponent(e.target.currentSrc.split('/')[e.target.currentSrc.split('/').length - 1]),
                [mediaType + 'Duration']: Math.round(e.target.duration),
                [mediaType + 'CurrentTime']: Math.round(e.target.currentTime),
                [mediaType + 'Percent']: Math.floor(100 * e.target.currentTime / e.target.duration),
                [mediaType + 'Visible']: elementIsVisible(e.target),
                [mediaType + 'IsMuted']: e.target.muted,
                [mediaType + 'PlaybackRate']: e.target.playbackRate,
                [mediaType + 'Loop']: e.target.loop,
                [mediaType + 'Volume']: e.target.volume,
                [mediaType + 'NetworkState']: e.target.networkState
            }
        };

        // Current supported events 
        switch (e.type) {
            case 'volumechange':
                // Only track when the video is muted, either by lowering the volume to 0 or setting the muted switch
                if (pushModel.gtm[mediaType + 'IsMuted'] === true || pushModel.gtm[mediaType + 'Volume'] === 0) {
                    HTMLMediaElementStatus[e.target.id].muted = true;
                    pushModel.gtm[mediaType + 'Status'] = 'mute';
                    pushData(pushModel);
                }
                break;                           
            case 'seeked':
                // When user goes fwd, or rwd
                pushModel.gtm[mediaType + 'Status'] = 'seek';
                pushData(pushModel);
                break;

            // This event type is sent everytime the player updated it's current time, 
            // We're using for the % of the video played. 
            case 'timeupdate':         
                for (let j in HTMLMediaElementStatus[e.target.id].progress_markers) {
                    if (pushModel.gtm[mediaType + 'Percent'] >= j && j > HTMLMediaElementStatus[e.target.id].greatest_marker) {
                        HTMLMediaElementStatus[e.target.id].greatest_marker = j;
                    }
                }
                // current bucket hasn't been already sent to GA?, let's push it
                if (HTMLMediaElementStatus[e.target.id].greatest_marker && !HTMLMediaElementStatus[e.target.id].progress_markers[HTMLMediaElementStatus[e.target.id].greatest_marker]) {
                    HTMLMediaElementStatus[e.target.id].progress_markers[HTMLMediaElementStatus[e.target.id].greatest_marker] = true;
                    pushModel.gtm[mediaType + 'Status'] = 'progress';
                    pushModel.gtm[mediaType + 'Percent'] = HTMLMediaElementStatus[e.target.id].greatest_marker;
                    pushData(pushModel);
                }
                HTMLMediaElementStatus[e.target.id].currentTime = Math.round(e.target.currentTime);
                break;
            case 'play':
                // We only want to push the play event once, and report is as "start"
                if (HTMLMediaElementStatus[e.target.id].play_event === false) {
                    pushModel.gtm[mediaType + 'Status'] = 'start';
                    pushData(pushModel);
                }
                HTMLMediaElementStatus[e.target.id].play_event = true;
                break;
            case 'pause':
                // Pause shouldn't be firing before ended or seeking events
                if (pushModel.gtm[mediaType + 'Status'] !== 100 && e.target.seeking!==true && (Math.round(e.target.currentTime)!==Math.round(e.target.duration)))
                    pushData(pushModel);
                break;
            case 'ended':
                pushData(pushModel);
                break;
            case 'error':
                pushModel.gtm[mediaType + 'ErrorCode'] = e.target.error.code;
                pushModel.gtm[mediaType + 'ErrorMessage'] = e.target.error.message;
                pushData(pushModel);
                break;                
            default:
                break;
        }        
    }

    // Grab all Audio/Video Media Elements
    const HTMLMediaElements = [...document.getElementsByTagName('audio'), ...document.getElementsByTagName('video')];

    // Loop elements, fill the status info and set the listeners
    HTMLMediaElements.forEach(function (element) {
        let elementTagId;
        if (!element.getAttribute('id')) {
            // The element has no id, let's set a random one.
            elementTagId = 'html_media_element_' + Math.random().toString(36).slice(2);
            element.setAttribute('id', elementTagId);
        } else {
            elementTagId = element.getAttribute('id');
        }

        // Video Status Object declaration  
        HTMLMediaElementStatus[elementTagId] = {
            progress_markers: {},
            type: element.nodeName.toLowerCase(),
            greatest_marker: 0,
            play_event: false,
            muted: false,
            currentTime: 0
        };

        // Build up Markers
        config.percentages.forEach(e => {
            HTMLMediaElementStatus[elementTagId].progress_markers[e] = false;
        });
        
        // Add the listeners
        element.addEventListener("play", eventHandler, false);
        element.addEventListener("pause", eventHandler, false);
        element.addEventListener("ended", eventHandler, false);
        element.addEventListener("timeupdate", eventHandler, false);              
        element.addEventListener("seeked", eventHandler, false);
        element.addEventListener("volumechange", eventHandler, false);
        element.addEventListener("error", eventHandler, false);                
    });
}
)();