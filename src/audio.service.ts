import { fromEvent, Observable, Observer, Subject, Subscription } from "rxjs";
import { takeUntil } from "rxjs/operators";

export class AudioService {

  private audio: HTMLAudioElement = new Audio();
  private stop$ = new Subject();

  constructor() {}

  playback(src: string) {

    const mediaEvents: { [key: string]: Observable<any> } = {};
    const mediaEventSubscriptions: { [key: string]: Subscription } = {};
    const mediaEventNames = [
      "audioprocess", // The input buffer of a ScriptProcessorNode is ready to be processed.
      "complete", // The rendering of an OfflineAudioContext is terminated.

      'abort', //	Fires when the loading of an audio/video is aborted
      'canplay', //	Fires when the browser can start playing the audio/video
      'canplaythrough', // Fires when the browser can play through the audio/video without stopping for buffering
      'durationchange', // Fires when the duration of the audio/video is changed
      'emptied', //	Fires when the current playlist is empty
      'ended', //	Fires when the current playlist is ended
      'error', //	Fires when an error occurred during the loading of an audio/video
      'loadeddata', // Fires when the browser has loaded the current frame of the audio/video
      'loadedmetadata', // Fires when the browser has loaded meta data for the audio/video
      'loadstart', //	Fires when the browser starts looking for the audio/video
      'pause', //	Fires when the audio/video has been paused
      'play', // Fires when the audio/video has been started or is no longer paused
      'playing', //	Fires when the audio/video is playing after having been paused or stopped for buffering
      'progress', // Fires when the browser is downloading the audio/video
      'ratechange', // Fires when the playing speed of the audio/video is changed
      'seeked', // Fires when the user is finished moving/skipping to a new position in the audio/video
      'seeking', // Fires when the user starts moving/skipping to a new position in the audio/video
      'stalled', // Fires when the browser is trying to get media data, but data is not available
      'suspend', // Fires when the browser is intentionally not getting media data
      'timeupdate', // Fires when the current playback position has changed
      'volumechange', // Fires when the volume has been changed
      'waiting' // Fires when the video stops because it needs to buffer the next frame
    ];    
    const playerMetaData = {
      playing: false, // Holds state of player if audio is playing or not

      audioTracks: '', // Returns an AudioTrackList object representing available audio tracks
      autoplay: '', // Sets or returns whether the audio/video should start playing as soon as it is loaded
      buffered: '', // Returns a TimeRanges object representing the buffered parts of the audio/video
      controller: '', // Returns the MediaController object representing the current media controller of the audio/video
      controls: '', // Sets or returns whether the audio/video should display controls (like play/pause etc.)
      crossOrigin: '', // Sets or returns the CORS settings of the audio/video
      currentSrc: '', // Returns the URL of the current audio/video
      currentTime: 0, // Sets or returns the current playback position in the audio/video (in seconds)
      defaultMuted: '', // Sets or returns whether the audio/video should be muted by default
      defaultPlaybackRate: '', // Sets or returns the default speed of the audio/video playback
      duration: '', // Returns the length of the current audio/video (in seconds)
      ended: '', // Returns whether the playback of the audio/video has ended or not
      error: '', // Returns a MediaError object representing the error state of the audio/video
      loop: false, // Sets or returns whether the audio/video should start over again when finished
      mediaGroup: '', // Sets or returns the group the audio/video belongs to (used to link multiple audio/video elements)
      muted: false,	// Sets or returns whether the audio/video is muted or not
      networkState: '', // Returns the current network state of the audio/video
      paused: false, // Returns whether the audio/video is paused or not
      playbackRate: '', // Sets or returns the speed of the audio/video playback
      played: '', // Returns a TimeRanges object representing the played parts of the audio/video
      preload: '', // Sets or returns whether the audio/video should be loaded when the page loads
      readyState: '', // Returns the current ready state of the audio/video
      seekable: '', // Returns a TimeRanges object representing the seekable parts of the audio/video
      seeking: '', // Returns whether the user is currently seeking in the audio/video
      src: '', // Sets or returns the current source of the audio/video element
      startDate: '', // Returns a Date object representing the current time offset
      textTracks: '', // Returns a TextTrackList object representing the available text tracks
      videoTracks: '', // Returns a VideoTrackList object representing the available video tracks
      volume: '' // Sets or returns the volume of the audio/video
    };
    const subjects = {
      play$: new Subject(), // custom event to start playing audio
      pause$: new Subject(), // custom event to pasue playing audio
      stop$: new Subject(), // custom event to stop playing audio
      togglePlayPause$: new Subject() // custom event to toggle btw play/pause state of audio
    };

    const addEventListeners = () => {
      mediaEventNames.forEach(event => {
        mediaEvents[`${event}$`] = fromEvent(this.audio, event);
      });
    }

    const removeEventListeners = () => {
      for (const subscription in mediaEventSubscriptions) {
        if (mediaEventSubscriptions.hasOwnProperty(subscription)) {
          mediaEventSubscriptions[subscription].unsubscribe();
        }
      }
    }

    return Observable.create((observer: Observer<any>) => {

      addEventListeners();

      mediaEventSubscriptions.timeupdateSubscription = 
        mediaEvents.timeupdate$.subscribe(() => {
          playerMetaData.currentTime = this.audio.currentTime;
          observer.next(playerMetaData);
        });

      mediaEventSubscriptions.canplaySubscription = 
        mediaEvents.canplay$.subscribe(() => this.audio.play());
      
      this.audio.src = src;
      playerMetaData.src = src;

      // observer.next(sharableSubjects);

      return () => {
        log('removing!');
        this.audio.pause();
        this.audio.src = '';
        removeEventListeners();
      };
    });
  }

  play(src: string) {
    return this.playback(src).pipe(takeUntil(this.stop$));
  }

  stop() {
    this.stop$.next();
  }
}

function log(val: any) {
  var node = document.createElement("li");
  var textnode = document.createTextNode(val);
  node.appendChild(textnode);
  document.getElementById("output").appendChild(node);
  window.scrollTo(0, document.body.scrollHeight);
}

const sound = new AudioService();
const audioURL = 'http://www.hipstrumentals.com/wp-content/uploads/2014/10/Eve-Ft.-Gwen-Stefani-Let-Me-Blow-Ya-Mind-Instrumental-Prod.-By-Swizz-Beatz.mp3';
sound.play(audioURL).subscribe((data: any) => {
  log(data.currentTime);
});

setTimeout(function () {
  sound.stop();
}, 15000);

// https://www.w3schools.com/tags/ref_eventattributes.asp
// https://www.w3schools.com/tags/ref_av_dom.asp
