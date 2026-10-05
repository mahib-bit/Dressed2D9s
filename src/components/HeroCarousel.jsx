import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TitleBar } from "./WindowFrame.jsx";

// Auto-rotating spotlight. Pauses while the mouse is over it.
export default function HeroCarousel({ items = [], isLoading }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const slides = items.filter((a) => a.synopsis).slice(0, 8);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  if (isLoading) {
    return <div className="skeleton mb-10 h-72 w-full sm:h-96" />;
  }
  if (!slides.length) return null;

  const go = (n) => setIndex((n + slides.length) % slides.length);
  const anime = slides[index % slides.length];
  const img =
    anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url;

  return (
    <section
      className="c22-window mb-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured anime"
    >
      <TitleBar title={`Spotlight ${index + 1}/${slides.length}`} />
      <div className="relative overflow-hidden bg-base-300">
      {/* blurred backdrop */}
      <img
        key={`bg-${anime.mal_id}`}
        src={img}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-xl"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-base-100 via-base-100/70 to-transparent" />

      <div className="relative flex min-h-72 items-center gap-6 p-5 sm:min-h-96 sm:p-10">
        <div className="max-w-xl">
          <p className="mb-2 font-pixel text-xs uppercase tracking-widest text-primary">
            #{index + 1} Spotlight
          </p>
          <h2 className="clamp-2 text-2xl font-extrabold sm:text-4xl">{anime.title}</h2>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {anime.score && <span className="badge badge-primary">★ {anime.score}</span>}
            {anime.type && <span className="badge badge-neutral">{anime.type}</span>}
            {anime.episodes && <span className="badge badge-neutral">{anime.episodes} eps</span>}
            {anime.genres?.slice(0, 3).map((g) => (
              <span key={g.mal_id} className="badge badge-outline">
                {g.name}
              </span>
            ))}
          </div>

          <p className="mt-3 line-clamp-3 text-sm text-base-content/80 sm:text-base">
            {anime.synopsis}
          </p>

          <div className="mt-5 flex gap-3">
            <Link to={`/watch/${anime.mal_id}/1`} className="btn btn-primary">
              ▶ Watch now
            </Link>
            <Link to={`/anime/${anime.mal_id}`} className="btn btn-outline">
              Details
            </Link>
          </div>
        </div>

        <img
          src={img}
          alt={anime.title}
          className="c22-card ml-auto hidden h-64 md:block"
        />
      </div>

      {slides.length > 1 && (
        <>
          <button
            className="btn btn-circle btn-sm absolute left-2 top-1/2 hidden -translate-y-1/2 sm:flex"
            onClick={() => go(index - 1)}
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            className="btn btn-circle btn-sm absolute right-2 top-1/2 hidden -translate-y-1/2 sm:flex"
            onClick={() => go(index + 1)}
            aria-label="Next slide"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((s, i) => (
              <button
                key={s.mal_id}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-primary" : "w-2 bg-base-content/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
    </section>
  );
}
