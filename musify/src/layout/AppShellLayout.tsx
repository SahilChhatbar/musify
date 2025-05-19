import { AppShell, Box } from "@mantine/core";
import { Outlet } from "react-router-dom";
import  MusicPlayer  from "../pages/home/components/Player";
import { useNavigate } from "react-router-dom";

const AppShellLayout = () => {
  const navigate = useNavigate();

  const handleSearchClick = () => {
    navigate("/search");
  };

  return (
    <AppShell className="bg-black text-white" padding="md">
      <AppShell.Main
        className="bg-gradient-to-b from-gray-900 to-black rounded-md"
      >
        <Box className="h-full overflow-auto p-4 pb-32">
          <Outlet />
        </Box>
        <Box className="fixed bottom-0 left-0 right-0 p-4 bg-gray-700 border-t border-gray-200 z-10">
          <MusicPlayer onSearch={handleSearchClick} />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
};

export default AppShellLayout;