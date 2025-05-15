export interface Track {
  id: number;
  title: string;
  duration: number;
  preview: string; 
  artist: {
    id: number;
    name: string;
    picture: string;
    picture_small: string;
    picture_medium: string;
    picture_big: string;
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