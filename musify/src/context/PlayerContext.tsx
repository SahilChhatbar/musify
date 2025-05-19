import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Track, PlayerState, PlayerContextProps } from '../types/types';
import * as audioService from '../services/audioServices';

const PlayerContext = createContext<PlayerContextProps | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [playerState, setPlayerState] = useState<PlayerState>(audioService.getPlayerState());
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleStateUpdate = () => {
    setPlayerState({...audioService.getPlayerState()});
  };

  useEffect(() => {
    const events: audioService.AudioServiceEvent[] = [
      'play', 
      'pause', 
      'trackChange', 
      'timeUpdate', 
      'queueUpdate', 
      'volumeChange', 
      'end'
    ];
    
    events.forEach(event => {
      audioService.addEventListener(event, handleStateUpdate);
    });

    setPlayerState({...audioService.getPlayerState()});
    
    const interval = setInterval(() => {
      setPlayerState({...audioService.getPlayerState()});
    }, 500);

    return () => {
      events.forEach(event => {
        audioService.removeEventListener(event, handleStateUpdate);
      });
      clearInterval(interval);
    };
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const playTrack = (track: Track) => {
    audioService.playTrack(track);
    showNotification('success', `Now playing: "${track.title}"`);
  };

  const queueTrack = (track: Track) => {
    audioService.queueTrack(track);
    showNotification('success', `"${track.title}" added to queue`);
  };

  const togglePlay = () => {
    const isPlaying = audioService.togglePlay();
    if (playerState.currentTrack) {
      const message = isPlaying ? 
        `Playing: "${playerState.currentTrack.title}"` : 
        `Paused: "${playerState.currentTrack.title}"`;
      showNotification('success', message);
    }
    return isPlaying;
  };

  const skipForward = (seconds: number = 5) => {
    return audioService.skipForward(seconds);
  };

  const skipBackward = (seconds: number = 5) => {
    return audioService.skipBackward(seconds);
  };

  const playNextTrack = () => {
    const nextTrack = audioService.playNextTrack();
    if (nextTrack) {
      showNotification('success', `Now playing: "${nextTrack.title}"`);
    }
    return nextTrack;
  };

  const playPreviousTrack = () => {
    audioService.playPreviousTrack();
    if (playerState.currentTrack) {
      showNotification('success', `Restarted: "${playerState.currentTrack.title}"`);
    }
  };

  const setVolume = (volume: number) => {
    return audioService.setVolume(volume);
  };

  const clearQueue = () => {
    audioService.clearQueue();
    showNotification('success', 'Queue cleared');
  };

  const value = {
    playerState,
    playTrack,
    queueTrack,
    togglePlay,
    skipForward,
    skipBackward,
    playNextTrack,
    playPreviousTrack,
    setVolume,
    clearQueue,
    notification,
    showNotification
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayerContext = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayerContext must be used within a PlayerProvider');
  }
  return context;
};