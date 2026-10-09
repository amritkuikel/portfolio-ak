#!/usr/bin/env node
/**
 * Moves Test CRUD images stored in Postgres (the legacy `test_crud_image` table,
 * Part 1) to Cloudinary attachments.
 *
 *   pnpm attachments:import-legacy            # do it
 *   pnpm attachments:import-legacy --dry-run  # only report what would move
 *
 * For each item with a legacy image: upload the bytes to Cloudinary (signed,
 * server-side), verify the result, insert an `attachment` row linked to the item
 * (position 0, before any existing attachments), then clear `test_crud.image`
 * and delete the legacy row, in one transaction per item. Safe to re-run: items
 * already moved have no legacy image left.
 *
 * Needs DATABASE_URL (or DATABASE_URL_UNPOOLED) and CLOUDINARY_* (.env is loaded).
 * Once nothing is left to move, the legacy column and table can be dropped
 * (docs/decisions.md 0098).
 */
import { createHash, randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { parseArgs } from "node:util";
import pg from "pg";

if (existsSync(".env")) process.loadEnvFile(".env");
const { values } = parseArgs({ options: { "dry-run": { type: "boolean", default: false } }, strict: true });
const dryRun = values["dry-run"];

const env = process.env;
const databaseUrl = env.DATABASE_URL_UNPOOLED || env.DATABASE_URL;
const cloud = {
	name: env.CLOUDINARY_CLOUD_NAME,
	key: env.CLOUDINARY_API_KEY,
	secret: env.CLOUDINARY_API_SECRET,
	folder: env.CLOUDINARY_FOLDER || "portfolio",
	api: (env.CLOUDINARY_API_BASE || "https://api.cloudinary.com").replace(/\/$/, ""),
};
if (!databaseUrl || !cloud.name || !cloud.key || !cloud.secret) {
	console.error("attachments:import-legacy: set DATABASE_URL and CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET.");
	process.exit(1);
}

// Same signing as src/server/attachments/cloudinary.ts (Cloudinary's documented algorithm).
const sign = (params) =>
	createHash("sha1")
		.update(
			Object.keys(params)
				.sort()
				.map((key) => `${key}=${params[key]}`)
				.join("&") + cloud.secret,
		)
		.digest("hex");

const EXTENSIONS = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

async function upload(bytes, mimeType) {
	const publicId = `${cloud.folder}/test-crud/${randomUUID()}`;
	const signed = { overwrite: "false", public_id: publicId, timestamp: Math.floor(Date.now() / 1000) };
	const form = new FormData();
	for (const [key, value] of Object.entries(signed)) form.set(key, String(value));
	form.set("api_key", cloud.key);
	form.set("signature", sign(signed));
	form.set("file", new Blob([bytes], { type: mimeType }), `image.${EXTENSIONS[mimeType] ?? "bin"}`);
	const response = await fetch(`${cloud.api}/v1_1/${cloud.name}/image/upload`, { method: "POST", body: form });
	const body = await response.json();
	if (!response.ok) throw new Error(`upload failed (${response.status}): ${body?.error?.message ?? "unknown"}`);
	return body;
}

const client = new pg.Client({ connectionString: databaseUrl });
await client.connect();
const { rows } = await client.query(
	`select t.id, t.title, t.created_by, i.id as image_id, i.mime_type, i.data
	   from test_crud t join test_crud_image i on i.id = t.image
	  order by t.created_at`,
);
console.log(`${rows.length} item(s) with a legacy image${dryRun ? " (dry run)" : ""}.`);
let moved = 0;
for (const row of rows) {
	if (dryRun) {
		console.log(`  would move: ${row.title} (${row.data.length} bytes, ${row.mime_type})`);
		continue;
	}
	try {
		const result = await upload(row.data, row.mime_type);
		await client.query("begin");
		await client.query(
			`update attachment set position = position + 1
			  where entity_type = 'test-crud' and entity_id = $1 and deleted_at is null`,
			[row.id],
		);
		await client.query(
			`insert into attachment (public_id, version, resource_type, format, bytes, width, height, owner_id, entity_type, entity_id, position)
			 values ($1, $2, 'image', $3, $4, $5, $6, $7, 'test-crud', $8, 0)`,
			[
				result.public_id,
				result.version,
				result.format,
				result.bytes,
				result.width ?? null,
				result.height ?? null,
				row.created_by,
				row.id,
			],
		);
		await client.query("update test_crud set image = null where id = $1", [row.id]);
		await client.query("delete from test_crud_image where id = $1", [row.image_id]);
		await client.query("commit");
		moved++;
		console.log(`  moved: ${row.title} -> ${result.public_id}`);
	} catch (error) {
		await client.query("rollback").catch(() => {});
		console.error(`  failed: ${row.title}: ${error instanceof Error ? error.message : error}`);
		process.exitCode = 1;
	}
}
await client.end();
if (!dryRun) console.log(`Moved ${moved} of ${rows.length}.`);
