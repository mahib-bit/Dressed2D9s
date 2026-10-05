import { useState } from "react";

// Counts how many times THIS browser has opened the site (once per session).
function useVisitCount() {
  const [count] = useState(() => {
    try {
      let n = Number(localStorage.getItem("catch22:visits")) || 0;
      if (!sessionStorage.getItem("catch22:counted")) {
        n += 1;
        localStorage.setItem("catch22:visits", String(n));
        sessionStorage.setItem("catch22:counted", "1");
      }
      return n || 1;
    } catch {
      return 1;
    }
  });
  return count;
}

export default function Footer() {
  const visits = useVisitCount();
  const digits = String(visits).padStart(6, "0").split("");

  return (
    <footer className="mt-8 border-t-2 border-[var(--c22-edge)] bg-base-200 px-4 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 text-center text-sm">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="c22-badge88">Made with React</span>
          <span className="c22-badge88">Data: Jikan</span>
          <span className="c22-badge88">No ads. Ever.</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-pixel text-xs uppercase">Your visits</span>
          <span className="c22-counter" aria-label={`You have visited ${visits} times`}>
            {digits.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </span>
        </div>

        <p className="max-w-2xl text-base-content/70">
          Anime info comes from AniList and{" "}
          <a className="link link-primary" href="https://jikan.moe" target="_blank" rel="noreferrer">
            Jikan / MyAnimeList
          </a>
          . Catch22 is a learning project and does not host copyrighted video.
        </p>

        <p className="font-pixel text-[0.65rem] uppercase text-base-content/60">
          © {new Date().getFullYear()} Catch22 ★ Best viewed in any browser
        </p>
      </div>
    </footer>
  );
}
