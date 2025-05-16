import { useState, useEffect } from 'react';
import { 
  addEventListener,
  removeEventListener,
  getPlayerState,
  AudioServiceEvent
} from '../services/audioServices';
import { PlayerState } from '../types/types';

export const useAudioPlayer = () => {
  const [playerState, setPlayerState] = useState<PlayerState>(getPlayerState());
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Handle player state updates
  const handleStateUpdate = () => {
    setPlayerState({...getPlayerState()});
  };

  useEffect(() => {
    // Register event listeners
    const events: AudioServiceEvent[] = [
      'play', 
      'pause', 
      'trackChange', 
      'timeUpdate', 
      'queueUpdate', 
      'volumeChange', 
      'end'
    ];
    
    events.forEach(event => {
      addEventListener(event, handleStateUpdate);
    });

    // Initial state fetch
    setPlayerState({...getPlayerState()});
    
    // Set up polling interval for continuous updates (helpful for timeUpdate)
    const interval = setInterval(() => {
      setPlayerState({...getPlayerState()});
    }, 500);

    // Clean up event listeners and interval on unmount
    return () => {
      events.forEach(event => {
        removeEventListener(event, handleStateUpdate);
      });
      clearInterval(interval);
    };
  }, []);

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    
    // Auto-clear notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  return { playerState, notification, showNotification };
};

export default useAudioPlayer;