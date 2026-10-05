import { useSearchParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import AnimeGrid from "../components/AnimeGrid.jsx";
import Pagination from "../components/Pagination.jsx";
import { getSeason } from "../api/anime";
import usePageTitle from "../hooks/usePageTitle.js";

const SEASONS = ["winter", "spring", "summer", "fall"];

function currentSeason() {
  const now = new Date();
  const m = now.getMonth(); // 0-11
  const season = m < 3 ? "winter" : m < 6 ? "spring" : m < 9 ? "summer" : "fall";
  return { year: now.getFullYear(), season };
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function Season() {
  const now = currentSeason();
  const [params, setParams] = useSearchParams();

  const year = Number(params.get("year")) || now.year;
  const season = SEASONS.includes(params.get("season")) ? params.get("season") : now.season;
  const page = Number(params.get("page")) || 1;

  usePageTitle(`${cap(season)} ${year} anime`);

  const years = Array.from({ length: now.year + 2 - 1990 }, (_, i) => now.year + 1 - i);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["season", year, season, page],
    queryFn: () => getSeason(year, season, page),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">
        {cap(season)} {year}
      </h1>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div role="tablist" className="tabs tabs-box">
          {SEASONS.map((s) => (
            <button
              key={s}
              role="tab"
              className={`tab ${s === season ? "tab-active" : ""}`}
              onClick={() => update({ season: s, page: "" })}
            >
              {cap(s)}
            </button>
          ))}
        </div>

        <select
          className="select select-bordered select-sm"
          value={year}
          onChange={(e) => update({ year: e.target.value, page: "" })}
          aria-label="Year"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <AnimeGrid
        items={data?.data}
        isLoading={isLoading}
        error={error}
        emptyText="No anime found for this season."
      />

      <Pagination
        page={page}
        hasNext={data?.pagination?.has_next_page}
        onChange={(p) => update({ page: p === 1 ? "" : String(p) })}
      />
    </>
  );
}
