import { Link, useParams } from "react-router-dom";
import { useAnimeDetail, useAnimeEpisodes } from "../hooks/useAnimeDetail.js";
import useWatchlist from "../hooks/useWatchlist.js";
import usePageTitle from "../hooks/usePageTitle.js";

export default function AnimeDetail() {
  const { id } = useParams();
  const { data, isLoading, error } = useAnimeDetail(id);
  usePageTitle(data?.data?.title);
  const episodes = useAnimeEpisodes(id);
  const { toggle, isSaved } = useWatchlist();

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <div className="skeleton aspect-[2/3] w-full" />
        <div className="space-y-3">
          <div className="skeleton h-8 w-2/3" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div role="alert" className="alert alert-error">
        <span>Could not load this anime. {error?.message}</span>
      </div>
    );
  }

  const anime = data.data;
  const poster = anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url;
  const saved = isSaved(anime.mal_id);

  const facts = [
    ["Type", anime.type],
    ["Episodes", anime.episodes ?? "Ongoing"],
    ["Status", anime.status],
    ["Aired", anime.aired?.string],
    ["Duration", anime.duration],
    ["Rating", anime.rating],
    ["Studio", anime.studios?.map((s) => s.name).join(", ")],
    ["Source", anime.source],
  ].filter(([, v]) => v);

  const epList = episodes.data?.data;

  return (
    <>
      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <div>
          <img
            src={poster}
            alt={anime.title}
            className="w-full max-w-[260px] rounded-box shadow-lg"
          />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold sm:text-4xl">{anime.title}</h1>
          {anime.title_english && anime.title_english !== anime.title && (
            <p className="text-base-content/60">{anime.title_english}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {anime.score && <span className="badge badge-primary">★ {anime.score}</span>}
            {anime.rank && <span className="badge badge-outline">Rank #{anime.rank}</span>}
            {anime.genres?.map((g) => (
              <Link
                key={g.mal_id}
                to={`/browse?genre=${g.mal_id}`}
                className="badge badge-secondary badge-outline"
              >
                {g.name}
              </Link>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link to={`/watch/${anime.mal_id}/1`} className="btn btn-primary">
              ▶ Watch
            </Link>
            <button
              className={`btn ${saved ? "btn-success" : "btn-outline"}`}
              onClick={() => toggle(anime)}
            >
              {saved ? "✓ In watchlist" : "+ Add to watchlist"}
            </button>
            {anime.trailer?.url && (
              <a
                className="btn btn-ghost"
                href={anime.trailer.url}
                target="_blank"
                rel="noreferrer"
              >
                Trailer ↗
              </a>
            )}
          </div>

          <h2 className="mb-1 mt-6 text-lg font-bold">Synopsis</h2>
          <p className="whitespace-pre-line leading-relaxed text-base-content/80">
            {anime.synopsis || "No synopsis available."}
          </p>

          <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            {facts.map(([label, value]) => (
              <div key={label} className="flex gap-2">
                <dt className="w-24 shrink-0 text-base-content/60">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-3 text-xl font-bold">Episodes</h2>
        {episodes.isLoading && <div className="skeleton h-24 w-full" />}
        {!episodes.isLoading && !epList?.length && (
          <p className="text-base-content/60">No episode list available yet.</p>
        )}
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {epList?.map((ep) => (
            <li key={ep.mal_id}>
              <Link
                to={`/watch/${anime.mal_id}/${ep.mal_id}`}
                className="flex items-center gap-3 rounded-box bg-base-200 p-3 transition hover:bg-base-300"
              >
                <span className="badge badge-primary">{ep.mal_id}</span>
                <span className="clamp-2 text-sm">{ep.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
