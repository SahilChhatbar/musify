import { Stack, Group, Button } from "@mantine/core";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  const handleSearchClick = () => {
    navigate("/search");
  };
  
  const handleQueueClick = () => {
    navigate("/queue");
  };

  return (
    <Stack gap="xl">
      <Group justify="center" className="mt-4">
        <Button 
          variant="filled" 
          color="blue" 
          onClick={handleSearchClick}
        >
          Browse Music
        </Button>
        <Button 
          variant="outline" 
          onClick={handleQueueClick}
        >
          View Queue
        </Button>
      </Group>
    </Stack>
  );
};

export default HomePage;