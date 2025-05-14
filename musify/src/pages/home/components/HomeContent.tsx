import { Container, Title, Text, Group, Stack, Card, Image, SimpleGrid } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { searchTracks } from "../../../api/deezerAPI";

const Home = () => {
  const featuredPlaylists = [
    { id: 1, title: "Today's Top Hits", imageUrl: "/api/placeholder/200/200", description: "Top chart-topping tracks" },
    { id: 2, title: "Chill Vibes", imageUrl: "/api/placeholder/200/200", description: "Relax and unwind" },
    { id: 3, title: "Workout Energy", imageUrl: "/api/placeholder/200/200", description: "Keep your motivation high" },
    { id: 4, title: "Throwback Hits", imageUrl: "/api/placeholder/200/200", description: "Classic songs you love" },
  ];

 const { data: recentTracks } = useQuery({
    queryKey: ["tracks", "recent"],
    queryFn: () => searchTracks("popular tracks", 5),
  });

  return (
    <Container size="xl" className="mt-4">
      <Stack gap="xl">
        <Group>
          <Title order={2} className="mb-4">Featured Playlists</Title>
          <SimpleGrid cols={{ base: 1, xs: 1, sm: 2, md: 5 }} spacing="md">
            {featuredPlaylists.map((playlist) => (
              <Card key={playlist.id} padding="lg" radius="md" className="bg-gray-800 hover:bg-gray-700 transition-colors">
                <Card.Section>
                  <Image src={playlist.imageUrl} height={160} alt={playlist.title} />
                </Card.Section>
                <Title order={4} className="mt-3 text-white">{playlist.title}</Title>
                <Text size="sm" c="dimmed">{playlist.description}</Text>
              </Card>
            ))}
          </SimpleGrid>
        </Group>
        <Stack>
          <Title order={2} className="mb-4">Recently Played</Title>
          <SimpleGrid cols={{ base: 1, xs: 1, sm: 2, md: 5 }} spacing="md">
            {recentTracks?.data?.slice(0, 5).map((track) => (
              <Card key={track.id} padding="sm" radius="md" className="bg-gray-800 hover:bg-gray-700 transition-colors flex">
                <Group>
                  <Image src={track.album.cover_medium || "/api/placeholder/24/24"} width={24} height={24} alt={track.title} radius="md" />
                  <Stack>
                    <Text size="md" fw={500}>{track.title}</Text>
                    <Text size="sm" c="dimmed">{track.artist.name}</Text>
                  </Stack>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Stack>
    </Container>
  );
};

export default Home;