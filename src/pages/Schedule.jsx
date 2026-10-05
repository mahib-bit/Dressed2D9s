import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import AnimeGrid from "../components/AnimeGrid.jsx";
import Pagination from "../components/Pagination.jsx";
import { getSchedule } from "../api/anime";
import usePageTitle from "../hooks/usePageTitle.js";

const DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function Schedule() {
  usePageTitle("Airing schedule");
  const today = DAYS[new Date().getDay()];
  const [day, setDay] = useState(today);
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["schedule", day, page],
    queryFn: () => getSchedule(day, page),
    placeholderData: keepPreviousData,
  });

  const changeDay = (d) => {
    setDay(d);
    setPage(1);
  };

  return (
    <>
      <h1 className="text-2xl font-bold">Airing schedule</h1>
      <p className="mb-4 text-sm text-base-content/60">
        Weekly broadcast schedule. Times are in Japan time (JST).
      </p>

      <div role="tablist" className="tabs tabs-box mb-6 overflow-x-auto">
        {DAYS.map((d) => (
          <button
            key={d}
            role="tab"
            className={`tab ${d === day ? "tab-active" : ""}`}
            onClick={() => changeDay(d)}
          >
            {cap(d.slice(0, 3))}
            {d === today && <span className="ml-1 text-primary">•</span>}
          </button>
        ))}
      </div>

      <h2 className="mb-3 text-lg font-semibold">{cap(day)}</h2>

      <AnimeGrid
        items={data?.data}
        isLoading={isLoading}
        error={error}
        emptyText="Nothing is scheduled for this day."
        getSubtitle={(a) => a.broadcast?.time ? `${a.broadcast.time} JST` : "Time TBA"}
      />

      <Pagination
        page={page}
        hasNext={data?.pagination?.has_next_page}
        onChange={setPage}
      />
    </>
  );
}
