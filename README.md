# Catch22 — anime discovery frontend

React + Vite + Tailwind + DaisyUI + React Router + TanStack Query.
Anime data comes from two free APIs (no keys needed): [AniList](https://anilist.co)
first, with [Jikan](https://jikan.moe) (MyAnimeList) as an automatic backup.
If one is blocked or down on your network, the other takes over.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build / deploy

```bash
npm run build
```

- **Vercel**: import the repo. `vercel.json` already handles React Router refreshes.
- **Netlify**: `public/_redirects` already handles React Router refreshes.

## Features

- Hero carousel (auto-rotating spotlight) on the home page
- Continue watching + full History page; playback position is saved and resumed
- Weekly airing Schedule (JST) and Season browser (any year/season)
- Trending tabs (Airing now / Upcoming / Most popular / Most favorited)
- Random anime button (navbar + home page)
- Browse with search, genre/type/sort filters, pagination
- Watchlist, HLS player
- Early-2000s web look with a modern layout: dark + light themes (toggle in the navbar)

## Structure

```
src/
├── api/anime.js          the only API the app imports: tries AniList, then Jikan
├── api/anilist.js        AniList GraphQL, reshaped to look like Jikan data
├── api/jikan.js          Jikan REST calls
├── hooks/                data hooks (react-query) + useWatchlist / useHistory (localStorage)
├── components/           Navbar, AnimeCard, AnimeGrid, VideoPlayer, ...
├── pages/                Home, Browse, Schedule, Season, AnimeDetail, Watch, Watchlist, History, NotFound
├── layouts/MainLayout.jsx
├── routes.jsx            all routes
└── App.jsx               query client + router
```

## Next steps (backend)

1. Replace `src/hooks/useWatchlist.js` and `src/hooks/useHistory.js` with
   Firebase (Auth + Firestore). Keep the returned shapes so no component
   has to change.
2. Add login/signup pages and protect `/watchlist`.
3. Add watch history ("Continue watching") and per-episode stream URLs.

## Troubleshooting

- **"Could not load this section"**: neither `graphql.anilist.co` nor
  `api.jikan.moe` could be reached. The error lists what each one said. Try
  another network (phone hotspot) or a VPN / Cloudflare WARP. Each request
  gives up after 10 seconds per source, and the "Try again" button retries.
- **`'vite' is not recognized`**: run `npm install` first.

## Notes

- Both APIs are rate limited. Requests are spaced out, React Query caches
  results, and HTTP 429 responses are retried.
- Anime are identified by MyAnimeList id on both sources, so links and saved
  watchlists work whichever source answered. The last working source is
  remembered in the browser (`catch22:provider`).
- The Watch page plays an open demo stream. Only stream video you own or
  are licensed to distribute.
