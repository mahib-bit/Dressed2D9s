import { Link } from "react-router-dom";
import AnimeGrid from "../components/AnimeGrid.jsx";
import HeroCarousel from "../components/HeroCarousel.jsx";
import ContinueWatching from "../components/ContinueWatching.jsx";
import TrendingTabs from "../components/TrendingTabs.jsx";
import RandomButton from "../components/RandomButton.jsx";
import WindowFrame from "../components/WindowFrame.jsx";
import { useTopAnime } from "../hooks/useAnimeList.js";
import useHistory from "../hooks/useHistory.js";
import usePageTitle from "../hooks/usePageTitle.js";

export default function Home() {
  usePageTitle("Discover anime");
  // Same query key as the "Airing now" tab, so React Query shares one request.
  const airing = useTopAnime(1, "airing");
  const top = useTopAnime(1);
  const { history, remove } = useHistory();

  return (
    <>
      <HeroCarousel items={airing.data?.data} isLoading={airing.isLoading} />

      <ContinueWatching history={history} onRemove={remove} />

      <TrendingTabs />

      <WindowFrame
        title="Top rated"
        right={
          <Link to="/browse?order=score" className="underline">
            View all
          </Link>
        }
      >
        <AnimeGrid
          items={top.data?.data?.slice(0, 12)}
          isLoading={top.isLoading}
          error={top.error}
        />
      </WindowFrame>

      <div className="c22-window">
        <div className="p-6 text-center">
          <p className="mb-3 font-display text-lg font-bold">Can't decide what to watch?</p>
          <RandomButton className="btn btn-secondary">Surprise me</RandomButton>
        </div>
      </div>
    </>
  );
}
