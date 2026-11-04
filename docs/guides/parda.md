# Parda

Parda (पर्दा, "the screen") is a movie and series product at `/app/parda`, run from `/admin/parda`, built as a removable layer (`pnpm strip-demo`; decision 0228). The plan is [PLAN.md](../PLAN.md), section 12.

**Today (Tasks 59 to 64)** it has a home and three hubs (movies, series, anime) of rails from TMDB, title, credits, person and collection pages, "Surprise me", the watch page with progress and Continue watching, the notice page, sign-in, sign-up and the 404, and **no real video plays**. The servers are a placeholder until a licensed provider is connected (see "Connecting the real provider").

## Design: "Masking"

The page is a cinema screen: two masks hold the interface and fit each picture's shape. The direction contract is [.impeccable/surfaces/parda.md](../../.impeccable/surfaces/parda.md); read it before any UI work. The comps are in `.impeccable/mocks/parda/` (gitignored; `board.html` shows every frame). Decision 0232.

**Tokens** (`src/styles/parda.css`, under `html[data-section="parda"]`, `.dark` for the dark values):

| Token | Use |
| --- | --- |
| `--pd-mask` | The two masks: header, lower bar, footer, tab bar |
| `--pd-ground`, `--pd-ground-2` | The page, and one step up |
| `--pd-ink`, `--pd-muted` | Text |
| `--pd-action`, `--pd-on-action` | Yellow fill in dark; ink fill with yellow text in light |
| `--pd-subtitle`, `--pd-on-picture`, `--pd-scrim` | Text on a picture, the same in both themes. Always over `pd-scrim` |
| `--pd-progress`, `--pd-track` | The progress bar, always on its track |

They redefine Graphite's `--background`, `--primary`, `--border` and the rest, so the shared kit needs no variants. Tailwind has `bg-pd-mask`, `text-pd-ink` and so on.

**Type:** `pd-display` with `text-pd-title` or `text-pd-head`; a subtitle is `text-pd-sub text-pd-subtitle` (size, then colour), at most two lines, inside `pd-scrim`'s solid 5.5rem. Anek Devanagari is display only; text stays Inter and Noto Sans Devanagari.

**Motion:** one ease (`--pd-ease`), transform and opacity only, inside the `no-preference` block at the end of the file: `pd-move` and `pd-press`. A test enforces it.

**How the theme resolves:** a route's `staticData.brand` with `defaultScheme: "dark"` makes `sectionTheme()` turn "system" into "dark" in the root, on the server, so there's no flash. An explicit Light or Dark wins. `<html data-section>` scopes the stylesheet, so portalled menus and toasts match.

## Shell and brand

| File | Holds |
| --- | --- |
| `src/routes/_parda/route.tsx` | The layout: `PARDA_BRAND` in `staticData`, the `· Parda` title, `noindex` unless a page uses `seo()`, `pardaFontPreloads`, the 404 |
| `src/features/parda/brand.ts` | `PARDA_NAME`, `pardaTitle`, `pardaHead` (a private page's head), `PARDA_BRAND` (`id: "parda"`, `defaultScheme: "dark"`, `themeColors` from the masks, icons, manifest) |
| `src/features/parda/links.ts` | `pardaLinks`, `PARDA_PATHS` and `PARDA_SITEMAP`: every link into Parda. A link arrives with its route |
| `src/features/parda/search.ts` | The URL contract: `PARDA_HUBS`, `isPardaHub`, `PARDA_TYPES` (`series` in the URL is TMDB's `tv`), `titleParamsSchema` |
| `src/features/parda/shell/` | `PardaFrame` (top mask, footer, tab bar), `PardaSection` and `PardaNotFound`, the wordmark, the account menu |
| `src/server/parda/manifest.ts`, `src/server/routes/parda-manifest.ts` | The manifest in each language, a Nitro route (`vite.config.ts`) |
| `public/parda/` | The icons, rendered from `icon.svg`, and TMDB's logo (`tmdb.svg`, TMDB's own file) |

- **One frame on every page** (decision 0233): the layout renders it, and the page renders its `<main>`. The top mask is always solid, so nothing in it sits on a picture.
- **Sections:** Home, Movies, Series, Anime and About: the top mask's links from `md` up, the tab bar below. Add a section to `SECTIONS` in `parda-frame.tsx` when its route exists. The frame keeps the tab bar's height clear on phones.
- **The 404:** `/app/parda/$` throws `notFound()`, so the layout's `notFoundComponent` answers in the frame. One segment (`/app/parda/whatever`) reaches `$hub`, whose loader does the same for anything but a hub.
- **SEO:** pages are `noindex` through the layout. An indexable page uses `seo({ siteName: PARDA_NAME })`, goes in `INDEXABLE` (`tests/unit/route-seo.test.ts`) and the sitemap. Today that's the home, the hubs and `/app/parda/about` (`PARDA_SITEMAP`), and the title pages (`catalog/sitemap.ts`, from `pd_title`). A page titled by TMDB also goes in `CONTENT_TITLED`.
- **The notice page** (`/app/parda/about`) holds TMDB's logo and notice, JustWatch's attribution, playback, players' ads, the uBlock Origin Lite stores (`BLOCKER_STORES`, the section `#ad-blocker` Task 64's button falls back to) and takedowns.
- **Sign-in and sign-up** are copies of Taskline's (layers don't import each other).

## The media kit

`src/features/parda/kit/`, every piece in the "Parda/Kit" stories (drawn stand-in pictures from `.storybook/mocks/parda.tsx`, never TMDB's):

| Piece | Notes |
| --- | --- |
| `TmdbImage` | A `PardaImage` (`{ src, srcSet, width, height }`, built by `tmdbImage(imageBase, path, kind)` in `kit/image.ts`) in a fixed box: `poster` 2:3, `backdrop` 16:9, `scope` 2.39:1. Lazy unless `priority`. No picture: the title (`label`) on a piece of mask |
| `PosterCard` | Poster and caption. A preview (backdrop, year, genres, score, overview) opens on a resting mouse; touch never opens it |
| `BackdropCard`, `EpisodeCard`, `PersonCard` | Wide cards with a detail line; an episode row; a portrait with the part or the job |
| `Rail`, `RailItem`, `RailSkeleton` | Core, in `src/components/data-display/rail.tsx`: scroll-snap, a named region, buttons for fine pointers. Give each item a width |
| `Top10Rail` | The rank in the mask under each poster |
| `RatingBadge`, `CertBadge`, `ProgressBar` | A score of 0 renders nothing; the bar is yellow on its dark track in both themes |
| `Billboard` | See below |
| Skeletons | One per piece, the same size, for streamed rails (CLS 0) |

Cards take links as `LinkOptions` (what `pardaLinks` returns). Captions sit under pictures, never on them; pass `alt=""` where the caption names the title.

**The billboard:** a poster between the masks on phones, a 2.39:1 backdrop from `md`, the tagline as a subtitle over the scrim (none when TMDB has none), and the title, facts and `actions` in the lower mask. It moves every 8 s and stops for its visible pause button, a resting mouse, focus inside it and a hidden tab; under reduced motion it never moves and the button is hidden by CSS. Only the current, previous and next pictures are mounted. The title box has one height (two lines on phones, one from `md`, a long title at half size in two lines), so moving on shifts nothing. The home's and hubs' heads preload the first picture (`pardaPageHead`).

**Captions** have one height: two lines for the title, one for the detail, so cards line up and a skeleton is exactly its card's size. **Numbers and dates** go through `formatNumber` and `formatDate` (`src/lib/i18n/intl.ts`), never `Intl.*(getLocale())`: Chrome has no Nepali ICU data, so it would print Latin digits where the server printed Devanagari and break hydration.

## Home and hubs

`/app/parda` and `/app/parda/$hub` (movies, series, anime), decision 0234. One component (`home/parda-page.tsx`) renders either from `getPardaHub`.

| File | Holds |
| --- | --- |
| `src/server/parda/catalog/rails.ts` | The layout of each page: its rails in order (id, `top10` or `poster`, label, the TMDB request), and the rail that fills the billboard. No runtime imports, so `pnpm tmdb:record` records exactly these requests. Task 69 makes it editable |
| `src/server/parda/catalog/hubs.ts` | `hubPage` (the billboard with each title's details, and the first `AWAITED_RAILS` rails) and `hubRail` (one later rail) |
| `src/features/parda/home/` | `load.ts` (the loader: awaits the page, starts every later rail, returns the picture to preload), `head.ts` (`seo()`, JSON-LD, the preload), `title-rails.tsx` (`TitleRail`, `StreamedRail`), `rail-labels.ts`, `types.ts` (the DTOs) |

- **Streaming:** the first two rails come with the page; each later one is its own `getPardaRail` query, started by the loader and rendered under `<Suspense>` with a skeleton of its size, so it streams into the same response.
- **Failure:** a rail TMDB can't answer is `null` and says "couldn't load" in a box of a rail's height; in the browser a `CatchBoundary` does the same. An empty rail isn't shown. Only `UPSTREAM_UNAVAILABLE` degrades.
- **Lean answers:** pictures are TMDB paths plus one `imageBase`, overviews are cut to 280 characters, genres are ids, rail labels are structured and named on the client.
- **Adding a rail:** add it to the page's list in `rails.ts` (and its label to `RailLabelKey` and `rail-labels.ts` if it's new), then `pnpm tmdb:record`. `tests/server/parda-catalog.test.ts` fails for a rail without a recording.

## A title's pages

`/app/parda/{movie|series}/{id}-{slug}`, `…/credits`, `/app/parda/person/{id}` and `/app/parda/collection/{id}`, decision 0235. All indexable.

| File | Holds |
| --- | --- |
| `src/features/parda/slug.ts` | `titleSlug` (from the English title), `titleParam`, `parseTitleParam` |
| `src/server/parda/catalog/title-page.ts` | `titlePage` (every section, names of countries and languages in the page's language, the player for Play), `seasonPage` (30 episodes a page), `creditsPage` |
| `src/server/parda/catalog/people.ts` | `personPage`, `collectionPage`, `surprise` |
| `src/features/parda/title/load.ts` | The loaders: data, the 301 to the canonical slug, the head (`ContentHead`: title, description, path, preview image, JSON-LD, preload). Imported lazily |
| `src/features/parda/title/head.ts` | `pardaContentHead`: renders the loader's head (route options, so small) |
| `src/features/parda/title/` | `title-hero.tsx`, `episodes.tsx`, `title-sections.tsx`, `gallery.tsx`, `video-dialog.tsx`, the four pages, `labels.ts` (TMDB's English statuses, departments, jobs and video kinds named) |

- **The title page, in order:** the hero (backdrop, tagline, poster, logo or title, facts, status and next episode; Play, Trailer, Share), the overview, a series' "New episode" banner and episodes, the cast rail and key crew, details, where to watch legally (with JustWatch's credit), videos, the gallery, the franchise banner, More like this, Similar, reviews and links.
- **The URL holds the episodes' state:** `?season`, `?page` (30 a page; some seasons have over a thousand) and `?episode` (its sheet). Season and page links don't scroll.
- **Play** is a link to the watch page, saying what the profile's progress says (*Resume · 23 min left*, *Next: S2 E6*, *Rewatch*); none when the kill switch is off or no source can play the title (`playable`). Trailers play in YouTube's privacy-enhanced embed inside a dialog, created only when it opens.
- **A blocked or unknown title, person or collection** is Parda's 404, TMDB failing a 503; a season TMDB can't answer says so inside its block.
- **"Surprise me"** (`/app/parda/surprise?from=`) redirects to a random title from the page's popular and top rated lists. Its link is never preloaded.
- **Progress on the page** (Task 64): a movie's bar under the picture; each episode's bar, Play and watched mark; each season's bar and mark; *Mark series watched* in the hero.
- **Not yet:** My List, ♥ and Like (Task 67), keywords as links (Task 66).

## Watching and progress

`/app/parda/watch/{movie|series}/{id}-{slug}` (`?s=&e=`), noindex, decision 0236.

| File | Holds |
| --- | --- |
| `src/server/parda/player/watch.ts` | `watchPage`: the title, the episode and its neighbours, every enabled source filled except `{start}`, the `ok` and `slow` orders, the deadlines, the resume |
| `src/features/parda/player/machine.ts` | The pure choices: the order, the next source (another CDN group first), the start position, stuttering, Up next |
| `src/features/parda/player/use-watch-player.ts` | The player's life: picks on mount, loads, falls back, saves progress and `pd_play`, offers a smoother server, the redirect guard |
| `src/features/parda/player/watch-page.tsx`, `watch-panels.tsx` | The page: the box, the click shield and Parda's controls, the bar (server, episodes, theater, report), Up next, the episodes sheet, *Report a problem*, the ad-blocker hint |
| `src/features/parda/player/blocker.ts` | `BLOCKER_STORES` and `blockerStore(userAgent)` |
| `src/features/parda/library/progress.ts` | Continue watching's rules, pure and isomorphic |
| `src/features/parda/library/local.ts` | The browser's own progress (`pd_progress`), the pick (`pd_server`), the hint (`pd_blocker_hint`), the `pd_local` cookie |
| `src/server/parda/library/`, `profiles/` | The upsert and its throttle, marks, *Remove*, *Rewatch*, the rail; the default profile and the `pd_profile` cookie |
| `src/functions/parda/watch.ts`, `library.ts` | The watch page, plays and reports (`withPardaCatalog`, rate limited); the library (`requirePardaViewer` → `withPardaServices`) |

- **Nothing loads before mount:** the server renders the picture in the player's box; the page reads the connection and the pick, then sets the iframe's `src`, so a slow connection never loads the wrong player and nothing shifts.
- **Failing:** the adapter's `failed`, or no moving position by the source's deadline (15 s until Task 65a measures it; a needs-click source's starts at the first click in the player). The next source is in another CDN group if there is one ("Trying Server 3…"), then the rest, then "Not available right now" with the trailer and *Report*.
- **Switching** (the server menu, or the stuttering toast's offer) starts the new player 30 s earlier; Auto clears the pick.
- **Progress** goes to the profile with a session and to the browser without one. Watching never starts a guest; a mark, *Remove* or *Rewatch* does (`guest_scope=parda`), and the browser's progress is imported once a session exists.
- **Shortcuts** (outside the iframe): `N` next, `P` previous, `E` episodes, `T` theater, `Esc` leaves theater, `K` play or pause.
- **Guests** see a banner under the top mask with the day their progress is deleted.

## Catalogue

TMDB, read through `src/server/parda/catalog/service.ts` only: that module applies takedowns and the cache epoch, so no entry point can skip them.

| File (`src/server/parda/`) | Holds |
| --- | --- |
| `tmdb/client.ts` | `createTmdb(config, fetcher)`: 8 s timeout, one retry on 5xx, one `Retry-After` wait on 429 (at most 10 s), `include_adult=false`. Failures are `UPSTREAM_UNAVAILABLE` (503); a 404 is `NOT_FOUND` |
| `tmdb/cache.ts` | LRU, a TTL per class (configuration 7 d, details 24 h, lists 1 h, search 10 min), stale for one more TTL while refreshing, concurrent reads coalesced |
| `tmdb/mappers.ts` | Zod to lean DTOs, only the fields pages use, plus the Nepali fill-in from English |
| `tmdb/store.ts` | The singletons: `pardaTmdb` (null without `TMDB_READ_TOKEN`), `pardaControls` and `pardaCache` |
| `catalog/context.ts`, `src/middleware/parda.ts` | `withPardaCatalog`: the services, the region and the cap (null until profiles, Task 64), null when not configured; anonymous calls over HTTP limited to 300 per 5 minutes per IP (SSR isn't counted) |
| `controls.ts` | Takedowns, settings and sources from Postgres, at most every 30 s per process |
| `catalog/requests.ts` | The title pages' TMDB requests (the details `append_to_response`, credits, season and person paths, the key jobs), shared with the recorder; no runtime imports |
| `tmdb/pages.ts` | A season, the full credits, a person and a collection, each with its Nepali fill-in |
| `catalog/refresh.ts`, `cron.ts` | The daily `pd_title` refresh, the top 500 of each media type |

Genre names are our own messages (`src/features/parda/genres.ts`), because TMDB's Nepali genre names are null.

**Fixtures:** `pnpm tmdb:record` writes `tests/fixtures/tmdb/` from the real API (`TMDB_READ_TOKEN` in `.env`): every rail of every page, each billboard's details with its full credits and first season, the popular lists, a few actors and every recorded movie's collection. `pardaFixturePath` (`e2e/harness/tmdb.ts`) gives the review a page of each kind from them. Tests inject them as the fetcher, and `e2e/harness/tmdb.ts` serves them. CI never calls TMDB. A file's name (`fixtureName`) is the path plus the parameters that pick the answer, without date values. Details are trimmed (long lists cut) and every file is one line. Tests take their ids from the recorded lists, so recording again changes no test.

## Sources and the player

A source is a row in `pd_source`, not code, so the admin can change one without a deploy.

- **Templates** (`src/features/parda/player/templates.ts`): tokens `{id}`, `{imdb}`, `{season}`, `{episode}`, `{color}`, `{lang}`, `{start}`. A template is a path on this app, or an absolute https URL whose origin the row lists. `PARDA_PLAYER_BASE`, when set, moves every relative template to that host.
- **Adapters** (`src/features/parda/player/adapters/`) are the only code per provider. Each turns messages into one event stream (`ready`, `position`, `play`, `pause`, `seeked`, `ended`, `failed`) and says what the player can do. `parda` is our own protocol; `none` reports nothing.
- **A message counts** only when it comes from the source's own frame and origin and passes the adapter's parser.
- **`stall.ts`** infers buffering: the position hasn't moved for 1.5 s while playing, ignoring the 3 s after a seek or a command.
- **`PlayerFrame`** is the iframe plus its messages. It has a `sandbox` attribute only when its row asks for one, never with `allow-top-navigation`.
- **CSP:** `embedOrigins` reaches `frame-src` only, never `script-src` or `connect-src`. `src/server/parda/player/csp.ts` builds it from the enabled sources for Parda's pages, and from all rows for the lab. Other pages keep the strict policy.

### The placeholder player

`GET /parda/api/{1-4}/movie/:id` and `/parda/api/{1-4}/tv/:id/:season/:episode` (`src/server/routes/parda-player.ts`), seeded as Server 1 to 4. It plays no video: a clock counts seconds and speaks the `parda` protocol, so the player UI, progress, ranking and parties can be built and tested against it.

```
to the parent:  { type: "parda.player", event: { name, position?, duration?, reason? } }
from the parent: { type: "parda.command", action: "play" | "pause" | "seek", position? }
```

`?start=` sets the start position, `?lang=` the language, and `?cue=fail|stall|silent` rehearses trouble.

### Connecting the real provider

Use a provider licensed for the catalogue you show. Either:

1. **It serves these routes:** replace the handler in `src/server/routes/parda-player.ts`, or set `PARDA_PLAYER_BASE`. If its player speaks the `parda` protocol, nothing else changes.
2. **It has its own embed:** add a row with its templates and origins, add an adapter beside `parda` (and its value to the `pd_source_adapter_valid` check, in a migration), and disable Server 1 to 4.

Then try it in the player lab.

## Player lab

`/admin/parda/player-lab` (`parda:configure`) loads any row, enabled or not, for any title, logs each message, shows stalls, and sends commands where the adapter has them. It's what you use to judge a new provider. Run it by hand in normal Chrome: automation changes how players behave.

**Findings so far:** Servers 1 to 4 report `ready`, `position`, `play`, `pause`, `seeked` and `failed`, and obey commands, under the production CSP. The questions in PLAN Task 59 about third-party players are for the real provider, once it exists.

## Controls

- **`pd_settings`** (one row): region, languages, kids' cap, banner, `playback_enabled` (the kill switch), `cache_epoch` (bumping it purges the catalogue cache), `source_order`.
- **`pd_blocked_title`:** a takedown. The title leaves lists and its details are a 404, from every entry point, within 30 s. Admin screens for both arrive in Task 65.

## Pitfalls already solved

- **The player bar grew on mount** (Parda's controls appear once the player is ready, a picked server's name is longer than Auto), shifting the page: the controls row renders from the server, disabled until ready, and the server menu is last in the bar.
- **Two `<main>` landmarks:** a player's own document can have one, and axe counts it; the watch page's `<main>` is named.
- **Paused before it moved:** progress is saved from the first moving position, so a test (or a viewer) pausing at once saves nothing; the e2e flows wait for `data-status="playing"`.

- **Nothing under `/app/parda` matched an unknown address,** so the site's 404 answered outside Parda's frame. The splat route `/app/parda/$` fixes it.
- **sr-only text inside a scrolling list widens the page:** it's absolutely positioned, so the list must be `relative` (`Rail` is, as `ScrollRegion`).
- **A billboard title box of two lines everywhere left a void under short titles on laptops;** one line from `md`, with long titles at half size, keeps one height without it.

- **Parda's tokens must outrank the visitor's presets:** `html[data-radius]` comes later in `app.css` with the same specificity, and `.dark[data-accent]` outranks the light rule, so `--radius` has its own `:root` rule and the dark rule repeats `--primary`. The "Parda/Tokens" stories check this with a rose accent and a round radius.
- **Anek's Devanagari is too big as a variable font** (258 and 726 kB), so Devanagari uses the static 700 cut, mapped to every weight and width. Only Latin takes the width axis.
- **A route `select` can't return `links`:** `useMatches` refuses functions in a selection, so `useSectionBrand` picks the plain fields with `structuralSharing`, and the head still reads the whole brand through `sectionBrandOf`.
- **`x-frame-options`:** `/**` sends `DENY` to every response, so `/parda/api/**` needs its own Nitro route rule (`SAMEORIGIN`), and the document sets `frame-ancestors 'self'`.
- **Nitro routes own their CSP:** the request middleware that adds the app's nonce doesn't run for them, so the placeholder sets its own policy with its own nonce.
- **Layer independence:** `ScrollRegion` and `.impeccable/config.json` are shared with other layers, so they're in `SHARED` in `scripts/strip-demo.ts`.
- **Two discover queries on one path** shared a fixture file named by the path alone; names now carry the parameters (`fixtureName`).
- **Trending mixes people in, and ignores `include_adult`:** the mapper keeps movies and series and drops `adult` and `softcore` items.
- **Hydration in Nepali:** the kit used `Intl.NumberFormat(getLocale())`, which prints Latin digits in Chrome and Devanagari in Node; it uses `formatNumber` now.
- **A rail heading without its buttons** (coarse pointers) was shorter than the skeleton's; the heading row is `min-h-8` everywhere.
- **A cut fixture lost what the page needs:** trimming lists to their first entries dropped the director and every trailer; the recorder keeps key crew and trailers first.
- **TanStack's `Link` sets `aria-current="page"`** on the active season link, overriding ours; the season picker uses `"page"` too.
- **Country names from the browser's `Intl`** would differ from the server's in Nepali (0234); the page builder names them on the server.
- **An index route beside a child:** `$type/$id.tsx` would make the credits page its child; the title page is `$type/$id/index.tsx` (route id `/_parda/app/parda/$type/$id/`).
