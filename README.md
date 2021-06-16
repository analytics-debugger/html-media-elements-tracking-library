
# HTML Media Elements Tracking Library


[![](https://data.jsdelivr.com/v1/package/npm/@analytics-debugger/html-media-elements/badge)](https://www.jsdelivr.com/package/npm/@analytics-debugger/html-media-elements)


Hi! This a **JavaScript** library to help tracking HTML Media Elements ( video/audio elements ) . I started this new version back in 2019 but it was never publicly announced, now I've rewrote it, and build it as a NPM module and Standalone Library.

The library is provided in the `AMD`, `UMD`, `IIFE` and `ESM` formats, all of them available in the `dist` folder

The current data model is based on the one used by Google Tag Manager for YouTube videos, meaning that you'll be able to use the current in-built events. 

# Features

 - GTM DataLayer Support
 - Tealium Support
 - Automatic new videos/audio detection
 - Data elements support to pass back data for the current video
 - Progress tracking
 - Start, Pause, Mute, Unmute, Seek, Complete and Error events

# Build
  

> $ npm install
> $ npm run build
  

# How to use


The library will expose a public global variable at **"window._htmlMediaElementsTracker"** and an "init" method that will accept all the parameters / settings.

  

     <script src="https://cdn.jsdelivr.net/npm/@thyngster/html-media-elements@latest/dist/htmlMediaElementsTracker.min.js">

    <script>
        window._htmlMediaElementsTracker.init({
            tms: 'debug',
            datalayerVariableNames: ['auto'],
            debug: true,
            observe: true,
            data_elements: true,        
            start: true,
            play: true,
            pause: true,
            mute: true,
            unmute: true,
            complete: true,
            seek: true,
            progress: true,
            error: true,
            progress_tracking_method: 'percentages',
            progress_percentages: [1,2,3,4,5,6,7,8,9,10],
            progress_thresholds: [],        
        });   
    </script>


# Configuration Settings

  

| key name | value type | description |
|--|--|--|
|**tms**|string|Tag Management System we are using|
|**datalayerVariableNames**|array|If the TMS is Google Tag Manager, we can push the data to an specific dataLayer , by default the library will search for the current dataLayer variable name|
|**debug**|boolean|Enable debug output to console|
|**observe**|boolean|Automatically track newly added video/audio elements|
|**data_elements**|boolean|data-html-media-element-title attribute will be used for elementTitle if provided|
|**start**|boolean|Track Audio/Video Start Event|
|**play**|boolean|Track Audio/Video Play Event|
|**pause**|boolean|Track Audio/Video Pause Event|
|**mute**|boolean|Track Audio/Video Mute Event|
|**unmute**|boolean|Track Audio/Video Unmute Event|
|**complete**|boolean|Track Audio/Video End Event|
|**seek**|boolean|Track Audio/Video Seek Event|
|**progress**|boolean|Track Audio/Video Progress Events|
|**progress_tracking_method**|boolean|'percentages' or 'thresholds' // thresholds not available yet| 
|**progress_percentages**|array|Array of % where we should fire an event|
|**progress_thresholds**|array|TBD|

  

# Supported Events

-  [x] start
-  [x] pause
-  [x] mute
-  [x] unmute
-  [x] progress ( % of video played )
-  [x] seek
-  [x] complete ( equals to 100% progress )
-  [x] errors

  

# Data Model

  
|Key|Value Example|Description|
|--|--|--|
|**event**|gtm.audio/gtm.video|Current Media Element Type|
|**Provider**|html5|Fixed value, describes the current media element provider|
|**Status**|start,pause,mute,unmute,progress, seek, completed, error|current media element event name|
|**Url**|http://www.dom.com|Current Video Holding URL ( iframe url reported if it's the case)|
|**Title**|Video Demo|Current video element data-media-element-title value, defaults to current video file name|
|**Duration**|230|Media element duration in seconds|
|**CurrentTime**|230|Media element current time in seconds|
|**ElapsedTime**|230|Elapsed time since last pause/play event|
|**Percent**|15|Media element current played %|
|**Visible**|true\|false|Reports if the video is visible within the current browser viewport|
|**isMuted**|true\|false|Is the current media element muted?|
|**PlaybackRate**|1|Media Element PlaybackRate, default: 1|
|**Loop**|true\|false|Is the video set to loop?|
|**Volume**|0.8|Current Video Volume|
|**NetworkState**||Network State|
|**Data**|Object|List of custom video data coming from data-attributes tagging
|**elementClasses**|""|Element Classes List|
|**elementId**|""|Element Id|
|**elementTarget**|""|Element Target|
|**elementUrl**|""|Element URL|

  

# Using a custom Video Title

When using HTML Media Element, we don't have a way to pass any video details, this library will allow you to customize the current video Title being reported. 

    <video src="" data-html-media-element-title="Demo Video version 1">

This will make the VideoTitle to be reported as "Demo Video version 1", is there's not data-attribute the library will use the current video file name

# Passing back video details
You can pass all the custom data you need about the video to have it passed back to the tracking events.
To achieve this we can all the data we want to the videos using data-attributes. 

This can be done using data-attributes with the following format:

    data-html-media-element-param-{{PARAM NAME}}="{{PARA VALUE}}"

All the data added to the `<video>` elements will be passed back to events so you can used them.

For example:

    <video width="400" 
    controls 
    data-html-media-element-param-band="Neil Zaza"
    data-html-media-element-param-song-name="I'm Alright"
    data-html-media-element-param-category="Music"
    data-html-media-element-title="video test">
        <source src="mov_bbb.mp4" type="video/mp4">
        <source src="mov_bbb.ogg" type="video/ogg">
        Your browser does not support HTML video.
    </video>

This will turn on have a videoData (or audioData) object passing the data this way:

     {
	     element:  video
	     elementClasses:  ""
	     elementId:  "vbst4f9ed29"
	     elementTarget:  video
	     elementUrl:  "https://local.dev/demo/mp3.html"
	     event:  "video"
	     videoCurrentTime:  2
	     videoData:
	    	 band:  "Neil Zaza"
	    	 category:  "Music"
	    	 songname:  "I'm Alright"
	     videoDuration:  361
	     videoElapsedTime:  2
	     videoIsMuted:  false
	     videoLoop:  false
	     videoNetworkState:  1
	     videoPercent:  0
	     videoPlaybackRate:  1
	     videoProvider:  "html5"
	     videoStatus:  "pause"
	     videoTitle:  "video test"
	     videoUrl:  "mov_bbb.mp4"
	     videoVisible:  true
	     videoVolume:  1
     }

# Dynamically added Media Elements / Modals

The library is able to attach the needed tracking listeners when a video is added dynamically to the site, like when a video is added into a modal using the Mutation Observer API ( where available ) 

Set `config.objserve` to true to enable this functionality

This will allow the tracking of dynamically added videos and videos shown on modals.

# Tag Manager Systems Support
Despite this library was initially made for GTM it can output the data for some other TMS.  It currently supports Google Tag Manager ( `dataLayer.push()` ) and Tealium ( `utag.link()` )
