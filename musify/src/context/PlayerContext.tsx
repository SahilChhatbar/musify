import { createContext, useContext, ReactNode, useState, useCallback } from "react";
import { Track, PlayerContextProps, NotificationProps } from "../types";
import * as audioService from "../services/audioServices";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

const PlayerContext = createContext<PlayerContextProps | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const { playerState } = useAudioPlayer();
  const [notification, setNotification] = useState<NotificationProps | null>(null);

  const showNotification = useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const playTrack = useCallback((track: Track) => {
    audioService.playTrack(track);
  }, []);

  const queueTrack = useCallback((track: Track) => {
    audioService.queueTrack(track);
    showNotification("success", `"${track.title}" added to queue`);
  }, [showNotification]);

  const togglePlay = useCallback(() => {
    return audioService.togglePlay();
  }, []);

  const skipForward = useCallback((seconds: number = 5) => {
    return audioService.skipForward(seconds);
  }, []);

  const skipBackward = useCallback((seconds: number = 5) => {
    return audioService.skipBackward(seconds);
  }, []);

  const playNextTrack = useCallback(() => {
    const nextTrack = audioService.playNextTrack();
    if (nextTrack) {
      showNotification("success", `Now playing: "${nextTrack.title}"`);
    }
    return nextTrack;
  }, [showNotification]);

  const playPreviousTrack = useCallback(() => {
    audioService.playPreviousTrack();
  }, []);

  const setVolume = useCallback((volume: number) => {
    return audioService.setVolume(volume);
  }, []);

  const clearQueue = useCallback(() => {
    audioService.clearQueue();
    showNotification("success", "Queue cleared");
  }, [showNotification]);

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
    showNotification,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
};

export const usePlayerContext = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayerContext must be used within a PlayerProvider");
  }
  return context;
};
