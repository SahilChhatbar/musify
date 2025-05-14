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
} from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { getPlayerState, playTrack, clearQueue } from "../../../api/deezerAPI";

const QueueComponent = () => {
  const [playerState, setPlayerState] = useState(getPlayerState());

  useEffect(() => {
    const interval = setInterval(() => {
      setPlayerState(getPlayerState());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handlePlayTrack = (trackId: number) => {
    const track = playerState.queue.find(
      (item) => item.track.id === trackId
    )?.track;
    if (track) {
      playTrack(track);
    }
  };

  const handleClearQueue = () => {
    clearQueue();
    setPlayerState(getPlayerState());
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <Container size="lg">
      <Stack gap="lg">
        <Group justify="apart">
          <Title order={2}>Queue</Title>
          {playerState.queue.length > 0 && (
            <Button variant="subtle" c="red" onClick={handleClearQueue}>
              Clear Queue
            </Button>
          )}
        </Group>
        {playerState.currentTrack && (
          <>
            <Title order={4}>Now Playing</Title>
            <Card padding="md" radius="md" className="bg-gray-800">
              <Group justify="apart">
                <Group>
                  <Stack>
                    <IconPlayerPlay size={16} />
                  </Stack>
                  <Stack>
                    <Text fw={500}>{playerState.currentTrack.title}</Text>
                    <Text size="sm" c="dimmed">
                      {playerState.currentTrack.artist.name}
                    </Text>
                  </Stack>
                </Group>
                <Text size="sm" c="dimmed">
                  {formatDuration(playerState.currentTrack.duration)}
                </Text>
              </Group>
            </Card>
          </>
        )}
        {playerState.queue.length > 0 ? (
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
                        onClick={() => handlePlayTrack(item.track.id)}
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
