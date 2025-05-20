import { useState } from "react";
import {
  Container,
  TextInput,
  SimpleGrid,
  Card,
  Image,
  Text,
  Group,
  Button,
  Loader,
  Center,
  Notification,
  Title,
} from "@mantine/core";
import {
  IconSearch,
  IconPlayerPlay,
  IconPlaylistAdd,
  IconCheck,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { searchTracks } from "../../../api/deezerAPI";
import { useDebouncedValue } from "@mantine/hooks";
import { Track } from "../../../types/types";
import { usePlayerContext } from "../../../context/PlayerContext";
import { formatTime } from "../../../util/formatTime";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebouncedValue(searchTerm, 500);

  const { playTrack, queueTrack, notification } = usePlayerContext();

  const { data, isLoading, error } = useQuery({
    queryKey: ["search", debouncedSearchTerm],
    queryFn: () => searchTracks(debouncedSearchTerm),
    enabled: debouncedSearchTerm.length > 1,
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <Container size="lg" mb={10}>
      {notification && (
        <Notification
          title={notification.type === "success" ? "Success" : "Error"}
          icon={
            notification.type === "success" ? <IconCheck size={18} /> : null
          }
          color={notification.type === "success" ? "green" : "red"}
          onClose={() => {}}
           >
          {notification.message}
        </Notification>
      )}
      <Title order={2} className="mb-4 text-white">Search Music</Title>
      <TextInput
        placeholder="Search for tracks, artists, or albums"
        rightSection={<IconSearch size={18} className="text-gray-400" />}
        value={searchTerm}
        onChange={handleSearchChange}
        size="lg"
        radius="md"
        styles={{
          input: {
            backgroundColor: "rgba(30, 31, 48, 0.6)",
            borderColor: "#3b3b4f",
            color: "white"
          }
        }}
      />
      {isLoading && debouncedSearchTerm.length > 1 && (
        <Center className="py-12">
          <Loader color="blue" size="lg" />
        </Center>
      )}
      {error && (
        <Text c="red" className="text-center p-8 bg-gray-800 rounded-lg">
          An error occurred while searching. Please try again.
        </Text>
      )}
      {!isLoading &&
        !error &&
        data?.data?.length === 0 &&
        debouncedSearchTerm.length > 1 && (
          <Center className="py-12">
            <Text c="dimmed" className="text-center p-4">
              No results found for "{debouncedSearchTerm}"
            </Text>
          </Center>
        )}
      {!isLoading && !error && data?.data && data.data.length > 0 && (
        <>
          <Text className="mb-4 text-sm text-gray-400">
            Found {data.data.length} tracks for "{debouncedSearchTerm}"
          </Text>
          <SimpleGrid
            cols={{ base: 1, sm: 2, md: 3 }}
            spacing="lg"
            verticalSpacing="lg"
          >
            {data.data.map((track: Track) => (
              <Card
                key={track.id}
                shadow="md"
                padding="lg"
                radius="md"
                style={{ borderColor: "#3b3b4f" }}
              >
                <Card.Section>
                  <Image
                    src={track?.album?.cover_medium || "/api/placeholder/300/300"}
                    height={180}
                    alt={track?.title}
                   />
                </Card.Section>
                <Group justify="apart" mt="md" mb="xs">
                  <Text fw={600} lineClamp={1} className="text-white">
                    {track?.title}
                  </Text>
                </Group>
                <Text size="sm" c="dimmed" lineClamp={1} className="mb-4">
                  {track?.artist?.name}
                </Text>
                <Group justify="space-between" mt="md">
                  <Text size="sm" c="dimmed" className="bg-gray-700 px-2 py-1 rounded">
                    {formatTime(track?.duration)}
                  </Text>
                  <Group>
                    <Button
                      leftSection={<IconPlayerPlay size={16} />}
                      variant="filled"
                      color="blue"
                      onClick={() => playTrack(track)}
                      >
                      Play
                    </Button>
                    <Button
                      leftSection={<IconPlaylistAdd size={16} />}
                      variant="subtle"
                      onClick={() => queueTrack(track)}
                   >
                      Queue
                    </Button>
                  </Group>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        </>
      )}
    </Container>
  );
};

export default Search;