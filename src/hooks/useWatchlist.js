import { useCallback, useEffect, useState } from "react";

// Watchlist stored in localStorage for now.
// When you add Firebase later, ONLY this file needs to change —
// keep the returned shape ({ list, add, remove, toggle, isSaved }) the same.
const KEY = "catch22:watchlist";
const EVENT = "catch22:watchlist-changed";

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function write(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
  // let other components using this hook know
  window.dispatchEvent(new Event(EVENT));
}

export default function useWatchlist() {
  const [list, setList] = useState(read);

  useEffect(() => {
    const sync = () => setList(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // store only what the cards need, not the whole API object
  const slim = (anime) => ({
    mal_id: anime.mal_id,
    title: anime.title,
    images: anime.images,
    score: anime.score,
    type: anime.type,
    episodes: anime.episodes,
  });

  const isSaved = useCallback(
    (id) => list.some((a) => a.mal_id === Number(id)),
    [list]
  );

  const add = (anime) => {
    if (!isSaved(anime.mal_id)) write([slim(anime), ...read()]);
  };

  const remove = (id) => write(read().filter((a) => a.mal_id !== Number(id)));

  const toggle = (anime) => (isSaved(anime.mal_id) ? remove(anime.mal_id) : add(anime));

  return { list, add, remove, toggle, isSaved };
}
