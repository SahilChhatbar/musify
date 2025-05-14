import { createBrowserRouter } from "react-router-dom";
import AppShellLayout from "./layout/AppShellLayout";
import Home from "./pages/home/components/HomeContent";
import Search from "./pages/home/components/Search";
import TrackDetail from "./pages/home/components/TrackDetail";
import Player from "./pages/home/components/Player";
import QueueComponent from "./pages/home/components/Queue";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShellLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/search",
        element: <Search />,
      },
      {
        path: "/player",
        element: <Player />,
      },
      {
        path: "/track/:trackId",
        element: <TrackDetail />,
      },
     {
        path: "/queue",
        element: <QueueComponent />,
     },
    ],
  },
]);