import { AppShell, Box } from "@mantine/core";
import { Outlet } from "react-router-dom";

const AppShellLayout = () => {
  return (
    <AppShell className="bg-black text-white" padding="md">
      <AppShell.Main
        className="bg-gradient-to-b from-gray-900 to-black rounded-md"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 20%, rgba(29, 78, 216, 0.05), transparent 50%), radial-gradient(circle at 90% 60%, rgba(124, 58, 237, 0.07), transparent 50%)",
        }}
      >
        <Box className="h-full overflow-auto p-4">
          <Outlet />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
};

export default AppShellLayout;
