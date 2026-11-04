# Parda

Parda (पर्दा, "the screen") is a movie and series product at `/app/parda`, run from `/admin/parda`, built as a removable layer (`pnpm strip-demo`; decision 0228). The plan is [PLAN.md](../PLAN.md), section 12.

**Today (Tasks 59 to 61) it is a foundation, a design system, a frame and a media kit:** the pages are a placeholder home, the notice page, sign-in, sign-up and the 404, and **no real video plays**. The servers are a placeholder until a licensed provider is connected (see "Connecting the real provider").

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
| `src/features/parda/links.ts` | `pardaLinks` and `PARDA_PATHS`: every link into Parda. A link arrives with its route |
| `src/features/parda/shell/` | `PardaFrame` (top mask, footer, tab bar), `PardaSection` and `PardaNotFound`, the wordmark, the account menu |
| `src/server/parda/manifest.ts`, `src/server/routes/parda-manifest.ts` | The manifest in each language, a Nitro route (`vite.config.ts`) |
| `public/parda/` | The icons, rendered from `icon.svg`, and TMDB's logo (`tmdb.svg`, TMDB's own file) |

- **One frame on every page** (decision 0233): the layout renders it, and the page renders its `<main>`. The top mask is always solid, so nothing in it sits on a picture.
- **Sections:** the top mask's links from `md` up, the tab bar below. Add a section to `SECTIONS` in `parda-frame.tsx` when its route exists. The frame keeps the tab bar's height clear on phones.
- **The 404:** `/app/parda/$` throws `notFound()`, so the layout's `notFoundComponent` answers in the frame.
- **SEO:** pages are `noindex` through the layout. An indexable page uses `seo({ siteName: PARDA_NAME })`, goes in `INDEXABLE` (`tests/unit/route-seo.test.ts`) and the sitemap. Today that's `/app/parda/about`; the home becomes indexable in Task 62.
- **The notice page** (`/app/parda/about`) holds TMDB's logo and notice, JustWatch's attribution, playback, players' ads, the uBlock Origin Lite stores (`BLOCKER_STORES`, the section `#ad-blocker` Task 64's button falls back to) and takedowns.
- **Sign-in and sign-up** are copies of Taskline's (layers don't import each other).

## The media kit

`src/features/parda/kit/`, every piece in the "Parda/Kit" stories (drawn stand-in pictures from `.storybook/mocks/parda.tsx`, never TMDB's):

| Piece | Notes |
| --- | --- |
| `TmdbImage` | A server-built `PardaImage` (`{ src, srcSet, width, height }`) in a fixed box: `poster` 2:3, `backdrop` 16:9, `scope` 2.39:1. Lazy unless `priority`. No picture: the title (`label`) on a piece of mask |
| `PosterCard` | Poster and caption. A preview (backdrop, year, genres, score, overview) opens on a resting mouse; touch never opens it |
| `BackdropCard`, `EpisodeCard`, `PersonCard` | Wide cards with a detail line; an episode row; a portrait with the part or the job |
| `Rail`, `RailItem`, `RailSkeleton` | Core, in `src/components/data-display/rail.tsx`: scroll-snap, a named region, buttons for fine pointers. Give each item a width |
| `Top10Rail` | The rank in the mask under each poster |
| `RatingBadge`, `CertBadge`, `ProgressBar` | A score of 0 renders nothing; the bar is yellow on its dark track in both themes |
| `Billboard` | See below |
| Skeletons | One per piece, the same size, for streamed rails (CLS 0) |

Cards take links as `LinkOptions` (what `pardaLinks` returns). Captions sit under pictures, never on them; pass `alt=""` where the caption names the title.

**The billboard:** a poster between the masks on phones, a 2.39:1 backdrop from `md`, the tagline as a subtitle over the scrim (none when TMDB has none), and the title, facts and `actions` in the lower mask. It moves every 8 s and stops for its visible pause button, a resting mouse, focus inside it and a hidden tab; under reduced motion it never moves and the button is hidden by CSS. Only the current, previous and next pictures are mounted. The title box has one height (two lines on phones, one from `md`, a long title at half size in two lines), so moving on shifts nothing. Preload the first picture from the page's head (Task 62).

## Catalogue

TMDB, read through `src/server/parda/catalog/service.ts` only: that module applies takedowns and the cache epoch, so no entry point can skip them.

| File (`src/server/parda/`) | Holds |
| --- | --- |
| `tmdb/client.ts` | `createTmdb(config, fetcher)`: 8 s timeout, one retry on 5xx, one `Retry-After` wait on 429 (at most 10 s), `include_adult=false`. Failures are `UPSTREAM_UNAVAILABLE` (503); a 404 is `NOT_FOUND` |
| `tmdb/cache.ts` | LRU, a TTL per class (configuration 7 d, details 24 h, lists 1 h, search 10 min), stale for one more TTL while refreshing, concurrent reads coalesced |
| `tmdb/mappers.ts` | Zod to lean DTOs, only the fields pages use, plus the Nepali fill-in from English |
| `tmdb/images.ts` | `{ src, srcSet, width, height }` with fixed aspects (posters 2:3, backdrops 16:9) |
| `tmdb/store.ts` | The singletons: `pardaTmdb` (null without `TMDB_READ_TOKEN`) and `pardaControls` |
| `controls.ts` | Takedowns, settings and sources from Postgres, at most every 30 s per process |
| `catalog/refresh.ts`, `cron.ts` | The daily `pd_title` refresh, the top 500 of each media type |

Genre names are our own messages (`src/features/parda/genres.ts`), because TMDB's Nepali genre names are null.

**Fixtures:** `pnpm tmdb:record` writes `tests/fixtures/tmdb/` from the real API (`TMDB_READ_TOKEN` in `.env`). Tests inject them as the fetcher, and `e2e/harness/tmdb.ts` serves them. CI never calls TMDB. Tests take their ids from the popular lists, so recording again changes no test.

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

- **Nothing under `/app/parda` matched an unknown address,** so the site's 404 answered outside Parda's frame. The splat route `/app/parda/$` fixes it.
- **sr-only text inside a scrolling list widens the page:** it's absolutely positioned, so the list must be `relative` (`Rail` is, as `ScrollRegion`).
- **A billboard title box of two lines everywhere left a void under short titles on laptops;** one line from `md`, with long titles at half size, keeps one height without it.

- **Parda's tokens must outrank the visitor's presets:** `html[data-radius]` comes later in `app.css` with the same specificity, and `.dark[data-accent]` outranks the light rule, so `--radius` has its own `:root` rule and the dark rule repeats `--primary`. The "Parda/Tokens" stories check this with a rose accent and a round radius.
- **Anek's Devanagari is too big as a variable font** (258 and 726 kB), so Devanagari uses the static 700 cut, mapped to every weight and width. Only Latin takes the width axis.
- **A route `select` can't return `links`:** `useMatches` refuses functions in a selection, so `useSectionBrand` picks the plain fields with `structuralSharing`, and the head still reads the whole brand through `sectionBrandOf`.
- **`x-frame-options`:** `/**` sends `DENY` to every response, so `/parda/api/**` needs its own Nitro route rule (`SAMEORIGIN`), and the document sets `frame-ancestors 'self'`.
- **Nitro routes own their CSP:** the request middleware that adds the app's nonce doesn't run for them, so the placeholder sets its own policy with its own nonce.
- **Layer independence:** `ScrollRegion` and `.impeccable/config.json` are shared with other layers, so they're in `SHARED` in `scripts/strip-demo.ts`.
