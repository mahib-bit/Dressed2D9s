import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AnimeGrid from "../components/AnimeGrid.jsx";
import Pagination from "../components/Pagination.jsx";
import useDebounce from "../hooks/useDebounce.js";
import { useGenres, useSearchAnime } from "../hooks/useAnimeList.js";
import usePageTitle from "../hooks/usePageTitle.js";

const TYPES = ["tv", "movie", "ova", "special", "ona"];
const ORDERS = [
  { value: "score", label: "Top rated" },
  { value: "popularity", label: "Most popular" },
  { value: "start_date", label: "Newest" },
  { value: "title", label: "A–Z" },
];

export default function Browse() {
  usePageTitle("Browse anime");
  const [params, setParams] = useSearchParams();

  const q = params.get("q") || "";
  const page = Number(params.get("page")) || 1;
  const genre = params.get("genre") || "";
  const type = params.get("type") || "";
  const order = params.get("order") || "";

  // The text box has its own state so typing feels instant;
  // the URL (and the API call) update only after the user pauses.
  const [text, setText] = useState(q);
  const debounced = useDebounce(text, 500);

  useEffect(() => setText(q), [q]); // navbar search changes ?q=

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    setParams(next);
  };

  useEffect(() => {
    if (debounced !== q) update({ q: debounced, page: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const genres = useGenres();
  const { data, isLoading, error, isFetching } = useSearchAnime({
    q,
    page,
    genres: genre,
    type,
    order_by: order,
    sort: order === "title" || order === "popularity" ? "asc" : "desc",
  });

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Browse</h1>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="input input-bordered w-full"
          placeholder="Search by title..."
        />

        <select
          className="select select-bordered w-full"
          value={genre}
          onChange={(e) => update({ genre: e.target.value, page: "" })}
        >
          <option value="">All genres</option>
          {genres.data?.data?.map((g) => (
            <option key={g.mal_id} value={g.mal_id}>
              {g.name}
            </option>
          ))}
        </select>

        <select
          className="select select-bordered w-full"
          value={type}
          onChange={(e) => update({ type: e.target.value, page: "" })}
        >
          <option value="">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t.toUpperCase()}
            </option>
          ))}
        </select>

        <select
          className="select select-bordered w-full"
          value={order}
          onChange={(e) => update({ order: e.target.value, page: "" })}
        >
          <option value="">Sort: Relevance</option>
          {ORDERS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className={isFetching && !isLoading ? "opacity-60 transition" : "transition"}>
        <AnimeGrid
          items={data?.data}
          isLoading={isLoading}
          error={error}
          emptyText="No anime matched your search."
        />
      </div>

      <Pagination
        page={page}
        hasNext={data?.pagination?.has_next_page}
        onChange={(p) => update({ page: p === 1 ? "" : String(p) })}
      />
    </>
  );
}
