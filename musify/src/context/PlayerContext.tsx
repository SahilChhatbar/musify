import { createContext, useContext, ReactNode } from "react";
import { Track, PlayerContextProps } from "../types/index";
import * as audioService from "../services/audioServices";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { useNotification } from "../hooks/useNotification";

const PlayerContext = createContext<PlayerContextProps | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const { playerState } = useAudioPlayer();
  const { notification, showNotification } = useNotification();

  const playTrack = (track: Track) => {
    audioService.playTrack(track);
  };

  const queueTrack = (track: Track) => {
    audioService.queueTrack(track);
    showNotification("success", `"${track.title}" added to queue`);
  };

  const togglePlay = () => {
    const isPlaying = audioService.togglePlay();
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
      showNotification("success", `Now playing: "${nextTrack.title}"`);
    }
    return nextTrack;
  };

  const playPreviousTrack = () => {
    audioService.playPreviousTrack();
  };

  const setVolume = (volume: number) => {
    return audioService.setVolume(volume);
  };

  const clearQueue = () => {
    audioService.clearQueue();
    showNotification("success", "Queue cleared");
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