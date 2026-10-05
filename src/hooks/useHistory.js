import { useCallback, useEffect, useState } from "react";

// Watch history in localStorage: one entry per anime (its latest episode).
// Like useWatchlist, this is the only file to change when you add Firebase.
const KEY = "catch22:history";
const EVENT = "catch22:history-changed";
const MAX = 50;

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function write(list) {
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  window.dispatchEvent(new Event(EVENT));
}

// Read one entry straight from storage (no React state involved).
export function getHistoryEntry(id) {
  return read().find((h) => h.mal_id === Number(id));
}

export default function useHistory() {
  const [history, setHistory] = useState(read);

  useEffect(() => {
    const sync = () => setHistory(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // Call when an episode page opens. Moves the anime to the top of the list.
  const record = useCallback((anime, ep) => {
    const old = getHistoryEntry(anime.mal_id);
    const sameEp = old && old.ep === ep;
    const entry = {
      mal_id: anime.mal_id,
      title: anime.title,
      images: anime.images,
      episodes: anime.episodes,
      ep,
      time: sameEp ? old.time : 0,
      duration: sameEp ? old.duration : 0,
      updatedAt: Date.now(),
    };
    write([entry, ...read().filter((h) => h.mal_id !== entry.mal_id)]);
  }, []);

  // Call while the video plays (throttled by VideoPlayer).
  const saveProgress = useCallback((id, ep, time, duration) => {
    const list = read();
    const i = list.findIndex((h) => h.mal_id === Number(id));
    if (i === -1 || list[i].ep !== ep) return;
    list[i] = { ...list[i], time, duration, updatedAt: Date.now() };
    write(list);
  }, []);

  const remove = useCallback(
    (id) => write(read().filter((h) => h.mal_id !== Number(id))),
    []
  );

  const clear = useCallback(() => write([]), []);

  return { history, record, saveProgress, remove, clear };
}
