import { AppShell, Box } from "@mantine/core";
import { Outlet } from "react-router-dom";
import Player from "../pages/home/components/Player";
import { useNavigate } from "react-router-dom";

const AppShellLayout = () => {
  const navigate = useNavigate();

  const handleSearchClick = () => {
    navigate("/search");
  };

  return (
    <AppShell className="min-h-screen" padding="md" pb="xl" bg="#F1EFEC">
      <AppShell.Main className="rounded-md overflow-hidden">
        <Box className="h-full overflow-auto p-6">
          <Outlet />
        </Box>
      </AppShell.Main>
      <AppShell.Footer withBorder={false} bg="#F1EFEC" opacity="0.92">
        <Player onSearch={handleSearchClick} />
      </AppShell.Footer>
    </AppShell>
  );
};

export default AppShellLayout;