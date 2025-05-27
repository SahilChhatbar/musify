import { Stack, Group, Button } from "@mantine/core";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Stack gap="xl" mb={10}>
      <Group justify="center" className="mt-4">
        <Button 
          variant="filled" 
          color="blue" 
          onClick={() => navigate("/search")}
        >
          Browse Music
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate("/queue")}
        >
          View Queue
        </Button>
      </Group>
    </Stack>
  );
};

export default HomePage;