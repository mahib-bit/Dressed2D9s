import { Link } from "react-router-dom";

// `subtitle` replaces the default "N eps" line (the schedule page uses it for air time)
export default function AnimeCard({ anime, subtitle }) {
  const img =
    anime.images?.webp?.large_image_url ||
    anime.images?.jpg?.large_image_url ||
    anime.images?.jpg?.image_url;

  return (
    <Link
      to={`/anime/${anime.mal_id}`}
      className="group c22-card overflow-hidden"
    >
      <figure className="relative aspect-[2/3] bg-base-300">
        <img
          src={img}
          alt={anime.title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        {anime.score && (
          <span className="badge badge-primary absolute left-2 top-2 font-semibold">
            ★ {anime.score}
          </span>
        )}
        {anime.type && (
          <span className="badge badge-neutral badge-sm absolute bottom-2 right-2">
            {anime.type}
          </span>
        )}
      </figure>
      <div className="p-3">
        <h3 className="clamp-2 text-sm font-semibold leading-snug">{anime.title}</h3>
        <p className="mt-1 text-xs text-base-content/60">
          {subtitle || (anime.episodes ? `${anime.episodes} eps` : "Ongoing")}
        </p>
      </div>
    </Link>
  );
}
