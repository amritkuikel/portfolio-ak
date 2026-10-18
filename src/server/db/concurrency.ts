import "@tanstack/react-start/server-only";
import { type SQL, sql } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

/**
 * True while `column` still holds `version`, the ISO `updatedAt` the client
 * started from (src/lib/concurrency.ts). Compared at millisecond precision:
 * Postgres keeps microseconds (`defaultNow()` on insert) but a JS Date, and so
 * the version the client got, keeps milliseconds.
 */
export const sameVersion = (column: PgColumn, version: string): SQL<boolean> =>
	sql<boolean>`date_trunc('milliseconds', ${column}) = ${version}::timestamptz`;
