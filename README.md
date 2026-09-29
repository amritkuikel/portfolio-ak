# Portfolio

A bilingual (English + Nepali), server-rendered portfolio app built on TanStack Start.

The full plan, phases and Definition of Done live in [docs/PLAN.md](docs/PLAN.md). Non-obvious choices are recorded in [docs/decisions.md](docs/decisions.md). This README is completed in Phase 12.

## Requirements

- Node.js 22 or newer
- pnpm 10 (`corepack enable` picks up the version pinned in `package.json`)

## Getting started

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Start the Vite dev server with SSR. |
| `pnpm build` | Production build (client, SSR and Nitro server output in `.output/`). |
| `pnpm start` | Run the production build with Node. |
| `pnpm typecheck` | TypeScript in strict mode, no emit. |
| `pnpm check` | Biome lint + format check. Warnings fail the run. |
| `pnpm check:fix` | Apply Biome fixes and formatting. |
| `pnpm test`, `pnpm test:watch` | Stubs until Vitest is added. |
| `pnpm db:generate`, `db:migrate`, `db:push`, `db:studio` | Stubs until Drizzle is added in Phase 3. |
| `pnpm storybook`, `pnpm build-storybook` | Stubs until Storybook is added in Phase 11. |

## Adding shadcn/ui components

```bash
pnpm dlx shadcn@latest add <component>
```

The shadcn CLI (4.21.0) currently writes `import { cn } from "cn"`. Replace it with `import { cn } from "@/lib/utils"` after adding a component. `pnpm typecheck` fails until you do.
