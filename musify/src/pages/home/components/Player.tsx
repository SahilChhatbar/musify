import { useState, useEffect } from "react";
import {
  Group,
  Stack,
  Title,
  Text,
  ActionIcon,
  Paper,
  Slider,
  Image,
  Button,
} from "@mantine/core";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerTrackNext,
  IconPlayerTrackPrev,
  IconPlayerSkipForward,
  IconPlayerSkipBack,
  IconVolume,
  IconVolumeOff,
  IconPlaylist,
  IconSearch,
  IconPlus,
} from "@tabler/icons-react";
import { Track, MusicPlayerProps } from "../../../types/types";
import useAudioPlayer from "../../../hooks/useAudioPlayer";
import * as audioService from "../../../services/audioServices";

const MusicPlayer = ({ onSearch }: MusicPlayerProps) => {
  const { playerState, showNotification } = useAudioPlayer();
  const [isMuted, setIsMuted] = useState(false);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const duration = playerState.currentTrack?.duration
    ? Math.min(30, playerState.currentTrack.duration)
    : 30;

  const handlePlayPause = () => {
    const isPlaying = audioService.togglePlay();
    if (isPlaying && playerState.currentTrack) {
      showNotification('success', `Playing: "${playerState.currentTrack.title}"`);
    }
  };

  const handleSkipForward = () => {
    audioService.skipForward(5);
  };

  const handleSkipBackward = () => {
    audioService.skipBackward(5);
  };

  const handleNextTrack = () => {
    const nextTrack = audioService.playNextTrack();
    if (nextTrack) {
      showNotification('success', `Now playing: "${nextTrack.title}"`);
    }
  };

  const handlePreviousTrack = () => {
    audioService.playPreviousTrack();
    if (playerState.currentTrack) {
      showNotification('success', `Restarted: "${playerState.currentTrack.title}"`);
    }
  };

  const handleVolumeChange = (value: number) => {
    audioService.setVolume(value / 100);
    setIsMuted(value === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      audioService.setVolume(playerState.volume > 0 ? playerState.volume : 1);
      setIsMuted(false);
    } else {
      audioService.setVolume(0);
      setIsMuted(true);
    }
  };

  const handleAddToQueue = () => {
    if (playerState.currentTrack) {
      audioService.forceQueueTrack(playerState.currentTrack);
      showNotification('success', `"${playerState.currentTrack.title}" added to queue`);
    }
  };

  useEffect(() => {
    setIsMuted(playerState.volume === 0);
  }, [playerState.volume]);

  return (
    <Paper p="md" radius="md" className="bg-gray-900 border border-gray-800">
      <Stack gap="md">
        <Group justify="apart">
          <Group>
            {playerState.currentTrack ? (
              <>
                <Image
                  src={
                    playerState.currentTrack.album.cover_small ||
                    "/api/placeholder/60/60"
                  }
                  width={60}
                  height={60}
                  radius="md"
                  alt={playerState.currentTrack.title}
                />
                <Stack>
                  <Text
                    size="sm"
                    c="dark"
                    fw={500}
                    className="truncate max-w-xs"
                  >
                    {playerState.currentTrack.title}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {playerState.currentTrack.artist.name}
                  </Text>
                </Stack>
              </>
            ) : (
              <Group>
                <Stack>
                  <Text size="sm">No track playing</Text>
                  <Text size="xs" c="dimmed">
                    Select a track to play
                  </Text>
                </Stack>
              </Group>
            )}
          </Group>
          {playerState.queue.length > 0 && (
            <Group>
              <IconPlaylist size={16} />
              <Text size="xs" c="dimmed">
                {playerState.queue.length} in queue
              </Text>
            </Group>
          )}
        </Group>
        <Group justify="apart" gap="xs">
          <Text size="xs" c="dimmed" w={40} ta="right">
            {formatTime(playerState.currentTime)}
          </Text>
          <Slider
            value={(playerState.currentTime / duration) * 100}
            className="flex-1"
            size="xs"
          />
          <Text size="xs" c="dimmed" w={40}>
            {formatTime(duration)}
          </Text>
        </Group>
        <Group justify="center" gap="md">
          <ActionIcon
            size="md"
            variant="transparent"
            onClick={handlePreviousTrack}
            title="Previous track"
          >
            <IconPlayerTrackPrev size={22} />
          </ActionIcon>
          <ActionIcon
            size="md"
            variant="transparent"
            onClick={handleSkipBackward}
            title="Back 5 seconds"
          >
            <IconPlayerSkipBack size={22} />
          </ActionIcon>
          <ActionIcon
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
            radius="xl"
            onClick={handlePlayPause}
            title={playerState.isPlaying ? "Pause" : "Play"}
          >
            {playerState.isPlaying ? (
              <IconPlayerPause size={26} />
            ) : (
              <IconPlayerPlay size={26} className="ml-1" />
            )}
          </ActionIcon>
          <ActionIcon
            size="md"
            variant="transparent"
            onClick={handleSkipForward}
            title="Forward 5 seconds"
          >
            <IconPlayerSkipForward size={22} />
          </ActionIcon>
          <ActionIcon
            size="md"
            variant="transparent"
            onClick={handleNextTrack}
            title="Next track"
          >
            <IconPlayerTrackNext size={22} />
          </ActionIcon>
        </Group>
        <Group justify="center">
          <Group gap="xs">
            <ActionIcon
              onClick={toggleMute}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <IconVolumeOff size={18} /> : <IconVolume size={18} />}
            </ActionIcon>
            <Slider
              value={playerState.volume * 100}
              onChange={(value) => handleVolumeChange(value)}
              size="xs"
              className="w-24"
            />
          </Group>
          <Button
            size="xs"
            variant="subtle"
            leftSection={<IconSearch size={16} />}
            onClick={onSearch}
            title="Search for music"
          >
            Search
          </Button>
          <Button
            size="xs"
            variant="subtle"
            leftSection={<IconPlus size={16} />}
            disabled={!playerState.currentTrack}
            onClick={handleAddToQueue}
            title="Add current track to queue"
          >
            Queue
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};

const MusicPlayerDemo = () => {
  const { showNotification } = useAudioPlayer();
  
  const sampleTracks: Track[] = [
    {
      id: 3135556,
      title: "Harder, Better, Faster, Stronger",
      duration: 30,
      preview:
        "https://cdns-preview-d.dzcdn.net/stream/c-deda7fa9316d9e9e880d2c6207e92260-5.mp3",
      artist: {
        id: 27,
        name: "Daft Punk",
        picture: "",
        picture_small: "",
        picture_medium: "",
        picture_big: "",
      },
      album: {
        id: 302127,
        title: "Discovery",
        cover: "",
        cover_small: "",
        cover_medium: "",
        cover_big: "",
      },
      link: "",
    },
    {
      id: 3135557,
      title: "One More Time",
      duration: 30,
      preview:
        "https://cdns-preview-e.dzcdn.net/stream/c-e77d23e0c8ed7567a507a6d1b6a9ca1b-6.mp3",
      artist: {
        id: 27,
        name: "Daft Punk",
        picture: "",
        picture_small: "",
        picture_medium: "",
        picture_big: "",
      },
      album: {
        id: 302127,
        title: "Discovery",
        cover: "",
        cover_small: "",
        cover_medium: "",
        cover_big: "",
      },
      link: "",
    },
  ];
  
  const navigateToSearch = () => {
    window.location.href = "/search";
  };

  const handlePlayTrack = (track: Track) => {
    audioService.playTrack(track);
    showNotification('success', `Now playing: "${track.title}"`);
  };

  const handleQueueAllTracks = () => {
    sampleTracks.forEach(track => audioService.queueTrack(track));
    showNotification('success', `${sampleTracks.length} tracks added to queue`);
  };
  
  return (
    <Stack gap="xl" className="p-4">
      <Title order={2}>Music Player</Title>
      <MusicPlayer onSearch={navigateToSearch} />
      <Title order={3} className="mt-4">
        Test Tracks
      </Title>
      <Group>
        {sampleTracks.map((track) => (
          <Button
            key={track.id}
            onClick={() => handlePlayTrack(track)}
            variant="light"
          >
            Play: {track.title}
          </Button>
        ))}
        <Button
          onClick={handleQueueAllTracks}
          variant="outline"
        >
          Queue All Tracks
        </Button>
      </Group>
    </Stack>
  );
};

export default MusicPlayerDemo;
export { MusicPlayer };