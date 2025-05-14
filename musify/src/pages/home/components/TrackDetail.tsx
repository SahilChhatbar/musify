import { useEffect, useState } from "react";
import {
  Container,
  Group,
  Title,
  Text,
  Paper,
  Image,
  Stack,
  Button,
  Slider,
  ActionIcon,
  Center,
  Loader,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerSkipForward,
  IconPlayerSkipBack,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-react";
import {
  getTrack,
  playTrack,
  togglePlay,
  skipForward,
  skipBackward,
  getPlayerState,
  setVolume,
} from "../../../api/deezerAPI";

const TrackDetail = () => {
  const { trackId } = useParams<{ trackId: string }>();
  const navigate = useNavigate();
  const [playerState, setPlayerState] = useState(getPlayerState());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const {
    data: track,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["track", trackId],
    queryFn: () => getTrack(Number(trackId)),
    enabled: !!trackId,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const state = getPlayerState();
      setPlayerState(state);
      setIsPlaying(state.isPlaying);
      setCurrentTime(state.currentTime);
      setVolumeState(state.volume);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const duration = track?.duration ? Math.min(30, track.duration) : 30;

  const handlePlayPause = () => {
    if (track) {
      if (
        !playerState.currentTrack ||
        playerState.currentTrack.id !== track.id
      ) {
        playTrack(track);
      } else {
        togglePlay();
      }
    }
  };

  const handleSkipForward = () => {
    skipForward(5);
  };

  const handleSkipBackward = () => {
    skipBackward(5);
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    setIsMuted(value === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(volume > 0 ? volume : 1);
      setIsMuted(false);
    } else {
      setVolume(0);
      setIsMuted(true);
    }
  };

  if (isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  if (isError || !track) {
    return (
      <Container>
        <Text c="red">Error loading track details. Please try again.</Text>
        <Button onClick={() => navigate(-1)} variant="light" mt="md">
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container size="lg">
      <Paper p="xl" radius="md" className="bg-gray-800">
        <Group justify="apart" align="flex-start">
          <Image
            src={track.album.cover_big || "/api/placeholder/300/300"}
            width={300}
            height={300}
            radius="md"
            alt={track.title}
          />
          <Stack gap="md" className="flex-1 ml-8">
            <Stack>
              <Text size="sm" c="dimmed">
                TRACK
              </Text>
              <Title order={1}>{track.title}</Title>
              <Group gap="xs" mt="xs">
                <Text size="md">{track.artist.name}</Text>
                <Text size="md" c="dimmed">
                  •
                </Text>
                <Text size="md" c="dimmed">
                  {track.album.title}
                </Text>
              </Group>
            </Stack>
            <Stack>
              <Paper p="lg" radius="md" className="bg-gray-900">
                <Stack gap="md">
                  <Group justify="apart">
                    <Text>{formatTime(currentTime)}</Text>
                    <Text>{formatTime(duration)}</Text>
                  </Group>
                  <Slider
                    value={(currentTime / duration) * 100}
                    disabled
                    className="mt-2"
                  />
                  <Group justify="center" mt="md">
                    <ActionIcon
                      size="lg"
                      variant="transparent"
                      onClick={handleSkipBackward}
                    >
                      <IconPlayerSkipBack size={30} />
                    </ActionIcon>
                    <ActionIcon
                      size="xl"
                      className="bg-blue-600 hover:bg-blue-700"
                      radius="xl"
                      onClick={handlePlayPause}
                    >
                      {isPlaying &&
                      playerState.currentTrack?.id === track.id ? (
                        <IconPlayerPause size={36} />
                      ) : (
                        <IconPlayerPlay size={36} />
                      )}
                    </ActionIcon>
                    <ActionIcon
                      size="lg"
                      variant="transparent"
                      onClick={handleSkipForward}
                    >
                      <IconPlayerSkipForward size={30} />
                    </ActionIcon>
                  </Group>
                  <Group justify="center" className="mt-4">
                    <ActionIcon onClick={toggleMute}>
                      {isMuted ? (
                        <IconVolumeOff size={18} />
                      ) : (
                        <IconVolume size={18} />
                      )}
                    </ActionIcon>
                    <Slider
                      value={volume * 100}
                      onChange={(value) => handleVolumeChange(value / 100)}
                      className="w-32"
                    />
                  </Group>
                </Stack>
              </Paper>
            </Stack>
          </Stack>
        </Group>
      </Paper>
    </Container>
  );
};

export default TrackDetail;
