/**
 * Type definitions for HTML Media Elements Tracker
 */

export interface MediaElementData {
    [key: string]: string;
  }
  
  export interface MediaElementStatus {
    progressMarkers: Record<number, boolean>;
    type: string;
    greatest_marker: number;
    playEvent: boolean;
    muted: boolean;
    currentTime: number;
    state: 'loaded' | 'playing' | 'paused';
    elapsedTime: number;
    lastUpdateTime: number;
    elementData: MediaElementData;
  }
  
  export interface PushModelData {
    event: string;
    [key: string]: any; // This allows for dynamic properties in the push model
  }
  
  export interface HTMLMediaElementsTrackerConfig {
    debug: boolean;
    observe: boolean;
    data_elements: boolean;
    start: boolean;
    play: boolean;
    pause: boolean;
    mute: boolean;
    ratechange: boolean;
    unmute: boolean;
    complete: boolean;
    seek: boolean;
    progress: boolean;
    progress_tracking_method: 'percentages' | 'thresholds';
    progress_percentages: number[];
    progress_thresholds: number[];
  }