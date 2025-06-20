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
  ScrollArea,
  Popover,
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
import { MusicPlayerProps } from "../../../types/index";
import { usePlayerContext } from "../../../context/PlayerContext";
import { formatTime } from "../../../util/formatTime";
import { useNavigate } from "react-router";
import { getLyrics } from "../../../api/deezerAPI";

const Player = ({ onSearch }: MusicPlayerProps) => {
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
  const [currentTrackId, setCurrentTrackId] = useState<number | null>(null);
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
      if (
        playerState?.currentTrack &&
        playerState.currentTrack.id !== currentTrackId
      ) {
        setCurrentTrackId(playerState.currentTrack.id);
        const newLyrics = await getLyrics(
          playerState.currentTrack.artist.name,
          playerState.currentTrack.title
        );
        setLyrics(newLyrics);
      }
    };
    fetchLyrics();
  }, [playerState?.currentTrack?.id]);

  return (
    <Paper p="md" radius="md" w="80.25%" mx="auto" bg="#393937" c="white">
      <Group justify="between" align="start">
        <Group>
          {playerState?.currentTrack ? (
            <>
              <Image
                src={
                  playerState?.currentTrack?.album?.cover_medium ||
                  "/api/placeholder/60/100"
                }
                width={60}
                height={100}
                radius="md"
                alt={playerState?.currentTrack?.title}
              />
              <Stack gap="xs">
                <Text size="sm" fw={600}>
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
            >
              <IconPlayerTrackPrev size={22} />
            </ActionIcon>
            <ActionIcon
              size="md"
              variant="transparent"
              onClick={() => skipBackward(5)}
            >
              <IconPlayerSkipBack size={22} />
            </ActionIcon>
            <ActionIcon size="lg" radius="xl" onClick={togglePlay}>
              {playerState?.isPlaying ? (
                <IconPlayerPause size={26} />
              ) : (
                <IconPlayerPlay size={26} />
              )}
            </ActionIcon>
            <ActionIcon
              size="md"
              variant="transparent"
              onClick={() => skipForward(5)}
            >
              <IconPlayerSkipForward size={22} />
            </ActionIcon>
            <ActionIcon size="md" variant="transparent" onClick={playNextTrack}>
              <IconPlayerTrackNext size={22} />
            </ActionIcon>
          </Group>
          <Group justify="center">
            <Group gap="xs" align="center">
              <ActionIcon onClick={toggleMute}>
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
              />
            </Group>
            <Button
              size="xs"
              variant="subtle"
              leftSection={<IconSearch size={16} />}
              onClick={onSearch}
            >
              Search
            </Button>
            <Button
              size="xs"
              variant="subtle"
              leftSection={<IconPlaylist size={16} />}
              onClick={() => navigate("/queue")}
            >
              Queue ({playerState.queue.length})
            </Button>
            <Button
              size="xs"
              variant="subtle"
              onClick={() => setShowLyrics(!showLyrics)}
            >
              <Popover
                opened={showLyrics}
                position="top"
                width="30%"
              >
                <Popover.Target>
                  <span>Lyrics</span>
                </Popover.Target>
                <Popover.Dropdown>
                  <ScrollArea h={200}>
                    <Text style={{ whiteSpace: "pre-wrap" }}>{lyrics}</Text>
                  </ScrollArea>
                </Popover.Dropdown>
              </Popover>
            </Button>
          </Group>
        </Stack>
      </Group>
    </Paper>
  );
};

export default Player;
