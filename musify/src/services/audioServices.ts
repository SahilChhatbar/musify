import { Track, QueueItem, PlayerState } from "../types";
import { listeners } from "../constants";

export type AudioServiceEvent =
  | "play"
  | "pause"
  | "trackChange"
  | "timeUpdate"
  | "queueUpdate"
  | "volumeChange"
  | "end";

const defaultPlayerState: PlayerState = {
  currentTrack: null,
  queue: [],
  isPlaying: false,
  currentTime: 0,
  volume: 1.0,
};

let audioElement: HTMLAudioElement | null = null;

const initAudio = (): HTMLAudioElement => {
  if (typeof window !== "undefined" && !audioElement) {
    audioElement = new Audio();

    audioElement.addEventListener("ended", () => {
      playNextTrack();
      notifyListeners("end");
    });

    audioElement.addEventListener("timeupdate", () => {
      if (audioElement) {
        const playerState = getPlayerState();
        playerState.currentTime = audioElement.currentTime;
        savePlayerState(playerState);
        notifyListeners("timeUpdate");
      }
    });
  }

  return audioElement as HTMLAudioElement;
};

export const getPlayerState = (): PlayerState => {
  try {
    const storedState = localStorage.getItem("playerState");
    if (storedState) {
      return JSON.parse(storedState);
    }
  } catch (error) {
    console.error("Error parsing stored player state:", error);
  }

  return { ...defaultPlayerState };
};

export const savePlayerState = (state: PlayerState): void => {
  try {
    localStorage.setItem("playerState", JSON.stringify(state));
  } catch (error) {
    console.error("Error saving player state:", error);
  }
};

export const addEventListener = (
  event: AudioServiceEvent,
  callback: Function
): void => {
  if (listeners[event]) {
    listeners[event].push(callback);
  }
};

export const removeEventListener = (
  event: AudioServiceEvent,
  callback: Function
): void => {
  if (listeners[event]) {
    listeners[event] = listeners[event].filter((cb) => cb !== callback);
  }
};

const notifyListeners = (event: AudioServiceEvent): void => {
  if (listeners[event]) {
    const playerState = getPlayerState();
    listeners[event].forEach((callback) => callback(playerState));
  }
};

export const playTrack = (track: Track): void => {
  const audio = initAudio();
  const playerState = getPlayerState();

  playerState.currentTrack = track;
  playerState.isPlaying = true;
  savePlayerState(playerState);

  audio.src = track.preview;
  audio.volume = playerState.volume;

  audio.play().catch((error) => {
    console.error("Error playing track:", error);
    playerState.isPlaying = false;
    savePlayerState(playerState);
  });

  notifyListeners("trackChange");
  notifyListeners("play");
};

export const queueTrack = (track: Track): QueueItem => {
  const playerState = getPlayerState();

  const queueItem: QueueItem = {
    track,
    queuedAt: new Date(),
  };

  if (!playerState.currentTrack) {
    playTrack(track);
  } else {
    playerState.queue.push(queueItem);
    savePlayerState(playerState);
    notifyListeners("queueUpdate");
  }
  return queueItem;
};

export const forceQueueTrack = (track: Track): QueueItem => {
  const playerState = getPlayerState();

  const queueItem: QueueItem = {
    track,
    queuedAt: new Date(),
  };

  playerState.queue.push(queueItem);
  savePlayerState(playerState);
  notifyListeners("queueUpdate");

  return queueItem;
};

export const togglePlay = (): boolean => {
  const audio = initAudio();
  const playerState = getPlayerState();

  if (!playerState.currentTrack) {
    return false;
  }

  if (playerState.isPlaying) {
    audio.pause();
    playerState.isPlaying = false;
    notifyListeners("pause");
  } else {
    audio.play().catch((error) => {
      console.error("Error playing track:", error);
    });
    playerState.isPlaying = true;
    notifyListeners("play");
  }

  savePlayerState(playerState);
  return playerState.isPlaying;
};

export const skipForward = (seconds: number = 5): number => {
  const audio = initAudio();
  const playerState = getPlayerState();

  if (!playerState.currentTrack) {
    return 0;
  }

  const newTime =
    seconds < 0
      ? Math.max(0, audio.currentTime + seconds)
      : Math.min(audio.duration, audio.currentTime + seconds);

  audio.currentTime = newTime;
  playerState.currentTime = newTime;
  savePlayerState(playerState);
  notifyListeners("timeUpdate");

  return newTime;
};

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
  notifyListeners("timeUpdate");

  return newTime;
};

export const seekTo = (position: number): number => {
  const audio = initAudio();
  const playerState = getPlayerState();

  if (!playerState.currentTrack) {
    return 0;
  }

  const newTime = Math.max(0, Math.min(audio.duration, position));
  audio.currentTime = newTime;
  playerState.currentTime = newTime;
  savePlayerState(playerState);
  notifyListeners("timeUpdate");

  return newTime;
};

export const playNextTrack = (): Track | null => {
  const playerState = getPlayerState();

  if (playerState.queue.length === 0) {
    playerState.currentTrack = null;
    playerState.isPlaying = false;

    const audio = initAudio();
    audio.pause();
    audio.currentTime = 0;

    savePlayerState(playerState);
    notifyListeners("trackChange");
    return null;
  }

  const nextItem = playerState.queue.shift();
  savePlayerState(playerState);

  if (nextItem) {
    playTrack(nextItem.track);
    return nextItem.track;
  }

  return null;
};

export const playPreviousTrack = (): void => {
  const audio = initAudio();
  const playerState = getPlayerState();

  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    playerState.currentTime = 0;
    savePlayerState(playerState);
    notifyListeners("timeUpdate");
    return;
  }

  audio.currentTime = 0;
  playerState.currentTime = 0;
  savePlayerState(playerState);
  notifyListeners("timeUpdate");
};

export const setVolume = (volume: number): number => {
  const audio = initAudio();
  const playerState = getPlayerState();

  const normalizedVolume = Math.max(0, Math.min(1, volume));
  audio.volume = normalizedVolume;
  playerState.volume = normalizedVolume;
  savePlayerState(playerState);
  notifyListeners("volumeChange");

  return normalizedVolume;
};

export const clearQueue = (): void => {
  const playerState = getPlayerState();
  playerState.queue = [];
  savePlayerState(playerState);
  notifyListeners("queueUpdate");
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
  seekTo,
  playNextTrack,
  playPreviousTrack,
  setVolume,
  clearQueue,
};
