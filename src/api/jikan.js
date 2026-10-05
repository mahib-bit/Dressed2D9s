// All API calls live here. Components never call fetch() directly.
// Jikan (unofficial MyAnimeList API): https://docs.api.jikan.moe/
const BASE = "https://api.jikan.moe/v4";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const TIMEOUT_MS = 10000; // give up after 10s so the next data source can take over
const GAP_MS = 400; // Jikan allows ~3 requests/second, so space ours out

// Tiny throttle: every request waits for its turn, 400ms apart.
let nextSlot = 0;
async function waitForTurn() {
  const now = Date.now();
  const wait = Math.max(0, nextSlot - now);
  nextSlot = Math.max(now, nextSlot) + GAP_MS;
  if (wait) await sleep(wait);
}

async function request(path, params = {}, attempt = 0) {
  const url = new URL(BASE + path);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  await waitForTurn();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(url, { signal: controller.signal });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("The anime database took too long to answer.");
    }
    // network down, DNS/ISP block, CORS, etc.
    throw new Error("Couldn't reach api.jikan.moe. Check your connection or try another network.");
  } finally {
    clearTimeout(timer);
  }

  // Rate limited: wait a bit and try again.
  if (res.status === 429 && attempt < 3) {
    await sleep(1000 * (attempt + 1));
    return request(path, params, attempt + 1);
  }
  if (!res.ok) {
    throw new Error(
      res.status >= 500
        ? `The anime database is having trouble right now (${res.status}).`
        : `Request failed (${res.status}).`
    );
  }
  return res.json();
}

export const getTopAnime = (page = 1, filter) =>
  request("/top/anime", { page, limit: 24, filter });

export const getSeasonNow = (page = 1) =>
  request("/seasons/now", { page, limit: 24 });

export const searchAnime = ({ q, page = 1, genres, type, status, order_by, sort }) =>
  request("/anime", {
    q,
    page,
    limit: 24,
    genres,
    type,
    status,
    order_by,
    sort,
    sfw: true,
  });

export const getAnime = (id) => request(`/anime/${id}/full`);

export const getAnimeEpisodes = (id, page = 1) =>
  request(`/anime/${id}/episodes`, { page });

export const getGenres = () => request("/genres/anime");

// ---- added: schedule, seasons, random ----
export const getSchedule = (day, page = 1) =>
  request("/schedules", { filter: day, page, limit: 24, sfw: true });

export const getSeason = (year, season, page = 1) =>
  request(`/seasons/${year}/${season}`, { page, limit: 24, sfw: true });

export const getRandomAnime = () => request("/random/anime");
