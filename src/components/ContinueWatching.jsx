import { Link } from "react-router-dom";
import WindowFrame from "./WindowFrame.jsx";

// One resume card: poster, episode, progress bar, remove button.
export function HistoryCard({ item, onRemove }) {
  const img = item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url;
  const pct =
    item.duration > 0 ? Math.min(100, Math.round((item.time / item.duration) * 100)) : 0;

  return (
    <div className="group relative w-40 shrink-0 sm:w-44">
      <Link
        to={`/watch/${item.mal_id}/${item.ep}`}
        className="c22-card block overflow-hidden"
      >
        <figure className="relative aspect-[2/3] bg-base-300">
          <img src={img} alt={item.title} loading="lazy" className="h-full w-full object-cover" />
          <span className="badge badge-primary absolute left-2 top-2">EP {item.ep}</span>
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-black/60">
            <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
        </figure>
        <div className="p-3">
          <h3 className="clamp-2 text-sm font-semibold leading-snug">{item.title}</h3>
          <p className="mt-1 text-xs text-base-content/60">
            {pct > 0 ? `${pct}% watched` : "Not started"}
          </p>
        </div>
      </Link>
      {onRemove && (
        <button
          className="btn btn-circle btn-xs absolute right-1 top-1 opacity-0 transition group-hover:opacity-100 focus:opacity-100"
          onClick={() => onRemove(item.mal_id)}
          aria-label={`Remove ${item.title} from history`}
        >
          ✕
        </button>
      )}
    </div>
  );
}

// Horizontal "Continue watching" row for the home page.
export default function ContinueWatching({ history, onRemove }) {
  if (!history.length) return null;

  return (
    <WindowFrame
      title="Continue watching"
      right={
        <Link to="/history" className="underline">
          Full history
        </Link>
      }
    >
      <div className="flex gap-4 overflow-x-auto p-1 pb-3">
        {history.slice(0, 10).map((item) => (
          <HistoryCard key={item.mal_id} item={item} onRemove={onRemove} />
        ))}
      </div>
    </WindowFrame>
  );
}
