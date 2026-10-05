// The one place the app gets anime data from.
// It tries AniList first, then Jikan, and remembers which one worked last
// so a blocked source isn't retried first on every request.
import * as anilist from "./anilist.js";
import * as jikan from "./jikan.js";

const PROVIDERS = { anilist, jikan };
const KEY = "catch22:provider";

function order() {
  try {
    return localStorage.getItem(KEY) === "jikan" ? ["jikan", "anilist"] : ["anilist", "jikan"];
  } catch {
    return ["anilist", "jikan"];
  }
}

function remember(name) {
  try {
    localStorage.setItem(KEY, name);
  } catch {
    /* storage unavailable: no problem */
  }
}

async function call(fn, ...args) {
  const errors = [];
  for (const name of order()) {
    try {
      const result = await PROVIDERS[name][fn](...args);
      remember(name);
      return result;
    } catch (err) {
      errors.push(`${name}: ${err.message}`);
    }
  }
  throw new Error(
    "Couldn't load anime data from AniList or Jikan. Check your connection or try another network. " +
      `(${errors.join(" | ")})`
  );
}

export const getTopAnime = (...a) => call("getTopAnime", ...a);
export const getSeasonNow = (...a) => call("getSeasonNow", ...a);
export const searchAnime = (...a) => call("searchAnime", ...a);
export const getAnime = (...a) => call("getAnime", ...a);
export const getAnimeEpisodes = (...a) => call("getAnimeEpisodes", ...a);
export const getGenres = (...a) => call("getGenres", ...a);
export const getSchedule = (...a) => call("getSchedule", ...a);
export const getSeason = (...a) => call("getSeason", ...a);
export const getRandomAnime = (...a) => call("getRandomAnime", ...a);
