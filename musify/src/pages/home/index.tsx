import { Stack, Group, Button } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { MusicPlayer } from "./components/Player";
import { usePlayerSync } from "../../hooks/usePlayerSync";

const HomePage = () => {
  const navigate = useNavigate();
  usePlayerSync();
  
  const handleSearchClick = () => {
    navigate("/search");
  };
  
  const handleQueueClick = () => {
    navigate("/queue");
  };

  return (
    <Stack gap="xl">
      <MusicPlayer onSearch={handleSearchClick} />
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