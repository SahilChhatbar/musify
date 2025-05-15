import {
  Container,
  Title,
  Text,
  Group,
  Stack,
  Card,
  Button,
  Divider,
  Center,
  Alert,
  Progress,
} from "@mantine/core";
import { 
  IconPlayerPlay, 
  IconPlayerPause, 
  IconAlertCircle,
  IconPlayerSkipForward,
  IconPlayerSkipBack,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { 
  fetchPlayerState,
  playTrack,
  clearQueue,
  togglePlay,
  playNextTrack,
  playPreviousTrack
} from "../../../redux/playerslice";
import { Track } from "../../../types/types";

const QueueComponent = () => {
  const dispatch = useAppDispatch();
  const { playerState, notification } = useAppSelector((state) => state.player);

  useEffect(() => {
    // Initial fetch of player state
    dispatch(fetchPlayerState());
    
    // Set up interval to periodically update player state
    const interval = setInterval(() => {
      dispatch(fetchPlayerState());
    }, 1000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handlePlayTrack = (track: Track) => {
    dispatch(playTrack(track));
  };

  const handleTogglePlay = () => {
    dispatch(togglePlay());
  };

  const handleNextTrack = () => {
    dispatch(playNextTrack());
  };

  const handlePreviousTrack = () => {
    dispatch(playPreviousTrack());
  };

  const handleClearQueue = () => {
    dispatch(clearQueue());
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const calculateProgress = () => {
    if (!playerState?.currentTrack) return 0;
    return (playerState.currentTime / playerState.currentTrack.duration) * 100;
  };

  return (
    <Container size="lg">
      <Stack gap="lg">
        {notification && notification.type === 'error' && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
            {notification.message}
          </Alert>
        )}
      
        <Group justify="apart">
          <Title order={2}>Queue</Title>
          {playerState?.queue?.length > 0 && (
            <Button variant="subtle" c="red" onClick={handleClearQueue}>
              Clear Queue
            </Button>
          )}
        </Group>
        
        {playerState?.currentTrack && (
          <>
            <Title order={4}>Now Playing</Title>
            <Card padding="md" radius="md" className="bg-gray-800">
              <Stack>
                <Group justify="apart">
                  <Group>
                    <Stack>
                      <Button 
                        variant="subtle" 
                        onClick={handleTogglePlay}
                        title={playerState.isPlaying ? "Pause" : "Play"}
                      >
                        {playerState.isPlaying ? (
                          <IconPlayerPause size={16} />
                        ) : (
                          <IconPlayerPlay size={16} />
                        )}
                      </Button>
                    </Stack>
                    <Stack>
                      <Text fw={500}>{playerState.currentTrack.title}</Text>
                      <Text size="sm" c="dimmed">
                        {playerState.currentTrack.artist.name}
                      </Text>
                    </Stack>
                  </Group>
                  <Group>
                    <Button 
                      variant="subtle" 
                      onClick={handlePreviousTrack}
                      title="Previous"
                    >
                      <IconPlayerSkipBack size={16} />
                    </Button>
                    <Button 
                      variant="subtle" 
                      onClick={handleNextTrack}
                      title="Next"
                    >
                      <IconPlayerSkipForward size={16} />
                    </Button>
                  </Group>
                </Group>
                <Group>
                  <Text size="xs" c="dimmed">
                    {formatDuration(playerState.currentTime)}
                  </Text>
                  <Progress 
                    value={calculateProgress()} 
                    className="flex-1"
                    size="xs"
                    color="blue"
                  />
                  <Text size="xs" c="dimmed">
                    {formatDuration(playerState.currentTrack.duration)}
                  </Text>
                </Group>
              </Stack>
            </Card>
          </>
        )}
        
        {playerState?.queue?.length > 0 ? (
          <>
            <Divider />
            <Title order={4}>Next Up</Title>
            <Stack gap="sm">
              {playerState.queue.map((item, index) => (
                <Card
                  key={`${item.track.id}-${index}`}
                  padding="md"
                  radius="md"
                  className="bg-gray-800 hover:bg-gray-700 transition-cs"
                >
                  <Group justify="apart">
                    <Group>
                      <Text size="sm" c="dimmed" className="w-6">
                        {index + 1}
                      </Text>
                      <div>
                        <Text fw={500}>{item.track.title}</Text>
                        <Text size="sm" c="dimmed">
                          {item.track.artist.name}
                        </Text>
                      </div>
                    </Group>
                    <Group gap="sm">
                      <Text size="sm" c="dimmed">
                        {formatDuration(item.track.duration)}
                      </Text>
                      <Button
                        variant="subtle"
                        onClick={() => handlePlayTrack(item.track)}
                        title="Play this track"
                      >
                        <IconPlayerPlay size={16} />
                      </Button>
                    </Group>
                  </Group>
                </Card>
              ))}
            </Stack>
          </>
        ) : (
          <Center>
            <Stack>
              <Text c="dimmed">Your queue is empty</Text>
              <Text size="sm" c="dimmed" className="mt-2">
                Search for tracks and add them to your queue
              </Text>
            </Stack>
          </Center>
        )}
      </Stack>
    </Container>
  );
};

export default QueueComponent;