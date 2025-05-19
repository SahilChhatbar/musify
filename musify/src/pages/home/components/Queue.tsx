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
import { usePlayerContext } from "../../../context/PlayerContext";
import { formatTime } from "../../../util/formatTime";

const Queue = () => {
  const {
    playerState,
    notification,
    playTrack,
    togglePlay,
    playNextTrack,
    playPreviousTrack,
    clearQueue,
  } = usePlayerContext();

  const calculateProgress = () => {
    if (!playerState?.currentTrack) return 0;
    return (playerState.currentTime / playerState.currentTrack.duration) * 100;
  };

  return (
    <Container size="lg" className="mb-32">
      <Stack gap="lg">
        {notification && notification.type === "error" && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
            {notification.message}
          </Alert>
        )}
        <Group justify="apart">
          <Title order={2}>Queue</Title>
          {playerState?.queue?.length > 0 && (
            <Button variant="subtle" c="red" onClick={clearQueue}>
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
                        onClick={togglePlay}
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
                      <Text fw={500}>{playerState?.currentTrack?.title}</Text>
                      <Text size="sm" c="dimmed">
                        {playerState?.currentTrack?.artist?.name}
                      </Text>
                    </Stack>
                  </Group>
                  <Group>
                    <Button
                      variant="subtle"
                      onClick={playPreviousTrack}
                      title="Previous"
                    >
                      <IconPlayerSkipBack size={16} />
                    </Button>
                    <Button
                      variant="subtle"
                      onClick={playNextTrack}
                      title="Next"
                    >
                      <IconPlayerSkipForward size={16} />
                    </Button>
                  </Group>
                </Group>
                <Group>
                  <Text size="xs" c="dimmed">
                    {formatTime(playerState?.currentTime)}
                  </Text>
                  <Progress
                    value={calculateProgress()}
                    className="flex-1"
                    size="xs"
                    color="blue"
                  />
                  <Text size="xs" c="dimmed">
                    {formatTime(playerState?.currentTrack?.duration)}
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
                  key={`${item?.track?.id}-${index}`}
                  padding="md"
                  radius="md"
                  className="bg-gray-800 hover:bg-gray-700 transition-cs"
                >
                  <Group justify="apart">
                    <Group>
                      <Text size="sm" c="dimmed" className="w-6">
                        {index + 1}
                      </Text>
                      <Text fw={500}>{item.track.title}</Text>
                      <Text size="sm" c="dimmed">
                        {item?.track?.artist?.name}
                      </Text>
                    </Group>
                    <Group gap="sm">
                      <Text size="sm" c="dimmed">
                        {formatTime(item?.track?.duration)}
                      </Text>
                      <Button
                        variant="subtle"
                        onClick={() => playTrack(item?.track)}
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

export default Queue;
