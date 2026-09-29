# Decisions

Record every non-obvious choice here: **What**, **Why**, **Alternatives considered**. Newest entries at the bottom.

---

## 0001: Project has its own git repository

- **What:** `git init` inside the project folder instead of committing to the enclosing repository.
- **Why:** The only enclosing repository was rooted at `C:\` and tracks the whole drive. Project history must be isolated and pushable on its own.
- **Alternatives considered:** Committing to the drive-level repository (rejected: pollutes an unrelated repo and risks leaking unrelated files).

## 0002: Default deployment target is Vercel (assumption)

- **What:** The plan assumes a Node-compatible serverless host (Vercel) using TanStack Start's official hosting adapter.
- **Why:** The Neon driver choice (Phase 3) and the security-header mechanism (Phase 12) depend on the runtime. A default avoids blocking.
- **Alternatives considered:** Long-running Node server, Netlify, Cloudflare Workers. Revisit before Phase 3 if the target differs.

## 0003: Scaffold with the official TanStack CLI (Biome, Vercel, shadcn add-ons)

- **What:** `@tanstack/cli create --toolchain biome --deployment vercel --add-ons shadcn --no-examples`. Only Phase 1 add-ons were selected. The `.cta.json` file is kept so later phases can use `tanstack add` for official add-ons.
- **Why:** This is the starter the TanStack Start docs point to. It wires the Start, Tailwind v4 and Nitro Vite plugins the officially supported way.
- **Alternatives considered:** Cloning `examples/react/start-basic` with gitpick (no Biome, Tailwind or deploy adapter). `shadcn init -t start` (a different starter with its own conventions).

## 0004: Nitro is the server build; the Vercel preset is auto-detected

- **What:** The Vercel add-on uses `nitro/vite` plus `vercel.json`. Local builds use Nitro's `node-server` preset, and `pnpm start` runs `.output/server/index.mjs`. On Vercel, Nitro switches to its Vercel preset automatically.
- **Why:** This is the adapter the official CLI generates for Vercel. `nitro` is pinned to the exact beta version the CLI chose, because beta versions can break between releases.
- **Alternatives considered:** Hardcoding `preset: "vercel"`, which would break the local `pnpm start`.

## 0005: Only "use client" warnings from dependencies are filtered in the Nitro build

- **What:** `vite.config.ts` gives Nitro an `onwarn` handler. It drops only `MODULE_LEVEL_DIRECTIVE` warnings about `"use client"` in `node_modules`. Nitro's default ignore list is re-applied, because a custom handler replaces it.
- **Why:** `@tanstack/react-router` and `sonner` ship `"use client"` for React Server Component frameworks. The directive has no meaning in this app. `@vitejs/plugin-react` already silences it for the client and SSR builds, but Nitro's separate Rolldown pass does not. The warnings come from upstream packages, so they can't be fixed in this repo.
- **Alternatives considered:** Ignoring all `MODULE_LEVEL_DIRECTIVE` warnings (too broad, would hide directives in our own code). Living with 21 warnings per build.

## 0006: Import alias is `@/`, not the starter's `#/`

- **What:** `@/*` maps to `src/*` through tsconfig `paths`, resolved by Vite's `resolve.tsconfigPaths`. The starter's `#/*` Node subpath import was removed.
- **Why:** `@/` is shadcn's documented default and has one source of truth. Two aliases for the same folder invite inconsistency. The shadcn CLI (4.21.0) emits a bare `"cn"` import for either alias, which is fixed by hand and noted in the README.
- **Alternatives considered:** Keeping `#/` (native, but non-standard for shadcn and other tooling).

## 0007: Self-hosted fonts with preloads and metric-matched fallbacks

- **What:** Inter Variable (Latin) and Noto Sans Devanagari Variable come from Fontsource packages imported in `app.css`. The Inter Latin subset and the Noto Devanagari subset are preloaded, with `crossorigin` set, from `src/lib/fonts.ts`. Other subsets load on demand through `unicode-range`. `font-display: swap` comes from Fontsource. The fallback faces keep line boxes stable during the swap. `Inter Fallback` is Arial with size, ascent and descent overrides. `Noto Sans Devanagari Fallback` uses system Devanagari fonts with Noto's vertical metrics.
- **Why:** Self-hosting avoids a third-party request, is privacy-friendly, and keeps the Phase 12 CSP simple. The preload `?url` imports resolve to the same hashed files the CSS uses, so nothing downloads twice (verified in the network log). Inter overrides are computed with `@capsizecss/metrics` and match next/font's published values. Devanagari `size-adjust` stays at 100% because no system-font width metrics exist to compute it from. Measured layout shift is 0 on the home page on a throttled network.
- **Alternatives considered:** A Google Fonts `@import` (the starter's approach: render-blocking, third-party, not preloadable by hash). `font-display: optional` (no shift, but the web font often never shows on a first visit). The Fontaine plugin (an extra build dependency for two fonts).
- **Follow-up (Phase 4):** Preload the Devanagari subset only on `ne` pages, so English pages don't download 121 kB they may not use.

## 0008: `next-themes` removed from the shadcn Sonner component

- **What:** `Toaster` takes a `theme` prop, defaulting to `"system"`, instead of calling `useTheme()` from `next-themes`.
- **Why:** Theme state belongs to the TanStack Store theme in Phase 8. `next-themes` is Next.js-oriented and would be a second source of truth.
- **Alternatives considered:** Keeping `next-themes` until Phase 8 (dependency churn).

## 0009: TanStack router CLI removed; the route tree is committed

- **What:** `@tanstack/router-cli` was dropped. The Start Vite plugin regenerates `src/routeTree.gen.ts` on `dev` and `build`. The file is committed so `pnpm typecheck` works on a fresh clone.
- **Why:** The CLI printed a Node circular-dependency warning on every run, and the Vite plugin already does its job.
- **Alternatives considered:** Running `tsr generate` before `tsc` (duplicate work, plus the warning).

## 0010: Prettier remains only as a transitive dependency

- **What:** Prettier is installed only because `@tanstack/router-generator` uses it internally to format the generated route tree. There is no Prettier config, no script, and no direct dependency.
- **Why:** It is an internal detail of TanStack's generator and can't be removed without forking it. Biome is the project's only formatter and linter.
