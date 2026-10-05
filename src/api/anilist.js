// AniList (https://anilist.co) GraphQL API: free, no key, CORS-enabled.
// Docs: https://docs.anilist.co
//
// Everything returned here is reshaped to look like Jikan's responses, and
// anime are identified by their MyAnimeList id (AniList's `idMal`), so the
// rest of the app (and saved watchlists) work with either data source.

const ENDPOINT = "https://graphql.anilist.co";
const TIMEOUT_MS = 10000;
const GAP_MS = 450; // AniList allows ~90 requests/minute

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let nextSlot = 0;
async function waitForTurn() {
  const now = Date.now();
  const wait = Math.max(0, nextSlot - now);
  nextSlot = Math.max(now, nextSlot) + GAP_MS;
  if (wait) await sleep(wait);
}

async function gql(query, variables = {}, attempt = 0) {
  await waitForTurn();

  // leave out empty variables so AniList treats them as "not provided"
  const vars = Object.fromEntries(
    Object.entries(variables).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query, variables: vars }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw new Error("AniList took too long to answer.");
    throw new Error("Couldn't reach graphql.anilist.co.");
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 429 && attempt < 2) {
    await sleep(2000 * (attempt + 1));
    return gql(query, variables, attempt + 1);
  }

  const json = await res.json().catch(() => null);
  if (!res.ok || json?.errors) {
    throw new Error(json?.errors?.[0]?.message || `AniList request failed (${res.status}).`);
  }
  return json.data;
}

// ---------- reshaping AniList -> Jikan-like objects ----------

const MEDIA_FIELDS = `
  fragment M on Media {
    id
    idMal
    title { romaji english }
    coverImage { extraLarge large }
    averageScore
    format
    episodes
    duration
    status
    description(asHtml: false)
    genres
    studios(isMain: true) { nodes { name } }
    season
    seasonYear
    startDate { year month day }
    endDate { year month day }
    source
    trailer { id site }
    isAdult
  }
`;

const TYPE = {
  TV: "TV",
  TV_SHORT: "TV",
  MOVIE: "Movie",
  SPECIAL: "Special",
  OVA: "OVA",
  ONA: "ONA",
  MUSIC: "Music",
};

const STATUS = {
  RELEASING: "Currently Airing",
  FINISHED: "Finished Airing",
  NOT_YET_RELEASED: "Not yet aired",
  CANCELLED: "Cancelled",
  HIATUS: "On Hiatus",
};

// MyAnimeList genre ids, so the genre filter means the same on both providers.
const GENRE_IDS = {
  Action: 1,
  Adventure: 2,
  Comedy: 4,
  Drama: 8,
  Ecchi: 9,
  Fantasy: 10,
  Horror: 14,
  Mecha: 18,
  Music: 19,
  Mystery: 7,
  Psychological: 40,
  Romance: 22,
  "Sci-Fi": 24,
  "Slice of Life": 36,
  Sports: 30,
  Supernatural: 37,
  Thriller: 41,
  "Mahou Shoujo": 66,
};
const GENRE_NAMES = Object.fromEntries(Object.entries(GENRE_IDS).map(([n, id]) => [id, n]));

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtDate(d) {
  if (!d?.year) return null;
  const parts = [d.month ? MONTHS[d.month - 1] : null, d.day ? `${d.day},` : null, d.year];
  return parts.filter(Boolean).join(" ");
}

function cleanDescription(html) {
  if (!html) return null;
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#039;|&rsquo;/g, "'")
    .trim();
}

function titleCase(enumValue) {
  if (!enumValue) return null;
  return enumValue
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function toAnime(m) {
  const cover = m.coverImage?.extraLarge || m.coverImage?.large;
  const start = fmtDate(m.startDate);
  const end = fmtDate(m.endDate);
  const rated = m.rankings?.find((r) => r.allTime && r.type === "RATED");

  return {
    mal_id: m.idMal,
    title: m.title?.romaji || m.title?.english || "Untitled",
    title_english: m.title?.english || null,
    images: {
      jpg: { image_url: m.coverImage?.large || cover, large_image_url: cover },
      webp: { large_image_url: cover },
    },
    score: m.averageScore ? Math.round(m.averageScore) / 10 : null,
    rank: rated?.rank ?? null,
    type: TYPE[m.format] || null,
    episodes: m.episodes ?? null,
    duration: m.duration ? `${m.duration} min per ep` : null,
    status: STATUS[m.status] || null,
    synopsis: cleanDescription(m.description),
    genres: (m.genres || [])
      .filter((name) => GENRE_IDS[name])
      .map((name) => ({ mal_id: GENRE_IDS[name], name })),
    studios: (m.studios?.nodes || []).map((s) => ({ name: s.name })),
    source: titleCase(m.source),
    aired: { string: start ? `${start} to ${end || "?"}` : null },
    trailer: m.trailer?.site === "youtube" ? { url: `https://www.youtube.com/watch?v=${m.trailer.id}` } : null,
  };
}

const usable = (m) => m && m.idMal && !m.isAdult;

function toPage(pageData, items) {
  const info = pageData.pageInfo || {};
  return {
    data: items,
    pagination: {
      has_next_page: !!info.hasNextPage,
      current_page: info.currentPage || 1,
      last_visible_page: info.lastPage || 1,
    },
  };
}

// ---------- list queries ----------

const PAGE_QUERY = `
  query (
    $page: Int, $perPage: Int, $search: String, $genre: String,
    $format: MediaFormat, $status: MediaStatus, $season: MediaSeason,
    $seasonYear: Int, $sort: [MediaSort]
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage currentPage lastPage }
      media(
        type: ANIME, isAdult: false, search: $search, genre: $genre,
        format: $format, status: $status, season: $season,
        seasonYear: $seasonYear, sort: $sort
      ) { ...M }
    }
  }
  ${MEDIA_FIELDS}
`;

async function listMedia(variables) {
  const data = await gql(PAGE_QUERY, { perPage: 24, ...variables });
  return toPage(data.Page, data.Page.media.filter(usable).map(toAnime));
}

export function getTopAnime(page = 1, filter) {
  const options = {
    airing: { status: "RELEASING", sort: ["POPULARITY_DESC"] },
    upcoming: { status: "NOT_YET_RELEASED", sort: ["POPULARITY_DESC"] },
    bypopularity: { sort: ["POPULARITY_DESC"] },
    favorite: { sort: ["FAVOURITES_DESC"] },
  };
  return listMedia({ page, ...(options[filter] || { sort: ["SCORE_DESC"] }) });
}

function seasonOf(date) {
  const m = date.getMonth();
  return m < 3 ? "WINTER" : m < 6 ? "SPRING" : m < 9 ? "SUMMER" : "FALL";
}

export function getSeasonNow(page = 1) {
  const now = new Date();
  return listMedia({
    page,
    season: seasonOf(now),
    seasonYear: now.getFullYear(),
    sort: ["POPULARITY_DESC"],
  });
}

export function getSeason(year, season, page = 1) {
  return listMedia({
    page,
    season: String(season).toUpperCase(),
    seasonYear: Number(year),
    sort: ["POPULARITY_DESC"],
  });
}

const FORMATS = { tv: "TV", movie: "MOVIE", ova: "OVA", special: "SPECIAL", ona: "ONA" };
const ORDERS = {
  score: "SCORE_DESC",
  popularity: "POPULARITY_DESC",
  start_date: "START_DATE_DESC",
  title: "TITLE_ROMAJI",
};

export function searchAnime({ q, page = 1, genres, type, status, order_by }) {
  const sort = ORDERS[order_by] || (q ? "SEARCH_MATCH" : "POPULARITY_DESC");
  return listMedia({
    page,
    search: q,
    genre: GENRE_NAMES[genres],
    format: FORMATS[type],
    status: status ? String(status).toUpperCase() : undefined,
    sort: [sort],
  });
}

// ---------- detail / episodes ----------

export async function getAnime(id) {
  const data = await gql(
    `query ($idMal: Int) {
       Media(idMal: $idMal, type: ANIME) {
         ...M
         rankings { rank type allTime }
       }
     }
     ${MEDIA_FIELDS}`,
    { idMal: Number(id) }
  );
  if (!data.Media) throw new Error("Anime not found.");
  return { data: toAnime(data.Media) };
}

// AniList has no episode list, so build one from the episode count
// (plus real titles when streaming sites provide them).
export async function getAnimeEpisodes(id, page = 1) {
  const data = await gql(
    `query ($idMal: Int) {
       Media(idMal: $idMal, type: ANIME) {
         episodes
         nextAiringEpisode { episode }
         streamingEpisodes { title }
       }
     }`,
    { idMal: Number(id) }
  );
  const m = data.Media;
  if (!m) return { data: [], pagination: { has_next_page: false } };

  const count = m.nextAiringEpisode
    ? m.nextAiringEpisode.episode - 1
    : (m.episodes ?? m.streamingEpisodes?.length ?? 0);

  const titles = {};
  (m.streamingEpisodes || []).forEach((e) => {
    const match = /^Episode\s+(\d+)\s*[-–:]\s*(.+)$/i.exec(e.title || "");
    if (match) titles[Number(match[1])] = match[2];
  });

  const PER_PAGE = 100;
  const from = (page - 1) * PER_PAGE + 1;
  const to = Math.min(count, page * PER_PAGE);
  const list = [];
  for (let n = from; n <= to; n++) {
    list.push({ mal_id: n, title: titles[n] || `Episode ${n}` });
  }
  return { data: list, pagination: { has_next_page: count > page * PER_PAGE } };
}

export function getGenres() {
  const data = Object.entries(GENRE_IDS)
    .map(([name, mal_id]) => ({ mal_id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return Promise.resolve({ data });
}

// ---------- schedule / random ----------

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const JST = 9 * 3600 * 1000;
const DAY = 24 * 3600 * 1000;

// start/end (unix seconds) of the next occurrence of `day`, in Japan time
function jstDayRange(day) {
  const jstNow = Date.now() + JST;
  const today = new Date(jstNow).getUTCDay();
  const offset = (DAYS.indexOf(day) - today + 7) % 7;
  const startMs = Math.floor(jstNow / DAY) * DAY - JST + offset * DAY;
  return [Math.floor(startMs / 1000), Math.floor((startMs + DAY) / 1000)];
}

export async function getSchedule(day, page = 1) {
  const [from, to] = jstDayRange(day);
  const data = await gql(
    `query ($page: Int, $from: Int, $to: Int) {
       Page(page: $page, perPage: 50) {
         pageInfo { hasNextPage currentPage lastPage }
         airingSchedules(airingAt_greater: $from, airingAt_lesser: $to, sort: TIME) {
           airingAt
           media { ...M }
         }
       }
     }
     ${MEDIA_FIELDS}`,
    { page, from, to }
  );

  const seen = new Set();
  const items = [];
  for (const entry of data.Page.airingSchedules) {
    if (!usable(entry.media) || seen.has(entry.media.idMal)) continue;
    seen.add(entry.media.idMal);
    const t = new Date(entry.airingAt * 1000 + JST);
    const hh = String(t.getUTCHours()).padStart(2, "0");
    const mm = String(t.getUTCMinutes()).padStart(2, "0");
    items.push({ ...toAnime(entry.media), broadcast: { time: `${hh}:${mm}` } });
  }
  return toPage(data.Page, items);
}

// AniList has no "random" endpoint: pick a random page of the popularity list.
export async function getRandomAnime() {
  const page = 1 + Math.floor(Math.random() * 100);
  const data = await gql(
    `query ($page: Int) {
       Page(page: $page, perPage: 10) {
         media(type: ANIME, isAdult: false, sort: POPULARITY_DESC) { idMal }
       }
     }`,
    { page }
  );
  const pick = data.Page.media.find((m) => m.idMal);
  if (!pick) throw new Error("No random anime found.");
  return { data: { mal_id: pick.idMal } };
}
