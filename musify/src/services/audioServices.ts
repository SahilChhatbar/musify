import { Track, QueueItem, PlayerState } from '../types/types';

// Define AudioService event types
export type AudioServiceEvent = 
  | 'play'
  | 'pause'
  | 'trackChange'
  | 'timeUpdate'
  | 'queueUpdate'
  | 'volumeChange'
  | 'end';

// Event listeners store
const listeners: { [key in AudioServiceEvent]: Function[] } = {
  play: [],
  pause: [],
  trackChange: [],
  timeUpdate: [],
  queueUpdate: [],
  volumeChange: [],
  end: []
};

// Initial player state
const defaultPlayerState: PlayerState = {
  currentTrack: null,
  queue: [],
  isPlaying: false,
  currentTime: 0,
  volume: 1.0
};

// Singleton audio element
let audioElement: HTMLAudioElement | null = null;

// Initialize audio element
const initAudio = (): HTMLAudioElement => {
  if (typeof window !== 'undefined' && !audioElement) {
    audioElement = new Audio();
    
    audioElement.addEventListener('ended', () => {
      playNextTrack();
      notifyListeners('end');
    });
    
    audioElement.addEventListener('timeupdate', () => {
      if (audioElement) {
        const playerState = getPlayerState();
        playerState.currentTime = audioElement.currentTime;
        savePlayerState(playerState);
        notifyListeners('timeUpdate');
      }
    });
  }
  
  return audioElement as HTMLAudioElement;
};

// Get player state from localStorage
export const getPlayerState = (): PlayerState => {
  try {
    const storedState = localStorage.getItem('playerState');
    if (storedState) {
      return JSON.parse(storedState);
    }
  } catch (error) {
    console.error('Error parsing stored player state:', error);
  }
  
  return {...defaultPlayerState};
};

// Save player state to localStorage
export const savePlayerState = (state: PlayerState): void => {
  try {
    localStorage.setItem('playerState', JSON.stringify(state));
  } catch (error) {
    console.error('Error saving player state:', error);
  }
};

// Add event listener
export const addEventListener = (event: AudioServiceEvent, callback: Function): void => {
  if (listeners[event]) {
    listeners[event].push(callback);
  }
};

// Remove event listener
export const removeEventListener = (event: AudioServiceEvent, callback: Function): void => {
  if (listeners[event]) {
    listeners[event] = listeners[event].filter(cb => cb !== callback);
  }
};

// Notify all listeners of an event
const notifyListeners = (event: AudioServiceEvent): void => {
  if (listeners[event]) {
    const playerState = getPlayerState();
    listeners[event].forEach(callback => callback(playerState));
  }
};

// Play a track
export const playTrack = (track: Track): void => {
  const audio = initAudio();
  const playerState = getPlayerState();
  
  playerState.currentTrack = track;
  playerState.isPlaying = true;
  savePlayerState(playerState);
  
  audio.src = track.preview;
  audio.volume = playerState.volume;
  
  audio.play().catch(error => {
    console.error('Error playing track:', error);
    playerState.isPlaying = false;
    savePlayerState(playerState);
  });
  
  notifyListeners('trackChange');
  notifyListeners('play');
};

// Queue a track
export const queueTrack = (track: Track): QueueItem => {
  const playerState = getPlayerState();
  
  const queueItem: QueueItem = {
    track,
    queuedAt: new Date()
  };
  
  // Only play the track if there's no current track playing
  if (!playerState.currentTrack) {
    playTrack(track);
  } else {
    // Add to queue if there's already a track playing
    playerState.queue.push(queueItem);
    savePlayerState(playerState);
    notifyListeners('queueUpdate');
  }  
  
  return queueItem;
};

// Force add to queue without playing it
export const forceQueueTrack = (track: Track): QueueItem => {
  const playerState = getPlayerState();
  
  const queueItem: QueueItem = {
    track,
    queuedAt: new Date()
  };
  
  // Always add to queue regardless of current playback state
  playerState.queue.push(queueItem);
  savePlayerState(playerState);
  notifyListeners('queueUpdate');
  
  return queueItem;
};

// Toggle play/pause
export const togglePlay = (): boolean => {
  const audio = initAudio();
  const playerState = getPlayerState();
  
  if (!playerState.currentTrack) {
    return false;
  }
  
  if (playerState.isPlaying) {
    audio.pause();
    playerState.isPlaying = false;
    notifyListeners('pause');
  } else {
    audio.play().catch(error => {
      console.error('Error playing track:', error);
    });
    playerState.isPlaying = true;
    notifyListeners('play');
  }
  
  savePlayerState(playerState);
  return playerState.isPlaying;
};

// Skip forward
export const skipForward = (seconds: number = 5): number => {
  const audio = initAudio();
  const playerState = getPlayerState();
  
  if (!playerState.currentTrack) {
    return 0;
  }
  
  const newTime = Math.min(audio.duration, audio.currentTime + seconds);
  audio.currentTime = newTime;
  playerState.currentTime = newTime;
  savePlayerState(playerState);
  notifyListeners('timeUpdate');
  
  return newTime;
};

// Skip backward
export const skipBackward = (seconds: number = 5): number => {
  const audio = initAudio();
  const playerState = getPlayerState();
  
  if (!playerState.currentTrack) {
    return 0;
  }
  
  const newTime = Math.max(0, audio.currentTime - seconds);
  audio.currentTime = newTime;
  playerState.currentTime = newTime;
  savePlayerState(playerState);
  notifyListeners('timeUpdate');
  
  return newTime;
};

// Play next track
export const playNextTrack = (): Track | null => {
  const playerState = getPlayerState();
  
  if (playerState.queue.length === 0) {
    // No more tracks in queue
    playerState.currentTrack = null;
    playerState.isPlaying = false;
    
    const audio = initAudio();
    audio.pause();
    audio.currentTime = 0;
    
    savePlayerState(playerState);
    notifyListeners('trackChange');
    return null;
  }
  
  // Get the next track from the queue
  const nextItem = playerState.queue.shift();
  savePlayerState(playerState);
  
  if (nextItem) {
    playTrack(nextItem.track);
    return nextItem.track;
  }
  
  return null;
};

// Play previous track / restart current track
export const playPreviousTrack = (): void => {
  const audio = initAudio();
  const playerState = getPlayerState();
  
  if (audio.currentTime > 3) {
    // If more than 3 seconds in, just restart the current track
    audio.currentTime = 0;
    playerState.currentTime = 0;
    savePlayerState(playerState);
    notifyListeners('timeUpdate');
    return;
  }
  
  // Otherwise restart from beginning
  audio.currentTime = 0;
  playerState.currentTime = 0;
  savePlayerState(playerState);
  notifyListeners('timeUpdate');
};

// Set volume
export const setVolume = (volume: number): number => {
  const audio = initAudio();
  const playerState = getPlayerState();
  
  const normalizedVolume = Math.max(0, Math.min(1, volume));
  audio.volume = normalizedVolume;
  playerState.volume = normalizedVolume;
  savePlayerState(playerState);
  notifyListeners('volumeChange');
  
  return normalizedVolume;
};

// Clear queue
export const clearQueue = (): void => {
  const playerState = getPlayerState();
  playerState.queue = [];
  savePlayerState(playerState);
  notifyListeners('queueUpdate');
};

export default {
  addEventListener,
  removeEventListener,
  getPlayerState,
  playTrack,
  queueTrack,
  forceQueueTrack,
  togglePlay,
  skipForward,
  skipBackward,
  playNextTrack,
  playPreviousTrack,
  setVolume,
  clearQueue
};