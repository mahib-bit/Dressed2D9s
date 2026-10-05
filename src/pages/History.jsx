import { Link } from "react-router-dom";
import { HistoryCard } from "../components/ContinueWatching.jsx";
import useHistory from "../hooks/useHistory.js";
import usePageTitle from "../hooks/usePageTitle.js";

export default function History() {
  usePageTitle("Watch history");
  const { history, remove, clear } = useHistory();

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Watch history</h1>
        {history.length > 0 && (
          <button
            className="btn btn-outline btn-error btn-sm"
            onClick={() => window.confirm("Clear all watch history?") && clear()}
          >
            Clear all
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="py-16 text-center">
          <p className="mb-4 text-base-content/60">
            Nothing here yet. Episodes you watch will show up here.
          </p>
          <Link to="/browse" className="btn btn-primary">
            Find something to watch
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {history.map((item) => (
            <HistoryCard key={item.mal_id} item={item} onRemove={remove} />
          ))}
        </div>
      )}
    </>
  );
}
