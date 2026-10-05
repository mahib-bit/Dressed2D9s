import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer.jsx";
import { useAnimeDetail, useAnimeEpisodes } from "../hooks/useAnimeDetail.js";
import useHistory, { getHistoryEntry } from "../hooks/useHistory.js";
import usePageTitle from "../hooks/usePageTitle.js";

// Open-licensed demo stream (Big Buck Bunny) so you can test the player.
// Replace this with your own HLS/MP4 URL for content you have rights to.
const DEMO_STREAM = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

export default function Watch() {
  const { id, ep } = useParams();
  const epNumber = Number(ep) || 1;
  const navigate = useNavigate();

  const detail = useAnimeDetail(id);
  const episodes = useAnimeEpisodes(id);

  const [customUrl, setCustomUrl] = useState("");
  const [src, setSrc] = useState(DEMO_STREAM);

  const anime = detail.data?.data;
  usePageTitle(anime ? `${anime.title} — Episode ${epNumber}` : "Watch");
  const epList = episodes.data?.data || [];
  const current = epList.find((e) => e.mal_id === epNumber);
  const hasNext = epList.some((e) => e.mal_id === epNumber + 1);

  const goTo = (n) => navigate(`/watch/${id}/${n}`);

  const { record, saveProgress } = useHistory();

  // Where to resume: read once per episode straight from storage,
  // so progress updates while playing don't restart the video.
  const resumeAt = useMemo(() => {
    const saved = getHistoryEntry(id);
    return saved && saved.ep === epNumber ? saved.time : 0;
  }, [id, epNumber]);

  // Add / move this anime to the top of the watch history.
  useEffect(() => {
    if (anime) record(anime, epNumber);
  }, [anime, epNumber, record]);

  return (
    <>
      <div className="mb-4 text-sm breadcrumbs">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to={`/anime/${id}`}>{anime?.title || "Anime"}</Link></li>
          <li>Episode {epNumber}</li>
        </ul>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <VideoPlayer
            key={`${id}-${epNumber}`}
            src={src}
            poster={anime?.images?.jpg?.large_image_url}
            startAt={resumeAt}
            onProgress={(time, duration) => saveProgress(id, epNumber, time, duration)}
            onEnded={() => hasNext && goTo(epNumber + 1)}
          />

          <h1 className="mt-4 text-xl font-bold">
            {anime?.title} — Episode {epNumber}
          </h1>
          {current?.title && <p className="text-base-content/70">{current.title}</p>}

          <div className="mt-4 flex gap-2">
            <button
              className="btn btn-outline btn-sm"
              disabled={epNumber <= 1}
              onClick={() => goTo(epNumber - 1)}
            >
              « Previous
            </button>
            <button
              className="btn btn-primary btn-sm"
              disabled={!hasNext}
              onClick={() => goTo(epNumber + 1)}
            >
              Next episode »
            </button>
          </div>

          <form
            className="mt-6 rounded-box bg-base-200 p-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (customUrl.trim()) setSrc(customUrl.trim());
            }}
          >
            <label className="mb-2 block text-sm font-semibold">
              Stream URL (.m3u8 or .mp4)
            </label>
            <div className="join w-full">
              <input
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="input input-bordered join-item w-full"
                placeholder="https://your-cdn.com/episode-1/master.m3u8"
              />
              <button className="btn btn-primary join-item" type="submit">
                Load
              </button>
            </div>
            <p className="mt-2 text-xs text-base-content/60">
              Currently playing a demo stream. Only use video you own or have a
              license to stream. Later, your backend will return this URL for each
              episode.
            </p>
          </form>
        </div>

        <aside className="rounded-box bg-base-200 p-3">
          <h2 className="mb-2 font-bold">Episodes</h2>
          <ul className="max-h-[480px] space-y-1 overflow-y-auto">
            {epList.map((e) => (
              <li key={e.mal_id}>
                <Link
                  to={`/watch/${id}/${e.mal_id}`}
                  className={`flex items-center gap-2 rounded-lg p-2 text-sm transition hover:bg-base-300 ${
                    e.mal_id === epNumber ? "bg-primary/20 font-semibold" : ""
                  }`}
                >
                  <span className="badge badge-sm">{e.mal_id}</span>
                  <span className="clamp-2">{e.title}</span>
                </Link>
              </li>
            ))}
            {!epList.length && (
              <li className="p-2 text-sm text-base-content/60">
                {episodes.isLoading ? "Loading..." : "No episode list available."}
              </li>
            )}
          </ul>
        </aside>
      </div>
    </>
  );
}
