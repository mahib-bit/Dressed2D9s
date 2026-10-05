import { useState } from "react";
import AnimeGrid from "./AnimeGrid.jsx";
import WindowFrame from "./WindowFrame.jsx";
import { useTopAnime } from "../hooks/useAnimeList.js";

// Jikan has no "trending by day/week/month" endpoint, so these tabs use the
// ranking filters it does offer. Only the open tab is fetched (saves rate limit).
const TABS = [
  { key: "airing", label: "Airing now" },
  { key: "upcoming", label: "Upcoming" },
  { key: "bypopularity", label: "Most popular" },
  { key: "favorite", label: "Most favorited" },
];

export default function TrendingTabs() {
  const [tab, setTab] = useState("airing");
  const { data, isLoading, error } = useTopAnime(1, tab);

  return (
    <WindowFrame title="Trending">
      <div role="tablist" className="tabs tabs-box tabs-sm mb-4 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            className={`tab ${t.key === tab ? "tab-active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimeGrid items={data?.data?.slice(0, 12)} isLoading={isLoading} error={error} />
    </WindowFrame>
  );
}
