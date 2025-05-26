import { useState, useEffect } from 'react';
import { 
  addEventListener,
  removeEventListener,
  getPlayerState,
  AudioServiceEvent
} from '../services/audioServices';
import { PlayerState } from '../types';

export const useAudioPlayer = () => {
  const [playerState, setPlayerState] = useState<PlayerState>(getPlayerState());
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleStateUpdate = () => {
    setPlayerState({...getPlayerState()});
  };

  useEffect(() => {
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

    setPlayerState({...getPlayerState()});
    
    const interval = setInterval(() => {
      setPlayerState({...getPlayerState()});
    }, 500);

    return () => {
      events.forEach(event => {
        removeEventListener(event, handleStateUpdate);
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

  return { playerState, notification, showNotification };
};

export default useAudioPlayer;