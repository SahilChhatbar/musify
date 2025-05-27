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
  Progress,
  Box,
} from "@mantine/core";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerSkipForward,
  IconPlayerSkipBack,
  IconPlaylistX,
  IconMusic,
} from "@tabler/icons-react";
import { usePlayerContext } from "../../../context/PlayerContext";
import { formatTime } from "../../../util/formatTime";
import { useNavigate } from "react-router";
import { Notification } from "./Notification";

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

  const navigate = useNavigate();

  const calculateProgress = () => {
    if (!playerState?.currentTrack) return 0;
    const duration = Math.min(30, playerState.currentTrack.duration || 30);
    return (playerState.currentTime / duration) * 100;
  };

  return (
    <Container size="lg">
      <Stack gap="lg">
        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => {}}
          />
        )}
        <Group justify="space-between">
          <Title order={2} c="dark">Your Queue</Title>
          {playerState?.queue?.length > 0 && (
            <Button
              variant="subtle"
              color="red"
              onClick={clearQueue}
              leftSection={<IconPlaylistX size={16} />}
            >
              Clear Queue
            </Button>
          )}
        </Group>
        {playerState?.currentTrack && (
          <Box>
            <Title order={4} c="dark" mb={10}>Now Playing</Title>
            <Card padding="md" radius="md">
              <Stack>
                <Group justify="space-between">
                  <Group>
                    <Button
                      variant="light"
                      color="blue"
                      onClick={togglePlay}
                      radius="xl"
                      size="sm"
                    >
                      {playerState.isPlaying ? (
                        <IconPlayerPause size={16} />
                      ) : (
                        <IconPlayerPlay size={16} />
                      )}
                    </Button>
                    <Stack gap="xs">
                      <Text fw={600}>{playerState?.currentTrack?.title}</Text>
                      <Text size="sm" c="dimmed">
                        {playerState?.currentTrack?.artist?.name}
                      </Text>
                    </Stack>
                  </Group>
                  <Group>
                    <Button variant="subtle" onClick={playPreviousTrack}>
                      <IconPlayerSkipBack size={16} />
                    </Button>
                    <Button variant="subtle" onClick={playNextTrack}>
                      <IconPlayerSkipForward size={16} />
                    </Button>
                  </Group>
                </Group>
                <Group className="pt-2" grow>
                  <Text size="xs" c="dimmed" w={40} ta="right">
                    {formatTime(playerState?.currentTime)}
                  </Text>
                  <Progress
                    value={calculateProgress()}
                    size="md"
                    color="blue"
                    radius="xl"
                  />
                  <Text size="xs" c="dimmed" w={40}>
                    {formatTime(
                      Math.min(30, playerState?.currentTrack?.duration)
                    )}
                  </Text>
                </Group>
              </Stack>
            </Card>
          </Box>
        )}
        {playerState?.queue?.length > 0 ? (
          <Box mb={10}>
            <Divider color="white"/>
            <Title order={4} mt={10} c="dark" mb={10}>
              Next Up
            </Title>
            <Stack gap="md" pb={150}>
              {playerState.queue.map((item, index) => (
                <Card
                  key={`${item?.track?.id}-${index}`}
                  padding="md"
                  radius="md"
                  shadow="md"
                >
                  <Group justify="space-between">
                    <Group>
                      <Text size="sm">{index + 1}</Text>
                      <Stack gap="xs">
                        <Text fw={500}>{item.track.title}</Text>
                        <Text size="sm" c="dimmed">
                          {item?.track?.artist?.name}
                        </Text>
                      </Stack>
                    </Group>
                    <Group gap="sm">
                      <Text size="sm" c="dimmed">
                        {formatTime(item?.track?.duration)}
                      </Text>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() => playTrack(item?.track)}
                        radius="xl"
                        size="sm"
                      >
                        <IconPlayerPlay size={16} />
                      </Button>
                    </Group>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Box>
        ) : (
          <Center mb={10}>
            <Stack align="center">
              <IconMusic size={48} className="text-gray-600 mb-2" />
              <Text c="dimmed" fw={500}>
                Your queue is empty
              </Text>
              <Text size="sm" c="dimmed">
                Search for tracks and add them to your queue
              </Text>
              <Button
                variant="light"
                color="blue"
                onClick={() => navigate("/search")}
              >
                Browse Music
              </Button>
            </Stack>
          </Center>
        )}
      </Stack>
    </Container>
  );
};

export default Queue;