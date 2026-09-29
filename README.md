# Portfolio

A bilingual (English + Nepali), server-rendered portfolio app built on TanStack Start.

The full plan, phases and Definition of Done live in [docs/PLAN.md](docs/PLAN.md). Non-obvious choices are recorded in [docs/decisions.md](docs/decisions.md). This README is completed in Phase 12.

## Requirements

- Node.js 22 or newer
- pnpm 10 (`corepack enable` picks up the version pinned in `package.json`)

## Getting started

```bash
pnpm install
cp .env.example .env   # then fill in real values
pnpm db:migrate
pnpm dev               # http://localhost:3000
```

`pnpm dev` and `pnpm start` validate the whole environment before serving. `pnpm build` validates only the public `VITE_` variables, because those are baked into the bundle. Each command stops with a message naming every missing or invalid variable. See [.env.example](.env.example) for the full list. Visit `/health` to confirm the database connection.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Start the Vite dev server with SSR. |
| `pnpm build` | Production build (client, SSR and Nitro server output in `.output/`). |
| `pnpm start` | Run the production build with Node, loading `.env` if present. |
| `pnpm typecheck` | TypeScript in strict mode, no emit. |
| `pnpm check` | Biome lint + format check. Warnings fail the run. |
| `pnpm check:fix` | Apply Biome fixes and formatting. |
| `pnpm test` | Run the Vitest suite once. |
| `pnpm test:watch` | Run Vitest in watch mode. |
| `pnpm db:generate` | Generate a SQL migration in `drizzle/` from schema changes. |
| `pnpm db:migrate` | Apply pending migrations (uses `DATABASE_URL_UNPOOLED` if set). |
| `pnpm db:push` | Push the schema straight to the database, for prototyping only. |
| `pnpm db:studio` | Open Drizzle Studio. |
| `pnpm storybook`, `pnpm build-storybook` | Stubs until Storybook is added in Phase 11. |

## Internationalisation (English + Nepali)

- Messages live in `messages/en.json` and `messages/ne.json`. Both files must have the same keys, and a test enforces it.
- Use them in code with `import { m } from "@/paraglide/messages"`, then `m.some_key()`. Paraglide compiles them into `src/paraglide/` (generated, gitignored) on `dev`, `build`, `test` and `typecheck`.
- English lives at `/`, Nepali under `/ne/`. Define each route once; the router maps `/ne/...` onto it.
- Format dates, numbers, NPR amounts and relative times with `src/lib/intl.ts`, never `Intl` directly. Browsers such as Chrome lack Nepali locale data, so raw `Intl` output differs between server and browser.
- Compiling messages downloads two inlang plugins from jsDelivr, so the first compile needs network access.

## Adding shadcn/ui components

```bash
pnpm dlx shadcn@latest add <component>
```

The shadcn CLI (4.21.0) currently writes `import { cn } from "cn"`. Replace it with `import { cn } from "@/lib/utils"` after adding a component. `pnpm typecheck` fails until you do.
