import { createBrowserRouter } from "react-router-dom";
import AppShellLayout from "./layout/AppShellLayout";
import Search from "./pages/home/components/Search";
import Player from "./pages/home/components/Player";
import QueueComponent from "./pages/home/components/Queue";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShellLayout />,
    children: [
      {
        path: "/search",
        element: <Search />,
      },
      {
        index: true,
        element: <Player />,
      },
     {
        path: "/queue",
        element: <QueueComponent />,
     },
    ],
  },
]);