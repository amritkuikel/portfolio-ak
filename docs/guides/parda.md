# Parda

Parda (पर्दा, "the screen") is a movie and series product at `/app/parda`, run from `/admin/parda`, built as a removable layer (`pnpm strip-demo`; decision 0228). The plan is [PLAN.md](../PLAN.md), section 12.

**Today (Task 59) it is a foundation:** no public page exists yet, and **no real video plays**. The servers are a placeholder until a licensed provider is connected (see "Connecting the real provider").

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

- **`x-frame-options`:** `/**` sends `DENY` to every response, so `/parda/api/**` needs its own Nitro route rule (`SAMEORIGIN`), and the document sets `frame-ancestors 'self'`.
- **Nitro routes own their CSP:** the request middleware that adds the app's nonce doesn't run for them, so the placeholder sets its own policy with its own nonce.
- **Layer independence:** `ScrollRegion` and `.impeccable/config.json` are shared with other layers, so they're in `SHARED` in `scripts/strip-demo.ts`.
