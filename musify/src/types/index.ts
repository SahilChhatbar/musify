export interface Track {
  id: number;
  title: string;
  duration: number;
  preview: string;
  artist: {
    id: number;
    name: string;
  };
  album: {
    id: number;
    title: string;
    cover: string;
    cover_small: string;
    cover_medium: string;
    cover_big: string;
  };
  link: string;
}

export interface SearchResult {
  data: Track[];
  total: number;
  next?: string;
}

export interface QueueItem {
  track: Track;
  queuedAt: Date;
}

export interface PlayerState {
  currentTrack: Track | null;
  queue: QueueItem[];
  isPlaying: boolean;
  currentTime: number;
  volume: number;
}

export interface MusicPlayerProps {
  onSearch?: () => void;
}

export interface NotificationProps {
  type: "success" | "error";
  message: string;
  onClose?: () => void;
}

export interface PlayerContextProps {
  playerState: PlayerState;
  playTrack: (track: Track) => void;
  queueTrack: (track: Track) => void;
  togglePlay: () => boolean;
  skipForward: (seconds?: number) => number;
  skipBackward: (seconds?: number) => number;
  playNextTrack: () => Track | null;
  playPreviousTrack: () => void;
  setVolume: (volume: number) => number;
  clearQueue: () => void;
  notification: NotificationProps | null;
  showNotification: (type: "success" | "error", message: string) => void;
}