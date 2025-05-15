import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  getPlayerState, 
  playTrack as playTrackAPI, 
  queueTrack as queueTrackAPI,
  togglePlay as togglePlayAPI,
  playNextTrack as playNextTrackAPI,
  playPreviousTrack as playPreviousTrackAPI,
  clearQueue as clearQueueAPI
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
export const fetchPlayerState = () => (dispatch: any) => {
  try {
    const state = getPlayerState();
    // Add some console logging to debug
    console.log("Fetched player state:", state);
    dispatch(updatePlayerState(state));
  } catch (error) {
    console.error('Error fetching player state:', error);
    dispatch(setNotification({ type: 'error', message: 'Failed to fetch player state' }));
    setTimeout(() => dispatch(clearNotification()), 3000);
  }
};

export const playTrack = (track: Track) => (dispatch: any) => {
  try {
    playTrackAPI(track);
    dispatch(fetchPlayerState());
  } catch (error) {
    console.error('Error playing track:', error);
    dispatch(setNotification({ type: 'error', message: 'Failed to play track' }));
    setTimeout(() => dispatch(clearNotification()), 3000);
  }
};

export const queueTrack = (track: Track) => (dispatch: any) => {
  try {
    console.log("Queueing track:", track);
    queueTrackAPI(track);
    
    // Important: Fetch the updated state after modifying it
    const updatedState = getPlayerState();
    console.log("Updated player state after queueing:", updatedState);
    dispatch(updatePlayerState(updatedState));
    
    dispatch(setNotification({ type: 'success', message: `"${track.title}" added to queue` }));
    setTimeout(() => dispatch(clearNotification()), 3000);
  } catch (error) {
    console.error('Error queueing track:', error);
    dispatch(setNotification({ type: 'error', message: 'Failed to add track to queue' }));
    setTimeout(() => dispatch(clearNotification()), 3000);
  }
};

export const togglePlay = () => (dispatch: any) => {
  try {
    togglePlayAPI();
    dispatch(fetchPlayerState());
  } catch (error) {
    console.error('Error toggling play state:', error);
    dispatch(setNotification({ type: 'error', message: 'Failed to toggle playback' }));
    setTimeout(() => dispatch(clearNotification()), 3000);
  }
};

export const playNextTrack = () => (dispatch: any) => {
  try {
    playNextTrackAPI();
    dispatch(fetchPlayerState());
  } catch (error) {
    console.error('Error playing next track:', error);
    dispatch(setNotification({ type: 'error', message: 'Failed to play next track' }));
    setTimeout(() => dispatch(clearNotification()), 3000);
  }
};

export const playPreviousTrack = () => (dispatch: any) => {
  try {
    playPreviousTrackAPI();
    dispatch(fetchPlayerState());
  } catch (error) {
    console.error('Error playing previous track:', error);
    dispatch(setNotification({ type: 'error', message: 'Failed to play previous track' }));
    setTimeout(() => dispatch(clearNotification()), 3000);
  }
};

export const clearQueue = () => (dispatch: any) => {
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