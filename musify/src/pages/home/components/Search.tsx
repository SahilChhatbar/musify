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
} from "@mantine/core";
import {
  IconSearch,
  IconPlayerPlay,
  IconPlaylistAdd,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { searchTracks, playTrack, queueTrack } from "../../../api/deezerAPI";
import { useDebouncedValue } from "@mantine/hooks";
import { Track } from "../../../types/types";

const SearchTrackComponent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebouncedValue(searchTerm, 500);

  const { data, isLoading, error } = useQuery({
    queryKey: ["search", debouncedSearchTerm],
    queryFn: () => searchTracks(debouncedSearchTerm),
    enabled: debouncedSearchTerm.length > 1,
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handlePlayTrack = (track: Track) => {
    playTrack(track);
  };

  const handleQueueTrack = (track: Track) => {
    queueTrack(track);
  };

  return (
    <Container size="lg">
      <TextInput
        placeholder="Search for tracks, artists, or albums"
        rightSection={<IconSearch size={16} />}
        value={searchTerm}
        onChange={handleSearchChange}
        className="mb-4"
        size="md"
      />
      {isLoading && debouncedSearchTerm.length > 1 && (
        <Center>
          <Loader />
        </Center>
      )}
      {error && (
        <Text c="red" className="text-center p-4">
          An error occurred while searching. Please try again.
        </Text>
      )}
      {!isLoading &&
        !error &&
        data?.data?.length === 0 &&
        debouncedSearchTerm.length > 1 && (
          <Text c="dimmed" className="text-center p-4">
            No results found for "{debouncedSearchTerm}"
          </Text>
        )}
      {!isLoading && !error && data?.data && data.data.length > 0 && (
        <SimpleGrid
          cols={{ base: 1, sm: 2, md: 3 }}
          spacing="md"
          verticalSpacing="md"
        >
          {data.data.map((track: Track) => (
            <Card
              key={track.id}
              shadow="sm"
              padding="lg"
              radius="md"
              className="bg-gray-800 hover:bg-gray-700 transition-cs"
            >
              <Card.Section>
                <Image
                  src={track.album.cover_medium || "/api/placeholder/300/300"}
                  height={160}
                  alt={track.title}
                />
              </Card.Section>
              <Group justify="apart" mt="md" mb="xs">
                <Text fw={500} lineClamp={1}>
                  {track.title}
                </Text>
              </Group>
              <Text size="sm" c="dimmed" lineClamp={1}>
                {track.artist.name}
              </Text>
              <Group justify="apart" mt="md">
                <Button
                  leftSection={<IconPlayerPlay size={16} />}
                  variant="light"
                  c="blue"
                  onClick={() => handlePlayTrack(track)}
                >
                  Play
                </Button>
                <Button
                  leftSection={<IconPlaylistAdd size={16} />}
                  variant="subtle"
                  onClick={() => handleQueueTrack(track)}
                >
                  Queue
                </Button>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
};

export default SearchTrackComponent;
