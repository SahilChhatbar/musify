import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch } from './store';
import { 
  getPlayerState, 
  playTrack as playTrackAPI, 
  queueTrack as queueTrackAPI,
  forceQueueTrack as forceQueueTrackAPI,
  togglePlay as togglePlayAPI,
  playNextTrack as playNextTrackAPI,
  playPreviousTrack as playPreviousTrackAPI,
  clearQueue as clearQueueAPI,
  skipForward as skipForwardAPI,
  skipBackward as skipBackwardAPI,
  setVolume
} from '../api/deezerAPI';
import { PlayerState, Track } from '../types/types';

interface PlayerSliceState {
  playerState: PlayerState;
  notification: {
    type: 'success' | 'error';
    message: string;
  } | null;
  lastUpdated: number;
}

const initialState: PlayerSliceState = {
  playerState: getPlayerState(),
  notification: null,
  lastUpdated: Date.now()
};

export const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    updatePlayerState: (state, action: PayloadAction<PlayerState>) => {
      state.playerState = action.payload;
      state.lastUpdated = Date.now();
    },
    setNotification: (state, action: PayloadAction<{ type: 'success' | 'error'; message: string }>) => {
      state.notification = action.payload;
    },
    clearNotification: (state) => {
      state.notification = null;
    }
  },
});

// Action creators
export const { updatePlayerState, setNotification, clearNotification } = playerSlice.actions;

// Thunks - these handle the API calls and state updates
export const fetchPlayerState = () => (dispatch: AppDispatch) => {
  try {
    const state = getPlayerState();
    dispatch(updatePlayerState(state));
  } catch (error) {
    console.error('Error fetching player state:', error);
    dispatch(setNotification({ type: 'error', message: 'Failed to fetch player state' }));
    setTimeout(() => dispatch(clearNotification()), 3000);
  }
};

export const playTrack = (track: Track) => (dispatch: AppDispatch) => {
  try {
    playTrackAPI(track);
    dispatch(fetchPlayerState());
    dispatch(setNotification({ type: 'success', message: `Now playing: "${track.title}"` }));
    setTimeout(() => dispatch(clearNotification()), 3000);
  } catch (error) {
    console.error('Error playing track:', error);
    dispatch(setNotification({ type: 'error', message: 'Failed to play track' }));
    setTimeout(() => dispatch(clearNotification()), 3000);
  }
};

export const queueTrack = (track: Track) => (dispatch: AppDispatch) => {
  try {
    // Call the API to queue the track
    const queueItem = queueTrackAPI(track);
    
    // Force a state update to reflect the new queue
    const updatedState = getPlayerState();
    dispatch(updatePlayerState(updatedState));
    
    // Check if the track was added to queue or started playing directly
    // We need to check if the current track is the same as the one we just queued
    if (updatedState.currentTrack && updatedState.currentTrack.id === track.id && 
        updatedState.queue.length === 0) {
      // The track is now playing (wasn't added to queue because nothing was playing)
      dispatch(setNotification({ type: 'success', message: `Now playing: "${track.title}"` }));
    } else {
      // The track was added to the queue
      dispatch(setNotification({ type: 'success', message: `"${track.title}" added to queue` }));
    }
    
    setTimeout(() => dispatch(clearNotification()), 3000);
  } catch (error) {
    console.error('Error queueing track:', error);
    dispatch(setNotification({ type: 'error', message: 'Failed to add track to queue' }));
    setTimeout(() => dispatch(clearNotification()), 3000);
  }
};
export const togglePlay = () => (dispatch: AppDispatch) => {
  try {
    const isPlaying = togglePlayAPI();
    dispatch(fetchPlayerState());
    if (isPlaying) {
      const state = getPlayerState();
      if (state.currentTrack) {
        dispatch(setNotification({ type: 'success', message: `Playing: "${state.currentTrack.title}"` }));
        setTimeout(() => dispatch(clearNotification()), 2000);
      }
    }
  } catch (error) {
    console.error('Error toggling play state:', error);
    dispatch(setNotification({ type: 'error', message: 'Failed to toggle playback' }));
    setTimeout(() => dispatch(clearNotification()), 3000);
  }
};

export const playNextTrack = () => (dispatch: AppDispatch) => {
  try {
    const nextTrack = playNextTrackAPI();
    dispatch(fetchPlayerState());
    if (nextTrack) {
      dispatch(setNotification({ type: 'success', message: `Now playing: "${nextTrack.title}"` }));
      setTimeout(() => dispatch(clearNotification()), 3000);
    } 
  } catch (error) {
    console.error('Error playing next track:', error);
    dispatch(setNotification({ type: 'error', message: 'Failed to play next track' }));
    setTimeout(() => dispatch(clearNotification()), 3000);
  }
};

export const playPreviousTrack = () => (dispatch: AppDispatch) => {
  try {
    playPreviousTrackAPI();
    dispatch(fetchPlayerState());
    
    // Check if we have a current track after resetting
    const state = getPlayerState();
    if (state.currentTrack) {
      dispatch(setNotification({ type: 'success', message: `Restarted: "${state.currentTrack.title}"` }));
      setTimeout(() => dispatch(clearNotification()), 2000);
    }
  } catch (error) {
    console.error('Error playing previous track:', error);
    dispatch(setNotification({ type: 'error', message: 'Failed to play previous track' }));
    setTimeout(() => dispatch(clearNotification()), 3000);
  }
};

export const skipForward = (seconds: number) => (dispatch: AppDispatch) => {
  try {
    skipForwardAPI(seconds);
    dispatch(fetchPlayerState());
  } catch (error) {
    console.error('Error skipping forward:', error);
    dispatch(setNotification({ type: 'error', message: 'Failed to skip forward' }));
    setTimeout(() => dispatch(clearNotification()), 3000);
  }
};

export const skipBackward = (seconds: number) => (dispatch: AppDispatch) => {
  try {
    skipBackwardAPI(seconds);
    dispatch(fetchPlayerState());
  } catch (error) {
    console.error('Error skipping backward:', error);
    dispatch(setNotification({ type: 'error', message: 'Failed to skip backward' }));
    setTimeout(() => dispatch(clearNotification()), 3000);
  }
};

export const setVolumeLevel = (volume: number) => (dispatch: AppDispatch) => {
  try {
    setVolume(volume);
    dispatch(fetchPlayerState());
  } catch (error) {
    console.error('Error setting volume:', error);
    dispatch(setNotification({ type: 'error', message: 'Failed to set volume' }));
    setTimeout(() => dispatch(clearNotification()), 3000);
  }
};

export const clearQueue = () => (dispatch: AppDispatch) => {
  try {
    clearQueueAPI();
    dispatch(fetchPlayerState());
    dispatch(setNotification({ type: 'success', message: 'Queue cleared' }));
    setTimeout(() => dispatch(clearNotification()), 3000);
  } catch (error) {
    console.error('Error clearing queue:', error);
    dispatch(setNotification({ type: 'error', message: 'Failed to clear queue' }));
    setTimeout(() => dispatch(clearNotification()), 3000);
  }
};

export default playerSlice.reducer;