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
  Title,
} from "@mantine/core";
import {
  IconSearch,
  IconPlayerPlay,
  IconPlaylistAdd,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { searchTracks } from "../../../api/deezerAPI";
import { useDebouncedValue } from "@mantine/hooks";
import { Track } from "../../../types";
import { usePlayerContext } from "../../../context/PlayerContext";
import { formatTime } from "../../../util/formatTime";
import { Notification } from "./Notification";

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
          type={notification.type}
          message={notification.message}
          onClose={() => {}}
        />
      )}
      <Title order={2} c="dark" mb={10}>
        Search Music
      </Title>
      <TextInput
        placeholder="Search for tracks, artists, or albums"
        rightSection={<IconSearch size={18} color="white" />}
        value={searchTerm}
        onChange={handleSearchChange}
        size="lg"
        radius="md"
        mb={20}
        styles={{
          input: {
            backgroundColor: "#393937",
            color: "white",
            borderColor: "#393937",
          },
        }}
      />
      {isLoading && debouncedSearchTerm.length > 1 && (
        <Center className="py-12">
          <Loader color="blue" size="lg" />
        </Center>
      )}
      {error && (
        <Text c="red">
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
          <SimpleGrid
            cols={{ base: 1, sm: 2, md: 3 }}
            spacing="lg"
            verticalSpacing="lg"
            pb="15%"
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
                    src={track?.album?.cover_big || "/api/placeholder/300/300"}
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
                  <Text
                    size="sm"
                    c="dimmed"
                    className="bg-gray-700 px-2 py-1 rounded"
                  >
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