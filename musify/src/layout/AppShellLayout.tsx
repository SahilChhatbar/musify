import { AppShell, Box } from "@mantine/core";
import { Outlet } from "react-router-dom";
import MusicPlayer from "../pages/home/components/Player";
import { useNavigate } from "react-router-dom";

const AppShellLayout = () => {
  const navigate = useNavigate();

  const handleSearchClick = () => {
    navigate("/search");
  };

  return (
    <AppShell 
      className="min-h-screen" 
      padding="md"
    >
      <AppShell.Main
        className="rounded-md overflow-hidden relative pb-36"
      >
        <Box className="h-full overflow-auto p-6">
          <Outlet />
        </Box>
        <Box className="fixed bottom-0 left-0 right-0 px-6 py-4 border-t border-gray-800 shadow-lg z-10">
          <MusicPlayer onSearch={handleSearchClick} />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
};

export default AppShellLayout;