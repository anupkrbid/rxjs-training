import {
  AsyncSubject,
  BehaviorSubject,
  fromEvent,
  Observable,
  Observer,
  ReplaySubject,
  Subject,
  Subscription,
} from "rxjs";
import { withLatestFrom, takeUntil } from "rxjs/operators";

export class AudioService {

  private audio: HTMLAudioElement = new Audio();
  private stop$ = new Subject();

  constructor() {}

  playback(src: string) {

    const mediaEvents: { [key: string]: Observable<any> } = {};
    const mediaEventSubscriptions: { [key: string]: Subscription } = {};
    const mediaEventNames = [
      "durationchange", //	The duration attribute has been updated.
      "loadedmetadata", //	The metadata has been loaded.
      "loadeddata", //	The first frame of the media has finished loading.
      "canplay", //	The browser can play the media, but estimates that not enough data has been loaded to play the media up to its end without having to stop for further buffering of content.
      "canplaythrough", //	The browser estimates it can play the media up to its end without stopping for content buffering.
      "ended", //	Playback has stopped because the end of the media was reached.
      "emptied", //	The media has become empty; for example, this event is sent if the media has already been loaded (or partially loaded), and the load() method is called to reload it.
      "stalled", //	The user agent is trying to fetch media data, but data is unexpectedly not forthcoming.
      "suspend", //	Media data loading has been suspended.
      "play", //	Playback has begun.
      "playing", //	Playback is ready to start after having been paused or delayed due to lack of data.
      "pause", //	Playback has been paused.
      "waiting", //	Playback has stopped because of a temporary lack of data.
      "seeking", //	A seek operation began.
      "seeked", //	A seek operation completed.
      "ratechange", //	The playback rate has changed.
      "timeupdate", //	The time indicated by the currentTime attribute has been updated.
      "volumechange", //	The volume has changed.
      "complete", //	The rendering of an OfflineAudioContext is terminated.
      "audioprocess", //	The input buffer of a ScriptProcessorNode is ready to be processed.
      "progress",
      "error"
    ];    
    const sharableSubjects = {
      src$: new ReplaySubject<string>(1), // Hold the source of the currently playing track
      playing$: new BehaviorSubject<boolean>(false), // Holds state of player if audio is playing or not
      currentTime$: new BehaviorSubject<number>(0) // Gives the current playback time in seconds
    };
    const communicationSubjects = {
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
          sharableSubjects.currentTime$.next(this.audio.currentTime);
          observer.next(sharableSubjects);
        });

      mediaEventSubscriptions.canplaySubscription = 
        mediaEvents.canplay$.subscribe(() => this.audio.play());
      
      this.audio.src = src;
      sharableSubjects.src$.next("src");

      // observer.next(sharableSubjects);

      return () => {
        console.log('removing!');
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

function addItem(val:any) {
  var node = document.createElement("li");
  var textnode = document.createTextNode(val);
  node.appendChild(textnode);
  document.getElementById("output").appendChild(node);
}

const sound = new AudioService();
sound.play('http://www.hipstrumentals.com/wp-content/uploads/2014/10/Eve-Ft.-Gwen-Stefani-Let-Me-Blow-Ya-Mind-Instrumental-Prod.-By-Swizz-Beatz.mp3').subscribe((data: any) => {
  addItem(data.currentTime$.getValue());
});

setTimeout(function () {
  sound.stop();
}, 15000);