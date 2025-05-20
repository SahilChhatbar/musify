import { useState, useEffect } from "react";
import {
  Group,
  Stack,
  Text,
  ActionIcon,
  Paper,
  Slider,
  Image,
  Button,
  Badge,
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
} from "@tabler/icons-react";
import { MusicPlayerProps } from "../../../types/types";
import { usePlayerContext } from "../../../context/PlayerContext";
import { formatTime } from "../../../util/formatTime";

const MusicPlayer = ({ onSearch }: MusicPlayerProps) => {
  const {
    playerState,
    togglePlay,
    skipForward,
    skipBackward,
    playNextTrack,
    playPreviousTrack,
    setVolume,
  } = usePlayerContext();

  const [isMuted, setIsMuted] = useState(false);

  const duration = playerState.currentTrack?.duration
    ? Math.min(30, playerState.currentTrack.duration)
    : 30;

  const handleVolumeChange = (value: number) => {
    setVolume(value / 100);
    setIsMuted(value === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(playerState.volume > 0 ? playerState.volume : 1);
      setIsMuted(false);
    } else {
      setVolume(0);
      setIsMuted(true);
    }
  };

  useEffect(() => {
    setIsMuted(playerState.volume === 0);
  }, [playerState.volume]);

  return (
    <Paper 
      p="md" 
      radius="md" 
      w={1110}
      mx="auto"
      bg="dark"
      c="white"
    >
      <Stack gap="md">
        <Group justify="apart" className="pb-1">
          <Group>
            {playerState?.currentTrack ? (
              <>
                <Image
                  src={
                    playerState?.currentTrack?.album?.cover_small ||
                    "/api/placeholder/60/60"
                  }
                  width={60}
                  height={60}
                  radius="md"
                  alt={playerState?.currentTrack?.title}
                 />
                <Stack gap="xs">
                  <Text size="sm" fw={600} className="truncate max-w-xs">
                    {playerState?.currentTrack?.title}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {playerState?.currentTrack?.artist?.name}
                  </Text>
                </Stack>
              </>
            ) : (
              <Group>
                <Stack gap="xs">
                  <Text size="sm" fw={500}>No track playing</Text>
                  <Text size="xs" c="dimmed">
                    Select a track to play
                  </Text>
                </Stack>
              </Group>
            )}
          </Group>
          {playerState.queue.length > 0 && (
            <Group>
              <IconPlaylist size={16}  />
              <Badge size="sm" radius="sm" color="blue" variant="light">
                {playerState?.queue?.length} in queue
              </Badge>
            </Group>
          )}
        </Group>
        <Group justify="apart" gap="xs">
          <Text size="xs" c="dimmed" w={40} ta="right">
            {formatTime(playerState?.currentTime)}
          </Text>
          <Slider
            value={(playerState?.currentTime / duration) * 100}
            className="flex-1"
            color="blue"
          />
          <Text size="xs" c="dimmed" w={40}>
            {formatTime(duration)}
          </Text>
        </Group>
        <Group justify="center" gap="md">
          <ActionIcon
            size="md"
            variant="transparent"
            onClick={playPreviousTrack}
            title="Previous track"
            >
            <IconPlayerTrackPrev size={22} />
          </ActionIcon>
          <ActionIcon
            size="md"
            variant="transparent"
            onClick={() => skipBackward(5)}
            title="Back 5 seconds"
           >
            <IconPlayerSkipBack size={22} />
          </ActionIcon>
          <ActionIcon
            size="lg"
            radius="xl"
            onClick={togglePlay}
            title={playerState?.isPlaying ? "Pause" : "Play"}
          >
            {playerState?.isPlaying ? (
              <IconPlayerPause size={26} className="text-white" />
            ) : (
              <IconPlayerPlay size={26} className="text-white" />
            )}
          </ActionIcon>
          <ActionIcon
            size="md"
            variant="transparent"
            onClick={() => skipForward(5)}
            title="Forward 5 seconds"
            >
            <IconPlayerSkipForward size={22} />
          </ActionIcon>
          <ActionIcon
            size="md"
            variant="transparent"
            onClick={playNextTrack}
            title="Next track"
            >
            <IconPlayerTrackNext size={22} />
          </ActionIcon>
        </Group>
        <Group justify="center" className="pt-1">
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
              color="blue"
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
            leftSection={<IconPlaylist size={16} />}
            onClick={() => (window.location.href = "/queue")}
            >
            Queue ({playerState.queue.length})
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};

export default MusicPlayer;