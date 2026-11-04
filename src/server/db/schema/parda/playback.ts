import { sql } from "drizzle-orm";
import { boolean, check, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { PardaSourceAdapter } from "../../../../features/parda/player/adapters/types";
import { localizedText } from "../columns";

/**
 * Parda's playback controls (docs/guides/parda.md, decision 0230). A source is a row
 * the admin manages; a source's code is only its adapter. `pd_settings` holds one row.
 */

export type PardaSourceSandbox = "none" | "popups" | "strict";
export type PardaSourceOrder = "auto" | "manual";

export const pdSettings = pgTable(
	"pd_settings",
	{
		id: integer().primaryKey().default(1),
		/** TMDB has no NP region: certifications and watch providers fall back to this one. */
		region: text().notNull().default("US"),
		languages: jsonb().$type<string[]>().notNull().default(["en", "ne"]),
		kidsCap: text().notNull().default("PG"),
		banner: localizedText(),
		/** The kill switch: off, no player loads anywhere. */
		playbackEnabled: boolean().notNull().default(true),
		/** Part of every catalogue cache key: bumping it purges the cache. */
		cacheEpoch: integer().notNull().default(0),
		sourceOrder: text().$type<PardaSourceOrder>().notNull().default("auto"),
		version: integer().notNull().default(1),
		updatedAt: timestamp({ withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		check("pd_settings_one_row", sql`${table.id} = 1`),
		check("pd_settings_source_order_valid", sql`${table.sourceOrder} in ('auto', 'manual')`),
	],
);

export const pdSource = pgTable(
	"pd_source",
	{
		id: uuid().primaryKey().defaultRandom(),
		name: localizedText().notNull(),
		/** Absolute https URLs, or paths on this app or PARDA_PLAYER_BASE. Tokens: src/features/parda/player/templates.ts. */
		movieTemplate: text().notNull(),
		tvTemplate: text().notNull(),
		/** The origins an absolute template may use and messages may come from. Empty for a relative template. */
		origins: jsonb().$type<string[]>().notNull().default([]),
		adapter: text().$type<PardaSourceAdapter>().notNull().default("none"),
		sandbox: text().$type<PardaSourceSandbox>().notNull().default("none"),
		adaptive: boolean().notNull().default(false),
		needsClick: boolean().notNull().default(false),
		/** Rows that fail together share a group: falling back skips to another group first. */
		cdnGroup: text(),
		autoFallback: boolean().notNull().default(true),
		enabled: boolean().notNull().default(true),
		pinned: boolean().notNull().default(false),
		position: integer().notNull().default(0),
		version: integer().notNull().default(1),
		createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp({ withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		check("pd_source_adapter_valid", sql`${table.adapter} in ('parda', 'none')`),
		check("pd_source_sandbox_valid", sql`${table.sandbox} in ('none', 'popups', 'strict')`),
	],
);
