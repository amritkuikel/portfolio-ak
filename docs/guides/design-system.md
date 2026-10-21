# Design system: Graphite

Graphite is the look of everything except the portfolio: the admin area, the sign-in pages, the account page, `/dev` and, later, the apps. It is Linear-style: dense, neutral, one accent colour, keyboard first.

The portfolio at `/` has its own scoped system (`src/styles/portfolio.css`, [portfolio.md](portfolio.md)). <!-- @portfolio -->

Decisions: 0164 (tokens and presets), 0165 (the command palette), 0166 (the dashboard).

## Tokens

All in `src/styles/app.css`: custom properties on `:root` (light) and `.dark`, mapped to Tailwind utilities in `@theme inline`.

| Token | Use | Utility |
| --- | --- | --- |
| `--background` | The page | `bg-background` |
| `--surface-1` | Sidebar, muted panels, the sign-in brand panel | `bg-surface-1` |
| `--surface-2` | Cards, popovers, menus (`--card` and `--popover` point here) | `bg-surface-2`, `bg-card` |
| `--foreground`, `--muted-foreground` | Text, secondary text | `text-foreground`, `text-muted-foreground` |
| `--border`, `--input` | Hairlines, control borders | `border`, `border-input` |
| `--accent` | Hover and selected backgrounds (shadcn's name) | `bg-accent` |
| `--primary`, `--primary-foreground` | The brand accent and text on it | `bg-primary`, `text-primary` |
| `--accent-subtle` | A tint of the accent (selected tiles, avatars) | `bg-accent-subtle` |
| `--ring` | Focus rings (the accent) | `ring-ring` |
| `--success`, `--warning`, `--info`, `--danger` | Status: text, icons or a solid fill | `text-success`, `bg-danger` |
| `--<status>-foreground`, `--<status>-subtle` | Text on the solid fill; a tinted background | `bg-success-subtle` |
| `--chart-1…5` | Chart series (chart 1 is the accent) | `fill-chart-1` |
| `--elevation-xs…lg` | Shadows (stronger in dark mode, with a faint top highlight) | `shadow-xs` … `shadow-lg` |

Neutrals are a cool graphite (hue 265, almost no chroma). Dark mode is near-black (`oklch(0.165 …)`, `#0d0e11`), never `#000`. `--danger` is `--destructive`; `--destructive-foreground` is now text *on* destructive (it used to be red text and was unused).

**Type scale** (`@theme`): `text-display` (30 px, page titles on dashboards), `text-title` (22 px, `PageHeader`'s h1), `text-heading` (15 px, section headings), `text-body` (14 px), `text-caption` (12 px). Each sets its line height, and the headings their weight and tracking. The app's `cn` (`src/lib/utils.ts`) knows them, so `cn("text-title", "text-muted-foreground")` keeps both.

**Inter** gets `cv11` (single-storey a) and `ss01` (open digits) on `body`. Tables and anything with `data-figures` (stat cards) use tabular numerals.

## Presets

Three preferences, each an attribute on `<html>`, rendered by the server from a cookie (`preferenceHtmlProps` in `components/layout/theme.tsx`), so there is no flash:

| Preset | Attribute | Values | Sets |
| --- | --- | --- | --- |
| Accent | `data-accent` | `indigo` (default), `violet`, `emerald`, `amber`, `rose` | `--primary`, `--primary-foreground`, `--accent-subtle`, `--chart-2…5` (light and dark) |
| Radius | `data-radius` | `sharp` (4 px), `default` (8 px), `round` (14 px) | `--radius`; `rounded-sm…xl` scale from it |
| Density | `data-density` | `comfortable` (default), `compact` | `--control-height` (36 / 32 px), `--row-padding` (8 / 5 px) |

- **Where they're set:** `/admin/settings/appearance`, per browser, like the theme. The store (`useAppearance()` in `src/lib/stores/hooks.ts`) re-renders `<html>`'s attributes at once, and the cookie makes the next request render them.
- **Controls follow density:** `Button` (default, `sm`, `icon`, `icon-sm`), `Input`, `InputGroup`, `NativeSelect`, `Select` and the filter bar use `h-(--control-height)`; table cells use `py-(--row-padding)`. Use the same variables in a new control.
- **Scoped accents:** accent selectors match any element, so `<span data-accent="rose" class="bg-primary">` draws a rose swatch inside an indigo page. Only the tokens a preset sets change in such a scope.

## Contrast is tested

`tests/unit/design-tokens.test.ts` reads `app.css`, applies the rules the way `<html class="dark" data-accent="…">` matches them, resolves `var()`, converts oklch to sRGB and checks every text pair at 4.5:1 in every accent × theme: foreground on every surface, muted text, primary text and fills, sidebar pairs, and each status (foreground on fill, colour on subtle and on surfaces). The browser review sees only the default preset; this test covers the other nine.

## Shells

Each layout renders its own frame (one header per section, 0161):

| Layout | Frame | Where |
| --- | --- | --- |
| `_admin` | `AdminShell`: sidebar, topbar, command palette | `components/admin-shell/` |
| `_auth`, `_public` | `AuthShell`: the page on the left, contour art on the right (one column on phones) | `components/auth-shell/` |
| `_authed` (account; the apps later) | `AppHeader`: brand, admin link when permitted, language, theme, user menu | `components/app-header/` |
| `dev` | `SiteHeader` with the demo's links, and the footer | `components/layout/site-header.tsx` |

**Admin shell:**
- **Sidebar:** shadcn's `Sidebar` (`components/ui/sidebar.tsx`), collapsing to icons on desktop (labels move into tooltips) and a sheet on phones, chosen by CSS, not by JavaScript (see the pitfalls). Its open state is the `sidebar` preference cookie, not shadcn's own cookie, and its container is sticky rather than fixed, so a banner above it (impersonation) pushes it down. `SidebarInset` is a `<div>`: each page renders its own `<main>`.
- **Sections** come from `ADMIN_SECTIONS` (`features/admin/sections.ts`): `group` (`overview`, `portfolio`, `apps`, `access`, `system`), `keywords` for the palette, and `permission` (`null` for personal pages any admin-area user may open, like Appearance). Ctrl/⌘ B toggles the sidebar.
- **Topbar:** the trigger, the breadcrumbs (taken out of `PageHeader`), the palette button with its `Kbd` hint, language, theme, and the user menu on phones (the sidebar's footer has it on desktop).
- **Command palette:** see [conventions.md](conventions.md), "The command palette and view transitions".

**Brand:** `BrandMark` (three contour rings in the accent) and `BrandName` (`components/brand/brand.tsx`). `ContourArt` (`components/brand/contour-art.tsx`) draws a seeded topographic ridge as a server-rendered SVG (`aria-hidden`, same output for a seed everywhere); the portfolio redesign can reuse it.

**Building blocks so far:** `StatCard` (value, label, delta, hint, optional link) and `StatusBadge` (a status word with its tint) in `components/data-display/`. Task 37 grows the kit.

## Theming a new project

1. **Presets first:** change the defaults in `DEFAULT_PREFERENCES` (`src/lib/stores/preferences.ts`) and the matching `:root` values (the default accent, `--radius`, `--control-height`, `--row-padding`). Remove presets you don't offer from `ACCENTS` and their blocks in `app.css`.
2. **A new accent:** add it to `ACCENTS`, add a light block and a `.dark` block like the others (keep dark accents light, with dark text on them), a label message, and run the contrast test.
3. **Your own neutrals:** change `:root` and `.dark`, then run `pnpm exec vitest run tests/unit/design-tokens.test.ts` and update `THEME_COLORS` in `src/routes/__root.tsx` to the new `--background` values (hex).
4. **Fonts:** Inter and Noto Sans Devanagari have metric-matched fallbacks in `app.css`. A new face needs its own fallback ([i18n.md](i18n.md), "Fonts are never inlined").

## Pitfalls already solved

- **shadcn's sidebar writes its own cookie and renders a `<main>`:** our copy doesn't (the preference store persists `sidebar`; pages own `<main>`). Keep that when updating `ui/sidebar.tsx`.
- **No `isMobile` state after hydration:** shadcn's `useIsMobile` sets state in an effect and swaps the sidebar for the sheet. That update made React hydrate the rest of the page at once, and a route rendering its error (the editor's 403 on `/admin/audit` at 390 px) threw again: "recovered" React error #520 in the browser review. Our sidebar renders both forms (CSS shows one), the trigger is two buttons (`md:hidden` opens the sheet, `max-md:hidden` collapses), the keyboard shortcut checks the screen when pressed, and content inside the sheet knows it from a context. Don't bring `use-mobile.ts` back.
- **`CommandDialog`'s hidden title sat outside the dialog** (shadcn renders it before `DialogContent`), so it was page content outside every landmark (axe `region` on every admin page). It is inside the content now.
- **Hard-coded English in shadcn primitives:** `sidebar.tsx`, `sheet.tsx` and `breadcrumb.tsx` use messages for their screen-reader text; a newly added primitive needs the same pass. `BreadcrumbPage` drops shadcn's `role="link" aria-disabled` (a link that can't be focused).
- **An `aria-label` that hides visible text** fails axe's `label-content-name-mismatch`: the user menu's avatar initials are `aria-hidden`, and its name is in an `sr-only` span.
- **Platform-specific text after hydration** (`⌘` vs `Ctrl`) renders the server's value first (`useSyncExternalStore` with a server snapshot) in a fixed-width `Kbd`, so the swap never shifts layout.
