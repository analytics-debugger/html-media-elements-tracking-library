# HTML Media Elements Tracking Library

Hi! This a **JavaScript** library to help tracking HTML Media Elements ( video/audio elements ) .

The current version is developed to work with **Google Tag Manager** , Therefore the current event data Model is based on the one GTM users for the *in-build YouTube tracking utility*. 

# Build

> $ npm install  
> $ npm run build


## Configuration

The library will load a default configuration, but you can override the default values setting the global variable ***window.__htmlMediaElementsTrackingConfig***

    <script>
        window.__htmlMediaElementsTrackingConfig = __htmlMediaElementsTrackingConfig || {
            percentages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            tms: 'gtm',
            datalayerVariableNames: ["auto"],
            debug: false
        }
    </script>
### Configuration Values

| key name | value type | description |
|--|--|--|
|percentajes|array|progress percentages we want to track|
|tms|string|Tag Management System we are using|
|datalayerVariableNames|array|list of dataLayer variables to where we want to send the data. Setting this to "auto" will autofind the current available datalayers on page|
|debug|boolean|Turn on/off the debugging messages|

# Supported Events

 - [x] start
 - [x] pause
 - [x] mute
 - [x] progress ( % of video played )
 - [x] seek
 - [x] ended ( equals to 100% progress )
 - [x] error 

# Available Data For Media Events

|Key|Value Example|Description|
|--|--|--|
|event|gtm.audio/gtm.video|Current Media Element Type|
|Provider|html5|Fixed value, describes the current media element providor|
|Status|start,pause,mute,progress, seek, ended, error|current media element event name|
|Url|http://www.dom.com|Current Video Holding URL ( iframe url reported if it's the case)|
|Title|Video Demo|Current video element data-media-element-title value, defaults to current video file name|
|Duration|230|Media element duration in seconds|
|CurrentTime|230|Media element current time in seconds|
|Percent|15|Media element current played %|
|Visible|true\|false|Reports if the video is visible within the current browser viewport|
|isMuted|true\|false|Is the current media element muted?|
|PlaybackRate|1|Media Element PlaybackRate, default: 1|
|Loop|true\|false|Is the video set to loop?|
|elementClasses|""|Element Classes List|
|elementId|""|Element Id|
|elementTarget|""|Element Target|
|elementUrl|""|Element URL|

# Where to get the code

You can find the ES2015 code check the **src/index.js** file.
If you just want to grab the production code go do **dist/build.min.js**

> **Disclaimer:** This is my first non ES5 library, and my very first time using babel and webpack. Code will be improved in next versions.



