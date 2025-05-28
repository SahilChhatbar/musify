import { Stack, Group, Button, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Stack gap="xl" mb={10}>
      <Title order={1} c="dark" ta="center">
        Discover Music
      </Title>
      <Group justify="center">
        <Button
          variant="filled"
          color="blue"
          onClick={() => navigate("/search")}
        >
          Browse Music
        </Button>
        <Button variant="outline" onClick={() => navigate("/queue")}>
          View Queue
        </Button>
      </Group>
    </Stack>
  );
};

export default HomePage;
