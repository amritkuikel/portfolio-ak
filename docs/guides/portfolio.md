# Portfolio (the editorial site at /portfolio)

A story-driven, design-studio-style portfolio for a full-stack developer, in both languages, running on typed demo data. It lives entirely under `/portfolio` and leaves every other page as it was. Decisions 0105–0109 explain the choices.

- **Pages:** `/portfolio` (the story), `/portfolio/work` (index, `?discipline=` filter), `/portfolio/work/$slug` (case study), `/portfolio/about`, `/portfolio/journal`, `/portfolio/journal/$slug`, `/portfolio/contact`, plus a 404 in the section's own chrome. Nepali under `/ne/portfolio/…`.
- **Code:** `src/routes/portfolio/` (routes) and `src/features/portfolio/` (everything else). The design system is `src/styles/portfolio.css`.

## Architecture

```
routes/portfolio/route.tsx        layout: staticData.chrome = "bare", PortfolioShell (header, main, footer), font preloads
routes/portfolio/*.tsx            loader → ensureQueryData(...QueryOptions) · component → useSuspenseQuery · head → seo()

features/portfolio/
  schema.ts                       Zod records (what a backend returns): Localized fields, typed content blocks, URL params
  types.ts                        what the UI receives: Resolved<Record> (one language, no { en, ne } left)
  source.ts                       the PortfolioSource port (getProfile, listProjects, getProject, listPosts, …)
  sources/fixture-source.ts       the demo adapter: lazy-loads data/, sorts, filters, resolves the locale
  sources/index.ts                the active adapter: swap this one line for real data
  queries.ts                      queryOptions per read; keys include the locale; staleTime Infinity
  data/                           the demo content (one file per project and per article)
  lib/                            localize, format-metric, seeded-random, structured-data, fonts, labels, cn
  components/primitives/          the design system in React (Display, Eyebrow, Chapter, ArrowLink, CoverArt, …)
  components/chrome|sections|case-study|journal|work|content|contact/   page parts, all presentational
```

**Data flow:** a route loader awaits `ensureQueryData(projectQueryOptions(slug))`; the query calls `portfolioSource.getProject(getLocale(), slug)`; the component reads the same query with `useSuspenseQuery`. The HTML arrives complete and the browser hydrates the cache, so nothing is fetched on first paint. The fixture module is its own chunk (`import("../data")`), so pages outside the section never download it, and SSR'd portfolio pages don't either.

**Components are presentational:** sections take data as props (routes do the querying), which is why every one of them has a story.

## Content and languages

- **UI chrome** (labels, buttons, the site's own headings) is Paraglide messages: `portfolio_*` keys in `messages/en.json` and `messages/ne.json`.
- **Content** (projects, posts, bio…) is data, like database rows. Every human-language field is `{ en, ne }` in the fixtures and `resolveLocalized(record, locale)` turns the whole record into one language. Brand names, tech names and code are plain strings.
- `tests/unit/portfolio-data.test.ts` parses every record and checks that every Nepali text is actually in Devanagari (and every English one isn't).

## Adding or changing content

- **A project:** add `data/projects/<slug>.ts` exporting a `ProjectRecord` and list it in `data/projects/index.ts`. Pick a cover `motif` (grid, orbit, waves, blocks, type, terrain, signal) and a one-to-three character `glyph`. `featured: true` puts it on the home page (the story is written for four). The body is a list of blocks: `chapter`, `quote`, `code`, `architecture` (nodes in tiers plus edges between them), `gallery` (one caption per generated screen).
- **An article:** add `data/posts/<slug>.ts` (`PostRecord`) and list it in `data/posts/index.ts`. Blocks: `paragraph`, `heading`, `quote`, `code`, `list`. Reading time is computed.
- **Profile, process, capabilities, experience, testimonials:** edit the matching file in `data/`.
- **A new block kind:** add it to the union in `schema.ts`. Typecheck then fails in the block renderer (`case-study-body.tsx` or `article-body.tsx`) until it has a component.
- New slugs reach the sitemap automatically (`portfolioSource.listSlugs()` in `src/server/seo/sitemap.ts`).

## Replacing the demo data

Write an adapter that implements `PortfolioSource`, then export it from `sources/index.ts`. Routes and components don't change.

- **Database or CMS:** read on the server. Wrap each method in a server function (`src/functions/portfolio.ts`, public reads, so no permission) that calls `src/server/portfolio/…`, and have the adapter call those functions. Keep the method contract: take the locale, return resolved records, `null` for a missing slug.
- **Keeping `{ en, ne }`:** store the localized fields as JSON or as one column per language, and reuse `resolveLocalized` on the server.
- **Real images:** replace `CoverArt` and `ScreenArt` with `CloudImage` (attachments guide), keeping `CoverFrame` for the fixed ratio and the view-transition name.

## Design system: "Dhaka"

Named after the handloom cloth of Palpa: an indigo ground, threads of crimson, marigold, jade and cotton, and stepped geometry woven on a grid (decision 0110). Everything is scoped: the tokens live under `.portfolio`, and every utility and token is prefixed `pf-`.

- **Colour:**
  - Tokens: `pf-paper` (cotton white, indigo night in dark mode), `pf-paper-2`, `pf-ink` (indigo), `pf-ink-2`, `pf-stone` (muted text), `pf-line` (hairlines) and `pf-accent` (crimson, the only thread that carries text).
  - Threads: `pf-crimson`, `pf-marigold` and `pf-jade` are the same in both themes. Use them for weaves, markers and bands, not for text.
  - Use them as Tailwind colours: `bg-pf-paper`, `text-pf-stone`, `fill-pf-jade`. Every text pair is at least 4.5:1.
- **Bands:** `pf-inverse` flips a section to the other palette (indigo in light mode, cotton in dark mode). `pf-accent-band` is the marigold band, always with the light palette's indigo ink.
- **Type:** Anek Latin and Anek Devanagari, one family for both scripts. Its width axis does the work:
  - `pf-display`: condensed (`font-stretch: 75%`) and bold, with sizes `text-pf-h2` … `text-pf-mega`. `text-pf-h3` opens up to the normal width at 600.
  - `pf-quote`: large running text (manifesto, quotes), normal width, medium weight. There is no italic.
  - Body (`text-pf-body`, `text-pf-lead`, `text-pf-small`) is set by `pf-canvas`.
  - `pf-label`: small semibold labels in sentence case. Don't uppercase them.
  - JetBrains Mono (`font-pf-mono`) is for code blocks only.
  - Sizes are fluid (`clamp()`). `Display` takes the element (`as`) and the look (`size`) separately.
- **Markers:** `Eyebrow` marks a label with a diamond in the chapter's thread (`index` picks it, and `threadBg(i)` gives the class). Use numerals only for real sequences, such as process steps.
- **Layout:**
  - `pf-container` is the centred column with the fluid margin.
  - `pf-grid` is 4 columns on phones and 12 from 48rem, used with `col-span-*` and `md:col-start-*`.
  - `pf-section` is the vertical rhythm between chapters.
  - `pf-measure` caps line length at 62ch.
- **Links and focus:** `pf-link` draws a crimson thread under the text on hover and focus. `pf-focus` adds the accent focus ring.
- **`cn` in portfolio components** comes from `features/portfolio/lib/cn.ts`. It teaches tailwind-merge the `text-pf-*` size scale. With the app's `cn`, `text-pf-h2 text-pf-accent` would lose the size.

### Motion (CSS only)

All of it is progressive enhancement. Content is visible by default, and animations run only on screens, where supported, and when the reader hasn't asked for reduced motion. Only `transform`, `clip-path` and `color` animate, so nothing shifts the layout and axe never sees half-transparent text.

| Effect | How |
| --- | --- |
| Hero lines rise on load | `.pf-line` masks each line, and `--i` staggers them |
| Hero cloth weaves in, row by row | `<Weave animate>` / `.pf-weaving`, a `steps()` clip-path animation |
| Blocks wipe into view | `<Reveal>` / `.pf-reveal`, a scroll-driven `animation-timeline: view()` |
| Manifesto inks in word by word | `<SplitWords>` sets `--i`/`--n` per word, `.pf-words` |
| Covers settle while scrolling | `.pf-parallax` |
| Toolbox marquee | `<Marquee>`: pure CSS, a pause button (WCAG 2.2.2), static under reduced motion |
| Article reading progress | `.pf-progress`, `animation-timeline: scroll(root)` |
| Card cover → case study hero | `CoverFrame transitionSlug` + `<Link viewTransition>` (View Transitions) |

### Generated art

- **`Weave`** draws a piece of Dhaka cloth from a seed (`lib/weave.ts`): mirrored bands of stripes, zigzags, stepped diamonds, triangles and checks on a cell grid, merged into runs. The ground is the ink token and cotton is the paper token, so indigo cloth becomes white cloth in dark mode.
- **`CoverArt`** is a project's cloth, with its glyph on a cotton label. The motif sets the cell size (a fine or a bold weave). **`ScreenArt`** draws a browser window with a table, a chart or cards.
- **Determinism:** both use a seeded generator (`lib/seeded-random.ts`) and round coordinates, so server and browser print identical markup.
- **Theming:** colours are token classes, so the art follows the theme and the bands.
- **No layout shift:** wrap them in `CoverFrame` (a fixed aspect ratio).

### Fonts and layout shift

- **Loading:** the faces load lazily (`@font-face` is only fetched when used). The layout preloads Anek Latin, plus Anek Devanagari on Nepali pages (`lib/fonts.ts`, production only).
- **One fallback per width:** Anek changes width along its `wdth` axis and Arial has none, so the body (100%) and the condensed display (75%, bold) each have a fallback face whose `size-adjust` was measured in Chrome. Line heights are always explicit, so matching widths keeps the line breaks. A new width or weight for large type needs its own measurement.
- **Never inline fonts:** `vite.config.ts` never inlines font files, because the CSP's `font-src 'self'` would block a `data:` font.

## Chrome

- **Header:** the layout sets `staticData: { chrome: "bare" }` and the root's `SiteHeader` renders nothing under it (`src/lib/chrome.ts`). The portfolio brings its own header and reuses the app's `LanguageSwitcher` and `ThemeToggle`.
- **Phone menu:** a native `<details>`, so it works before hydration. Escape and choosing a link close it.
- **404:** a layout's `notFoundComponent` replaces the layout itself, so it renders `PortfolioShell` around `PortfolioNotFound`. The layout's head carries `noindex` as a fallback that every page's `seo()` overrides.

## SEO

- **Indexable pages:** every page uses `seo()`, and all are in `INDEXABLE` (`tests/unit/route-seo.test.ts`).
- **JSON-LD:** `Person` (home), `ProfilePage` (about), `CollectionPage` (work), `Blog` (journal), `CreativeWork` (case study), `BlogPosting` (article). All of them point to one `Person` `@id`.
- **Filtered views:** a filtered work index is `noindex`, with its canonical on the full list.

## Tests and stories

- **Unit:** `portfolio-data` (fixtures), `portfolio-source` (the adapter), `portfolio-lib` (localize, metrics, seeds, reading time, `cn`, chrome).
- **Components:** `tests/components/portfolio` (menu, marquee, copy email, split words) and `tests/components/layout/site-chrome.test.tsx` (existing pages keep the header).
- **Stories:** `Portfolio/*`: primitives, every home section, chrome, case study and lists. They render the fixtures directly through `components/story-helpers.tsx`.
- **Browser review:** the standard one (testing guide) on a production build: all seven pages plus a filtered index and the 404, en/ne × light/dark × 390/768/1280.
