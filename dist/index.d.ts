import type { HTMLMediaElementsTrackerConfig } from './types';
declare class HtmlMediaElementsTracker {
    private config;
    private HTMLMediaElementStatus;
    /**
     * Initialize the HTML Media Elements Tracker
     * @param customSettings - Custom configuration settings
     */
    init(customSettings?: Partial<HTMLMediaElementsTrackerConfig>): void;
    /**
     * Log debug information if debug mode is enabled
     */
    private logDebug;
    /**
     * Check if an element is visible within the viewport
     * @param elem - Element to check for visibility
     */
    private elementIsVisible;
    /**
     * Push data to the tag management system
     * @param data - Data to push to the TMS
     */
    private pushData;
    /**
     * Process a video or audio element for tracking
     * @param element - The HTML media element to process
     */
    private processVideoElement;
    /**
     * Event handler for media element events
     * @param e - The event object
     */
    private eventHandler;
}
declare const htmlMediaElementsTracker: HtmlMediaElementsTracker;
export default htmlMediaElementsTracker;
//# sourceMappingURL=index.d.ts.map