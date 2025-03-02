import type {
    HTMLMediaElementsTrackerConfig,
    MediaElementStatus,
    PushModelData
} from './types';

class HtmlMediaElementsTracker {
    private config: HTMLMediaElementsTrackerConfig = {
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
        progress_thresholds: [],
    };

    private HTMLMediaElementStatus: Record<string, MediaElementStatus> = {};

    /**
     * Initialize the HTML Media Elements Tracker
     * @param customSettings - Custom configuration settings
     */
    public init(customSettings: Partial<HTMLMediaElementsTrackerConfig> = {}): void {
        // Merge custom settings with defaults
        this.config = {
            ...this.config,
            ...customSettings,
        };

        this.logDebug("[DTA::DEBUG] - @analytics-debugger / HTML MEDIA ELEMENTS TRACKER", this.config);

        // Find all HTML audio and video elements on the page
        const HTMLMediaElements: HTMLMediaElement[] = [
            ...Array.from(document.getElementsByTagName('audio')),
            ...Array.from(document.getElementsByTagName('video'))
        ];

        this.logDebug(`[DTA::DEBUG] - FOUND ${HTMLMediaElements.length} ELEMENTS`, HTMLMediaElements);

        // Process each media element
        HTMLMediaElements.forEach((element) => {
            this.processVideoElement(element);
        });

        // Set up mutation observer if observing is enabled
        if (this.config.observe) {
            this.logDebug(`[DTA::DEBUG - OBSERVER ENABLED]`);
            // Check for MutationObserver support
            const MutationObserver = window.MutationObserver ||
                (window as any).WebKitMutationObserver ||
                (window as any).MozMutationObserver;
            if (MutationObserver) {
                const observer = new MutationObserver((mutations: MutationRecord[]) => {
                    mutations.forEach((mutation: MutationRecord) => {
                        mutation.addedNodes.forEach((addedNode: Node) => {
                            if (addedNode instanceof HTMLElement && addedNode.tagName === "VIDEO") {
                                this.logDebug(`[NEW VIDEO::mutation]`, addedNode);
                                this.processVideoElement(addedNode as HTMLVideoElement);
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
    }

    /**
     * Log debug information if debug mode is enabled
     */
    private logDebug(...args: any[]): void {
        if (this.config.debug) {
            console.log(...args);
        }
    }

    /**
     * Check if an element is visible within the viewport
     * @param elem - Element to check for visibility
     */
    private elementIsVisible(elem: HTMLElement): boolean {
        const bounds = elem.getBoundingClientRect();
        return !(
            bounds.top < 0 ||
            bounds.left < 0 ||
            bounds.bottom > (window.innerHeight || document.documentElement.clientHeight) ||
            bounds.right > (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Push data to the tag management system
     * @param data - Data to push to the TMS
     */
    private pushData(data: PushModelData): void {
        console.log("DAVID", data);
    }

    /**
     * Process a video or audio element for tracking
     * @param element - The HTML media element to process
     */
    private processVideoElement(element: HTMLMediaElement): void {
        if (element.getAttribute('data-html-media-element-tracked')) return;

        const elementTagId = Math.random().toString(36).slice(2);
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
        const dataset = JSON.parse(JSON.stringify(element.dataset));
        for (const attr in dataset) {
            const match = attr.match(/^htmlMediaElementParam(.+)/);
            if (match) {
                this.HTMLMediaElementStatus[elementTagId].elementData[match[1].toLowerCase()] = dataset[attr];
            }
        }

        // Build up Markers
        if (this.config.progress_tracking_method === "percentages") {
            this.config.progress_percentages.forEach((e) => {
                this.HTMLMediaElementStatus[elementTagId].progressMarkers[e] = false;
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
    }

    /**
     * Event handler for media element events
     * @param e - The event object
     */
    private eventHandler(e: Event): void {
        const target = e.target as HTMLMediaElement;
        if (!target || !target.dataset || !target.dataset.htmlMediaElementId) return;

        const elementId = target.dataset.htmlMediaElementId;
        const mediaType = "DTA:" + target.nodeName.toLowerCase();
        const prefix = '';

        const pushModel: PushModelData = {
            event: `${mediaType}.${e.type}`,
            element: {
                classes: target.className || '',
                id: (e as any).for || target.dataset.htmlMediaElementId || '',
                target: target || '',
                element: e.srcElement || '',
                url: (e as any).baseURI || document.location.href,                
            },
            media: {
                type: 'mediaType',            
                provider: 'html5',            
                url: target.currentSrc,
                title: (target.getAttribute('data-html-media-element-title') && this.config.data_elements)
                    ? target.getAttribute('data-html-media-element-title')
                    : decodeURIComponent(target.currentSrc.split('/')[target.currentSrc.split('/').length - 1]),
                duration: Math.round(target.duration),
                currentTime: Math.round(target.currentTime),
                elapsedTime: Math.round(this.HTMLMediaElementStatus[elementId].elapsedTime / 1000),
                percent: Math.floor((100 * target.currentTime) / target.duration),
                visible: this.elementIsVisible(target),
                isMuted: target.muted,
                playbackRate: target.playbackRate,
                loop: target.loop,
                volume: target.volume,
                networkState: target.networkState,
                data: this.HTMLMediaElementStatus[elementId].elementData,
            }
        };

        // Current supported events
        let skipEvent = false;
        console.log(e.type);
        switch (e.type) {
            case 'volumechange':
                // Only track when the video is muted, either by lowering the volume to 0 or setting the muted switch
                
                if (pushModel.isMuted === true || pushModel.volume === 0) {
                    this.HTMLMediaElementStatus[elementId].muted = true;
                    pushModel.event = `${mediaType}.mute`;
                    pushModel.status = 'mute';
                } else if (
                    this.HTMLMediaElementStatus[elementId].muted === true &&
                    pushModel.isMuted === false
                ) {
                    this.HTMLMediaElementStatus[elementId].muted = false;
                    pushModel.event = `${mediaType}.unmute`;
                    pushModel.status = 'unmute';
                }
                break;

            case 'seeked':
                // When user goes fwd, or rwd
                pushModel.status = 'seek';
                pushModel.event = `${mediaType}.seek`;
                this.HTMLMediaElementStatus[elementId].playEvent = false;
                break;

            case 'timeupdate':
               
                this.HTMLMediaElementStatus[elementId].currentTime = Math.round(target.currentTime);
                const ctime = Date.now();
                this.HTMLMediaElementStatus[elementId].elapsedTime =
                    this.HTMLMediaElementStatus[elementId].elapsedTime +
                    (ctime - this.HTMLMediaElementStatus[elementId].lastUpdateTime);
                this.HTMLMediaElementStatus[elementId].lastUpdateTime = ctime;

                Object.entries(this.HTMLMediaElementStatus[elementId].progressMarkers).forEach((progressMarkers) => {
                    const [k] = progressMarkers;
                    const key = parseInt(k);
                    if (
                        pushModel.percent >= key &&
                        key > this.HTMLMediaElementStatus[elementId].greatest_marker
                    ) {
                        this.HTMLMediaElementStatus[elementId].greatest_marker = key;
                    }
                });

                // current bucket hasn't been already sent, let's push it
                if (
                    this.HTMLMediaElementStatus[elementId].greatest_marker &&
                    !this.HTMLMediaElementStatus[elementId].progressMarkers[
                    this.HTMLMediaElementStatus[elementId].greatest_marker
                    ]
                ) {
                    console.log("ASDASDASD: TIMEUPDATE", pushModel)
                    this.HTMLMediaElementStatus[elementId].progressMarkers[
                        this.HTMLMediaElementStatus[elementId].greatest_marker
                    ] = true;
                    pushModel.status = 'progress';
                    pushModel.event = `${mediaType}.progress`;
                    pushModel.percent = this.HTMLMediaElementStatus[elementId].greatest_marker;
                }
                
                break;

            case 'play':
                this.HTMLMediaElementStatus[elementId].lastUpdateTime = Date.now();
                // We only want to push the play event once, and report is as "start"
                if (this.HTMLMediaElementStatus[elementId].state === "loaded") {
                    this.HTMLMediaElementStatus[elementId].state = "playing";
                    pushModel.event = `${mediaType}.start`;
                    pushModel.status = 'start';
                } else {
                    skipEvent = true;
                }
                break;

            case 'pause':
                // Pause shouldn't be firing before ended or seeking events
                this.HTMLMediaElementStatus[elementId].state = "paused";
                if (
                    pushModel.status !== 100 &&
                    target.seeking !== true &&
                    (Math.round(target.currentTime) !== Math.round(target.duration))
                ) {
                    // Keep the existing status
                } else {
                    skipEvent = true;
                }
                this.HTMLMediaElementStatus[elementId].playEvent = true;
                break;

            case 'ended':
                pushModel.status = 'complete';
                pushModel.event = `${mediaType}.complete`;
                this.HTMLMediaElementStatus[elementId].playEvent = true;
                break;

            case 'error':
                if (target.error) {
                    pushModel.event = `${mediaType}.error`;
                    pushModel.errorCode = target.error.code;
                    pushModel.errorMessage = target.error.message;
                }
                break;

            default:
                break;
        }
        this.pushData(pushModel);
       /*  if (!skipEvent) this.pushData(pushModel); */
    }
}

// Create a singleton instance
const htmlMediaElementsTracker = new HtmlMediaElementsTracker();

export default htmlMediaElementsTracker;