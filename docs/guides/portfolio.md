# Portfolio (the site at /)

A story-driven, design-studio-style portfolio for a full-stack developer, in both languages. It is the site's home: a pathless layout (`_site`) serves it at `/`, beside the admin, account and `/dev` sections (Task 35 moved it there from `/portfolio`; Task 40 replaces its design). Its content lives in the database and is edited in the admin (Task 39, decisions 0176–0178); 0107–0109 and 0161 explain the rest. `pnpm strip-demo` removes it as the `portfolio` layer (0163), admin and media library included.

- **Pages:** `/` (the story), `/work` (index, `?discipline=` filter), `/work/$slug` (case study), `/about`, `/journal`, `/journal/$slug`, `/contact` (with the contact form), plus a 404 in the section's own chrome. Nepali under `/ne/…`. `?preview=1` on a case study or an article shows a draft to someone who may read it.
- **Admin:** `/admin/portfolio/profile`, `/projects`, `/journal`, `/experience`, `/skills`, `/process`, `/testimonials`, `/messages` (the contact inbox) and `/admin/media` (the media library), in the sidebar's "Portfolio" group.
- **Code:** `src/routes/_site/` and `src/routes/_admin/admin/portfolio/` (routes), `src/features/portfolio/` (public pages and `admin/`), `src/features/media/`, `src/functions/portfolio*.ts` and `media.ts`, `src/server/portfolio/` and `src/server/media/`. The design system is `src/styles/portfolio.css`.

## Architecture

```
routes/_site.tsx                  layout: staticData.session = "skip", PortfolioShell (header, main, footer), font preloads
routes/_site/*.tsx                loader → ensureQuery(...QueryOptions) · component from components/pages · head → seo()
routes/_admin/admin/portfolio/    the admin sections (the CRUD standard: crud.md)

features/portfolio/
  constants.ts                    enums shared with the Drizzle schema (no imports)
  schema.ts                       the content model: inputs (strict), form values, DTOs, case-study blocks, metrics, links
  search.ts                       URL contracts: public params (discipline, preview, slug) and the admin lists
  types.ts                        what the public pages receive: one language, `lang: "en"` where untranslated
  queries.ts                      one public read per page (profile, home, work, project, about, journal, post)
  admin/                          keys, queries + mutations, columns, filters, labels, commands, components/
  lib/                            format-metric, reading-time, seeded-random, structured-data, fonts, labels, cn, weave
  components/pages/               each page's component (routes stay thin)
  components/primitives|chrome|sections|case-study|journal|work|content|contact/   page parts, presentational
features/media/                   the media library: list contract, schema, queries, MediaField + picker, the page
functions/portfolio-public.ts     public reads and the contact form (unguarded on purpose: guarded-functions test)
functions/portfolio*.ts, media.ts the admin's functions (requirePermission → withServices → one service call)
server/portfolio/                 repositories + services per entity, public.ts (published reads), messages (contact)
server/media/                     the library's usage, locks, alt text and deletes
server/db/schema/portfolio.ts     the tables (0176)
scripts/lib/portfolio-data/       the demo content, written by scripts/lib/portfolio-seed.ts (pnpm db:seed-portfolio)
```

**Data flow:** a route loader awaits `ensureQuery(projectQueryOptions(slug, preview))`; the query calls the public server function `getCaseStudy({ locale, slug, preview })`, which reads published rows (drafts too in a granted preview) and resolves them to the locale on the server; the component reads the same query with `useSuspenseQuery`. The HTML arrives complete and the browser hydrates the cache, so nothing is fetched on first paint; a client-side navigation calls the function, never the database. One call per page: `getHome` returns the whole story. There is no server cache, so publishing shows on `/` at once.

**Components are presentational:** sections take data as props (pages do the querying), which is why every one of them has a story.

## Content and languages

- **UI chrome** (labels, buttons, the site's own headings) is Paraglide messages: `portfolio_*` keys in `messages/en.json` and `messages/ne.json`.
- **Content** (projects, posts, bio…) is data. Every human-language field is `{ en, ne }` jsonb (`localizedText()`), typed in both languages in the admin (`LocalizedField`, "Nepali missing" while empty; no machine translation for content). Brand names, tech names and code are plain strings.
- **Fallback (0178):** where Nepali is empty the page shows English; `resolveLocalized` adds `lang: "en"` to a record or block with no Nepali at all, and components put it on that element (`<article lang={project.lang}>`). Alt text works the same way in `CloudImage`.
- `tests/unit/portfolio-data.test.ts` checks the demo content against the admin's input schemas and that every Nepali text is in Devanagari.

## Editing content (the admin)

- **Profile:** one form, its sections in a side navigation: identity (portrait), story (headline lines, intro, manifesto, bio), principles and numbers, links and résumé (a PDF from the library), search and sharing (SEO title, description, social image; empty means the name and intro).
- **Projects:** the CRUD standard (list, filters, form, publish, delete) plus "Reorder" (a dialog, drag or Alt + ↑/↓): published projects show in that order. The form edits the cover (a library image, or the generated art: motif, glyph, art seed), the gallery, outcome numbers, links and the case study as typed blocks (`BlocksField`): chapter, quote, code, system diagram (boxes in tiers and arrows between them), screens. "Preview" opens the public page with `?preview=1`.
- **Journal:** title, excerpt and body in both languages (the body is rich text, sanitized on the server), tags, a cover. Newest first; reading time is computed.
- **Experience, skills, process, testimonials:** short lists in display order, reordered by drag and edited in a sheet. Testimonials have a "Show on the site" switch.
- **Publishing:** needs `portfolio:publish` (from the list, or the status in the form); without it a save keeps the status and a new record is a draft. Previews need `portfolio:read`.
- **Messages:** the contact form's inbox: open (marks read), reply (your mail app), mark read/unread, archive, delete (`messages:manage`).
- **A new block type:** add it to `caseStudyBlockSchema` in `schema.ts` and to `CaseStudyBlocks` in `admin/components/case-study-blocks.tsx`; typecheck then fails in `case-study-body.tsx` until it has a renderer.
- New slugs reach the sitemap once published (`listSitemap` in `server/portfolio/public.ts`).

## Media library

Images and PDFs at `/admin/media` (decision 0177): upload (the attachments flow with the `media` scope: `attachments:upload` and `media:write`), describe in both languages, see where each is used, delete what nothing uses (the server refuses the rest, and a save that references a removed item is refused on its field). Forms pick from it with `MediaField` (`features/media/components/media-field.tsx`): "Choose from the library" opens a picker that also uploads. Library items keep their alt text; it shows wherever they're used.

## Demo content and seeding

`pnpm db:seed-portfolio` writes the demo content from `scripts/lib/portfolio-data/` when there is no profile yet (it never overwrites). `pnpm db:seed-demo`, `pnpm setup:local`, `pnpm dev:local` and the e2e harness run it too. To start your own portfolio, edit the content in the admin, or change the files in `scripts/lib/portfolio-data/` before the first seed.

## Contact form

`/contact` posts to `submitContactMessage`: a honeypot, Turnstile when `TURNSTILE_*` is set, a rate limit per sender (3 per 10 minutes, keyed by a keyed hash of the IP), then the message is saved for the inbox and emailed to the profile's address (`contact-message` template). A failed email is logged; the message is still in the inbox.

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

- **Header:** the root renders no header (each section brings its own, 0161). The portfolio's reuses the app's `LanguageSwitcher` and `ThemeToggle`, and its `<main>` is the root skip link's target (`MAIN_CONTENT`).
- **No session:** no portfolio page reads the session, so the layout sets `staticData: { session: "skip" }` and nothing looks it up, on the server or after hydration (0161).
- **Phone menu:** a native `<details>`, so it works before hydration. Escape and choosing a link close it.
- **404:** a layout's `notFoundComponent` replaces the layout itself, so it renders `PortfolioShell` around `PortfolioNotFound`. The layout's head carries `noindex` as a fallback that every page's `seo()` overrides.

## SEO

- **Indexable pages:** every page uses `seo()`, and all are in `INDEXABLE` (`tests/unit/route-seo.test.ts`).
- **JSON-LD:** `WebSite` and `Person` (home), `ProfilePage` (about), `CollectionPage` (work), `Blog` (journal), `CreativeWork` (case study), `BlogPosting` (article). All of them point to one `Person` `@id`.
- **Filtered views:** a filtered work index is `noindex`, with its canonical on the full list.

## Tests and stories

- **Unit:** `portfolio-data` (the demo content against the admin schemas, the seed conversions), `portfolio-lib` (localized fallback, metrics, seeds, reading time, `cn`).
- **Server (PGlite):** `portfolio-admin` (projects, posts, sections, profile, the contact form and inbox, the media library: versions, publish rule, reorder, usage, audit) and `portfolio-public` (published only, previews, fallback marking).
- **e2e:** `e2e/flows/portfolio.spec.ts`: create, publish and reorder a project (it appears on `/`), a draft only in a preview, the contact form reaching the inbox and the owner's email.
- **Components:** `tests/components/portfolio` (menu, marquee, copy email, split words) and `tests/components/layout/section-headers.test.tsx` (each section's header; the layout skips the session).
- **Stories:** `Portfolio/*`: primitives, every home section, chrome, case study and lists. They render the demo content (scripts/lib/portfolio-data) shaped like the public reads, through `components/story-helpers.tsx`.
- **Browser review:** the standard one (testing guide) on a production build: all seven pages plus a filtered index and the 404, and every admin page of the section, en/ne × light/dark × 390/768/1280.

## Pitfalls already solved

Moved here from CLAUDE.md, which keeps only the ones that apply everywhere. Don't reintroduce them.

- **A layout's `notFoundComponent` replaces the layout:** a `notFound()` thrown inside the section renders without the layout's wrapper, so it must render the shell itself (`PortfolioShell` in `routes/_site.tsx`).
- **Custom `text-*` sizes and tailwind-merge:** `cn("text-pf-h2", "text-pf-accent")` drops the size with the app's `cn` (both look like colours). Portfolio components import `cn` from `features/portfolio/lib/cn.ts`, which registers the scale.
- **Reordering keeps the version:** moving a project or a section entry sets `updatedAt` to itself, so `$onUpdate` doesn't bump it and an open edit of that record isn't stale (0176).
- **Seeds read rows, not row counts:** PGlite reports `affectedRows` 0 for a `select`, so an "is it seeded?" check looks at `rows.length` (`scripts/lib/portfolio-seed.ts`).
- **Variable fonts with a width axis need one fallback per width:** Anek's `wdth` changes its advance widths and Arial has no such axis, so the portfolio has a fallback face per width it uses (100% body, 75% bold display). A new width or weight for large type needs its own measured `size-adjust` (0110).
