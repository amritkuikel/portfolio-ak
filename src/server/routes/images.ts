/**
 * GET /api/images/:id — uploaded images (Test CRUD).
 *
 * A Nitro route (registered in vite.config.ts), not a TanStack Start server
 * route: in development Nitro sends any request with `Sec-Fetch-Dest: image`
 * that matches no *Nitro* route to Vite's static file server, so an <img>
 * pointing at a Start route 404s in dev (see docs/decisions.md 0067).
 *
 * An id is never reused (a replaced image gets a new one), so responses are
 * cached as immutable.
 */
import { defineHandler } from "nitro";
import { z } from "zod";
import { db } from "../db/client";
import { getImage } from "../test-crud/repository";

const idSchema = z.uuid();

const notFound = () => new Response("Not found", { status: 404, headers: { "cache-control": "no-store" } });

export default defineHandler(async (event) => {
	const id = idSchema.safeParse(event.context.params?.id);
	if (!id.success) return notFound();
	const image = await getImage(db, id.data);
	if (!image) return notFound();
	// Copy into an ArrayBuffer-backed view (BodyInit rejects SharedArrayBuffer-typed views).
	return new Response(new Uint8Array(image.data), {
		headers: {
			"content-type": image.mimeType,
			"content-length": String(image.data.byteLength),
			"cache-control": "public, max-age=31536000, immutable",
			// The type was verified from the bytes on upload; never let the browser re-guess it.
			"x-content-type-options": "nosniff",
		},
	});
});
