import axios, { AxiosResponse } from 'axios';
import { Track, SearchResult, QueueItem, PlayerState } from '../types';

const deezerApi = axios.create({
  baseURL: 'https://deezerdevs-deezer.p.rapidapi.com',
  headers: {
    'x-rapidapi-host': 'deezerdevs-deezer.p.rapidapi.com',
    'x-rapidapi-key': '2e97bc1313mshe35d6ec451e07bdp1e00fdjsn7e2b3ff18869'
  }
});

// Store the player state in localStorage to persist between page navigations
const getStoredPlayerState = (): PlayerState => {
  try {
    const storedState = localStorage.getItem('playerState');
    if (storedState) {
      return JSON.parse(storedState);
    }
  } catch (error) {
    console.error('Error parsing stored player state:', error);
  }
  
  return {
    currentTrack: null,
    queue: [],
    isPlaying: false,
    currentTime: 0,
    volume: 1.0
  };
};

let playerState: PlayerState = getStoredPlayerState();

// Save the player state to localStorage
const savePlayerState = () => {
  try {
    localStorage.setItem('playerState', JSON.stringify(playerState));
  } catch (error) {
    console.error('Error saving player state:', error);
  }
};

let audioElement: HTMLAudioElement | null = null;

const initAudio = (): HTMLAudioElement => {
  if (typeof window !== 'undefined' && !audioElement) {
    audioElement = new Audio();
    
    audioElement.addEventListener('ended', () => {
      playNextTrack();
    });
    
    audioElement.addEventListener('timeupdate', () => {
      if (audioElement) {
        playerState.currentTime = audioElement.currentTime;
        savePlayerState(); // Save state when current time updates
      }
    });
  }
  
  return audioElement as HTMLAudioElement;
};

export const searchTracks = async (query: string, limit: number = 20, index: number = 0): Promise<SearchResult> => {
  try {
    const response: AxiosResponse<SearchResult> = await deezerApi.get('/search', {
      params: {
        q: query,
        limit,
        index
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching tracks:', error);
    throw error;
  }
};

export const getTrack = async (id: number): Promise<Track> => {
  try {
    const response: AxiosResponse<Track> = await deezerApi.get(`/track/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching track ${id}:`, error);
    throw error;
  }
};

export const playTrack = (track: Track): void => {
  const audio = initAudio();
  
  playerState.currentTrack = track;
  playerState.isPlaying = true;
  audio.src = track.preview;
  audio.volume = playerState.volume;
  
  audio.play().catch(error => {
    console.error('Error playing track:', error);
    playerState.isPlaying = false;
  });
  
  savePlayerState(); 
};

export const queueTrack = (track: Track): QueueItem => {
  const queueItem: QueueItem = {
    track,
    queuedAt: new Date()
  };
  
  if (!playerState.currentTrack) {
    playTrack(track);
  } else {
    playerState.queue.push(queueItem);
  }  
  
  savePlayerState(); 
  return queueItem;
};

export const forceQueueTrack = (track: Track): QueueItem => {
  const queueItem: QueueItem = {
    track,
    queuedAt: new Date()
  };
  
  playerState.queue.push(queueItem);
  savePlayerState();
  
  return queueItem;
};

export const togglePlay = (): boolean => {
  const audio = initAudio();
  
  if (!playerState.currentTrack) {
    return false;
  }
  
  if (playerState.isPlaying) {
    audio.pause();
    playerState.isPlaying = false;
  } else {
    audio.play().catch(error => {
      console.error('Error playing track:', error);
    });
    playerState.isPlaying = true;
  }
  
  savePlayerState();
  return playerState.isPlaying;
};

export const skipForward = (seconds: number = 5): number => {
  const audio = initAudio();
  
  if (!playerState.currentTrack) {
    return 0;
  }
  
  const newTime = Math.min(audio.duration, audio.currentTime + seconds);
  audio.currentTime = newTime;
  playerState.currentTime = newTime;
  
  savePlayerState(); 
  return newTime;
};

export const skipBackward = (seconds: number = 5): number => {
  const audio = initAudio();
  
  if (!playerState.currentTrack) {
    return 0;
  }
  
  const newTime = Math.max(0, audio.currentTime - seconds);
  audio.currentTime = newTime;
  playerState.currentTime = newTime;
  
  savePlayerState(); 
  return newTime;
};

export const playNextTrack = (): Track | null => {
  if (playerState.queue.length === 0) {
    playerState.currentTrack = null;
    playerState.isPlaying = false;
    
    const audio = initAudio();
    audio.pause();
    audio.currentTime = 0;
    
    savePlayerState(); 
    return null;
  }
  
  const nextItem = playerState.queue.shift();
  
  if (nextItem) {
    playTrack(nextItem.track);
    savePlayerState(); 
    return nextItem.track;
  }
  
  return null;
};

export const playPreviousTrack = (): void => {
  const audio = initAudio();
  
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    playerState.currentTime = 0;
    savePlayerState(); 
    return;
  }
  
  audio.currentTime = 0;
  playerState.currentTime = 0;
  savePlayerState(); 
};

export const setVolume = (volume: number): number => {
  const audio = initAudio();  
  const normalizedVolume = Math.max(0, Math.min(1, volume));
  audio.volume = normalizedVolume;
  playerState.volume = normalizedVolume;
  
  savePlayerState(); 
  return normalizedVolume;
};

export const getPlayerState = (): PlayerState => {
  return { ...playerState };
};

export const clearQueue = (): void => {
  playerState.queue = [];
  savePlayerState(); 
};

export const getLyrics = async (artist: string, title: string): Promise<string> => {
  try {
    const response = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
    return response.data.lyrics;
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    return 'Lyrics not available';
  }
};

export default {
  searchTracks,
  getTrack,
  playTrack,
  queueTrack,
  forceQueueTrack,
  togglePlay,
  skipForward,
  skipBackward,
  playNextTrack,
  playPreviousTrack,
  setVolume,
  getPlayerState,
  clearQueue,
  getLyrics
};