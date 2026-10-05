import { Link } from "react-router-dom";
import AnimeGrid from "../components/AnimeGrid.jsx";
import useWatchlist from "../hooks/useWatchlist.js";
import usePageTitle from "../hooks/usePageTitle.js";

export default function Watchlist() {
  usePageTitle("My watchlist");
  const { list, remove } = useWatchlist();

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">My watchlist</h1>

      {list.length === 0 ? (
        <div className="py-16 text-center">
          <p className="mb-4 text-base-content/60">Your watchlist is empty.</p>
          <Link to="/browse" className="btn btn-primary">
            Find something to watch
          </Link>
        </div>
      ) : (
        <>
          <AnimeGrid items={list} />
          <div className="mt-6 flex flex-wrap gap-2">
            {list.map((a) => (
              <button
                key={a.mal_id}
                className="btn btn-xs btn-outline btn-error"
                onClick={() => remove(a.mal_id)}
              >
                Remove {a.title.length > 22 ? a.title.slice(0, 22) + "…" : a.title}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
