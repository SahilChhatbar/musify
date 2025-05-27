import { createBrowserRouter } from "react-router-dom";
import AppShellLayout from "./layout/AppShellLayout";
import Search from "./pages/home/components/Search";
import HomePage from "./pages/home";
import QueueComponent from "./pages/home/components/Queue";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShellLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/search",
        element: <Search />,
      },
      {
        path: "/queue",
        element: <QueueComponent />,
      },
    ],
  },
]);