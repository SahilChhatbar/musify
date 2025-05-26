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
import { MusicPlayerProps } from "../../../types";
import { usePlayerContext } from "../../../context/PlayerContext";
import { formatTime } from "../../../util/formatTime";
import { useNavigate } from "react-router";
import { Tooltip } from "@mantine/core";
import { getLyrics } from "../../../api/deezerAPI";

const MusicPlayer = ({ onSearch }: MusicPlayerProps) => {
  const navigate = useNavigate();
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
  const [sliderValue, setSliderValue] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const [lyrics, setLyrics] = useState<string>("Loading lyrics...");
  const [showLyrics, setShowLyrics] = useState(false);

  const duration = playerState.currentTrack?.duration
    ? Math.min(30, playerState.currentTrack.duration)
    : 30;

  useEffect(() => {
    if (!isDragging && playerState?.currentTrack) {
      const percentage = (playerState.currentTime / duration) * 100;
      setSliderValue(percentage);
    }
  }, [playerState.currentTime, duration, isDragging]);

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

  const handleTimeChange = (value: number) => {
    const newTime = (value / 100) * duration;
    if (playerState?.currentTrack) {
      skipForward(newTime - playerState.currentTime);
    }
  };

  useEffect(() => {
    setIsMuted(playerState.volume === 0);
  }, [playerState.volume]);

  useEffect(() => {
    const fetchLyrics = async () => {
      if (playerState?.currentTrack) {
        const newLyrics = await getLyrics(
          playerState.currentTrack.artist.name,
          playerState.currentTrack.title
        );
        setLyrics(newLyrics);
      }
    };

    fetchLyrics();
  }, [playerState?.currentTrack]);

  return (
    <Paper p="md" radius="md" w={1110} mx="auto" bg="dark" c="white">
      <Group justify="between" align="start">
        <Group p={0}>
          {playerState?.currentTrack ? (
            <>
              <Image
                src={
                  playerState?.currentTrack?.album?.cover_medium ||
                  "/api/placeholder/60/100"
                }
                width={20}
                height={100}
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
                <Text size="sm" fw={500}>
                  No track playing
                </Text>
                <Text size="xs" c="dimmed">
                  Select a track to play
                </Text>
              </Stack>
            </Group>
          )}
        </Group>
        <Stack gap="md" flex={1} my="auto">
          <Group justify="apart" gap="xs" w="100%">
            <Text size="xs" c="dimmed" w={40} ta="right">
              {formatTime(playerState?.currentTime)}
            </Text>
            <Slider
              value={sliderValue}
              label={formatTime(playerState?.currentTime)}
              onChange={(value) => {
                setIsDragging(true);
                setSliderValue(value);
              }}
              onChangeEnd={(value) => {
                setIsDragging(false);
                handleTimeChange(value);
              }}
              w="85%"
              color="blue"
              size="sm"
              radius="xl"
              min={0}
              mx="auto"
              max={100}
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
              title="Previous track (Shift+←)"
            >
              <IconPlayerTrackPrev size={22} />
            </ActionIcon>
            <ActionIcon
              size="md"
              variant="transparent"
              onClick={() => skipBackward(5)}
              title="Back 5 seconds (←)"
            >
              <IconPlayerSkipBack size={22} />
            </ActionIcon>
            <ActionIcon
              size="lg"
              radius="xl"
              onClick={togglePlay}
              title={playerState?.isPlaying ? "Pause (Space)" : "Play (Space)"}
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
              title="Forward 5 seconds (→)"
            >
              <IconPlayerSkipForward size={22} />
            </ActionIcon>
            <ActionIcon
              size="md"
              variant="transparent"
              onClick={playNextTrack}
              title="Next track (Shift+→)"
            >
              <IconPlayerTrackNext size={22} />
            </ActionIcon>
          </Group>
          <Group justify="center">
            <Group gap="xs" align="center">
              <ActionIcon
                onClick={toggleMute}
                title={isMuted ? "Unmute (M)" : "Mute (M)"}
              >
                {isMuted ? (
                  <IconVolumeOff size={18} />
                ) : (
                  <IconVolume size={18} />
                )}
              </ActionIcon>
              <Slider
                value={playerState.volume * 100}
                onChange={(value) => handleVolumeChange(value)}
                color="blue"
                size="sm"
                radius="xl"
                w={80}
                min={0}
                max={100}
                step={1}
                title="Volume (↑↓)"
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
              onClick={() => navigate("/queue")}
              title="Queue"
            >
              Queue ({playerState.queue.length})
            </Button>
            <Button
              size="xs"
              variant="subtle"
              onClick={() => setShowLyrics(!showLyrics)}
              title="Show/Hide Lyrics"
            >
              <Tooltip
                opened={showLyrics}
                position="top"
                w={500}
                style={{
                  whiteSpace: "preserve-breaks",
                }}
                label={lyrics}
              >
                <span>Lyrics</span>
              </Tooltip>
            </Button>
          </Group>
        </Stack>
      </Group>
    </Paper>
  );
};

export default MusicPlayer;
