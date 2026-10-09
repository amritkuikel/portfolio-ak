import { sql } from "drizzle-orm";
import { customType, index, integer, numeric, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { TEST_CRUD_STATUSES } from "../../../features/test-crud/constants";
import { user } from "./auth";

/** Postgres bytea <-> Uint8Array (node-postgres returns Buffer, which is a Uint8Array). */
const bytea = customType<{ data: Uint8Array; driverData: Uint8Array }>({ dataType: () => "bytea" });

export const testCrudStatus = pgEnum("test_crud_status", TEST_CRUD_STATUSES);

/**
 * LEGACY (Part 1): images stored in Postgres. Images are Cloudinary attachments
 * now (attachments.ts); nothing in the app reads this table any more. Kept only so
 * `pnpm attachments:import-legacy` can move existing images; drop it (and
 * test_crud.image) in a migration once that has run (docs/decisions.md 0098).
 */
export const testCrudImage = pgTable("test_crud_image", {
	id: uuid().primaryKey().defaultRandom(),
	mimeType: text().notNull(),
	byteSize: integer().notNull(),
	data: bytea().notNull(),
	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

/** The reference feature's table. Columns are listed in docs/PLAN.md (Phase 9a). */
export const testCrud = pgTable(
	"test_crud",
	{
		id: uuid().primaryKey().defaultRandom(),
		slug: text().notNull().unique(),
		title: text().notNull(),
		summary: text().notNull().default(""),
		/** Sanitized HTML (sanitizeRichText) — never stored raw. */
		body: text().notNull().default(""),
		status: testCrudStatus().notNull().default("draft"),
		/** NPR, two decimals. */
		price: numeric({ precision: 12, scale: 2, mode: "number" }).notNull().default(0),
		/** E.164 or null. */
		phone: text(),
		tags: text().array().notNull().default(sql`'{}'::text[]`),
		/** LEGACY: see testCrudImage. Unused by the app. */
		image: uuid().references(() => testCrudImage.id, { onDelete: "set null" }),
		publishedAt: timestamp({ withTimezone: true }),
		createdBy: text().references(() => user.id, { onDelete: "set null" }),
		createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp({ withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("test_crud_status_published_idx").on(table.status, table.publishedAt),
		index("test_crud_updated_idx").on(table.updatedAt),
		// List filters: tags (any of, `&&`) and price range.
		index("test_crud_tags_idx").using("gin", table.tags),
		index("test_crud_price_idx").on(table.price),
	],
);

export type TestCrudRow = typeof testCrud.$inferSelect;
export type NewTestCrudRow = typeof testCrud.$inferInsert;
