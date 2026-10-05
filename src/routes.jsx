import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import Home from "./pages/Home.jsx";
import Browse from "./pages/Browse.jsx";
import AnimeDetail from "./pages/AnimeDetail.jsx";
import Watch from "./pages/Watch.jsx";
import Watchlist from "./pages/Watchlist.jsx";
import Schedule from "./pages/Schedule.jsx";
import Season from "./pages/Season.jsx";
import History from "./pages/History.jsx";
import NotFound from "./pages/NotFound.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "browse", element: <Browse /> },
      { path: "schedule", element: <Schedule /> },
      { path: "season", element: <Season /> },
      { path: "anime/:id", element: <AnimeDetail /> },
      { path: "watch/:id/:ep", element: <Watch /> },
      { path: "watchlist", element: <Watchlist /> },
      { path: "history", element: <History /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default router;
