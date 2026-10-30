import "@tanstack/react-start/server-only";
import type { AppSlug } from "@/features/apps/registry";
import type { Db } from "@/server/db/types";
import type { GuestData } from "@/server/guests/data";
import { claimKanban, kanbanUsage, seedKanban } from "./kanban/service";

/** /admin/apps' numbers for one app: who has data (accounts, guests) and how many rows of each kind. */
export type AppUsage = { accounts: number; guests: number; rows: Record<string, number> };

/**
 * The server half of the apps registry (decision 0187); the client half,
 * src/features/apps/registry.ts, holds what pages show. Each app gives its guest
 * sample rows and claim (src/server/guests/data.ts) and its usage numbers.
 * Add an app here and there.
 */
export type AppServer = GuestData & { slug: AppSlug; usage: (db: Db) => Promise<AppUsage> };

export const APP_SERVERS: ReadonlyArray<AppServer> = [
	{ slug: "kanban", seedGuestData: seedKanban, claim: claimKanban, usage: kanbanUsage },
];
