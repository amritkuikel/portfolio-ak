import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "@/lib/session";
import * as schema from "@/server/db/schema";
import type { PardaCatalog } from "@/server/parda/catalog/context";
import { popularTitles } from "@/server/parda/catalog/service";
import { createPardaControls } from "@/server/parda/controls";
import * as library from "@/server/parda/library/service";
import { resolveViewer } from "@/server/parda/profiles/service";
import { createTmdbCache } from "@/server/parda/tmdb/cache";
import { createTmdb } from "@/server/parda/tmdb/client";
import { fixtureName, readFixture } from "../../e2e/harness/tmdb";
import { createTestDb } from "../utils/test-db";

/**
 * Parda's access matrix (PLAN 12.5, "Guard test"; decision 0236): every library operation
 * acts on the caller's own profile, works for a guest, and refuses a blocked title. Saving
 * progress is refused with playback off. The functions' middleware (requirePardaViewer,
 * then withPardaServices) is checked by tests/server/guarded-functions.test.ts; party
 * rows join with Task 69a.
 */
let env: Awaited<ReturnType<typeof createTestDb>>;

const fetcher = vi.fn<typeof fetch>(async (input) => {
	const url = new URL(String(input));
	const body = readFixture(
		fixtureName(url.pathname.replace("/3/", ""), url.searchParams, url.searchParams.get("language") ?? ""),
	);
	return body === undefined ? new Response("{}", { status: 404 }) : new Response(body);
});
const tmdb = createTmdb(
	{ token: "t".repeat(24), apiBase: "https://tmdb.test/3", imageBase: "https://img.test" },
	fetcher,
);
let time = 0;
const catalog = (): PardaCatalog => ({
	services: { tmdb, cache: createTmdbCache(), controls: createPardaControls(env.db, () => time) },
	region: "US",
	cap: null,
});
const session = (id: string, guest = false): Session => ({
	user: { id, email: `${id}@example.com`, name: id, role: "user", twoFactorEnabled: false },
	permissions: [],
	...(guest ? { isAnonymous: true as const } : {}),
});
const ctx = async (id: string, guest = false): Promise<library.PardaServices> => ({
	db: env.db,
	viewer: await resolveViewer(env.db, session(id, guest), undefined, "en"),
	catalog: catalog(),
});

let movie = 0;
type Operation = (context: library.PardaServices, id: number) => Promise<unknown>;

/** Every library function's service call (src/functions/parda/library.ts), on a movie. */
const OPERATIONS: Record<string, Operation> = {
	getPardaContinue: (context) => library.continueWatching(context, "en"),
	getPardaTitleProgress: (context, id) => library.titleProgress(context, { media: "movie", id }, "en"),
	savePardaProgress: (context, id) =>
		library.saveProgress(context, { media: "movie", id, watched: 1200, duration: 7200, sourceId: null }),
	markPardaWatched: (context, id) => library.mark(context, { media: "movie", id, scope: "title", watched: true }, "en"),
	removePardaContinue: (context, id) => library.removeFromContinue(context, { media: "movie", id }),
	rewatchPardaTitle: (context, id) => library.rewatch(context, { media: "movie", id }),
	importPardaProgress: (context, id) =>
		library.importLocal(context, [
			{ media: "movie", id, watched: 600, duration: 7200, sourceId: null, updatedAt: Date.now() },
		]),
};

/** The operations a takedown refuses; the rest leave a blocked title out instead. */
const REFUSED_WHEN_BLOCKED = new Set([
	"getPardaTitleProgress",
	"savePardaProgress",
	"markPardaWatched",
	"rewatchPardaTitle",
]);

beforeAll(async () => {
	env = await createTestDb();
	const first = (await popularTitles(catalog().services, { locale: "en", region: "US", cap: null }, "movie"))
		.results[0];
	movie = first?.id ?? 550;
}, 120_000);
beforeEach(async () => {
	await env.reset();
	await env.db.insert(schema.pdSettings).values({ id: 1 });
	for (const id of ["asha", "bina"]) {
		await env.db.insert(schema.user).values({ id, name: id, email: `${id}@example.com` });
	}
	await env.db
		.insert(schema.user)
		.values({ id: "guest", name: "Guest", email: "guest@example.com", isAnonymous: true });
	time += 60_000;
});
afterAll(async () => {
	await env.close();
});

describe("Parda's library access matrix", () => {
	it("has a row for every library function (getPardaViewer reads only the viewer itself)", () => {
		const source = readFileSync("src/functions/parda/library.ts", "utf8");
		const functions = [...source.matchAll(/export const (\w+) = createServerFn/g)].map((match) => match[1]);
		expect(functions).toEqual(["getPardaViewer", ...Object.keys(OPERATIONS)]);
	});

	for (const [name, operation] of Object.entries(OPERATIONS)) {
		it(`${name}: own profile only, guests allowed, takedowns respected`, async () => {
			const asha = await ctx("asha");
			await operation(asha, movie);
			// Another viewer never sees or changes Asha's rows.
			const before = await env.db.select().from(schema.pdProgress);
			await operation(await ctx("bina"), movie);
			const bina = await ctx("bina");
			const after = await env.db.select().from(schema.pdProgress);
			for (const row of before) expect(after.find((each) => each.id === row.id)).toEqual(row);
			expect(after.every((row) => [asha.viewer.profile.id, bina.viewer.profile.id].includes(row.profileId))).toBe(true);
			// A guest has a session, so the library is theirs too.
			await expect(operation(await ctx("guest", true), movie)).resolves.not.toThrow();

			await env.db.insert(schema.pdBlockedTitle).values({ media: "movie", tmdbId: movie, reason: "A notice" });
			time += 30_001;
			const blocked = operation(await ctx("asha"), movie);
			if (REFUSED_WHEN_BLOCKED.has(name)) await expect(blocked).rejects.toMatchObject({ code: "NOT_FOUND" });
			else await expect(blocked).resolves.not.toThrow();
		});
	}

	it("refuses saving progress while playback is off", async () => {
		await env.db.update(schema.pdSettings).set({ playbackEnabled: false });
		await expect(OPERATIONS.savePardaProgress?.(await ctx("asha"), movie)).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("leaves a blocked title out of the rail and the import", async () => {
		const asha = await ctx("asha");
		await library.saveProgress(asha, { media: "movie", id: movie, watched: 1200, duration: 7200, sourceId: null });
		await env.db.insert(schema.pdBlockedTitle).values({ media: "movie", tmdbId: movie, reason: "A notice" });
		time += 30_001;
		const later = await ctx("asha");
		expect((await library.continueWatching(later, "en")).items).toEqual([]);
		expect(
			await library.importLocal(later, [
				{ media: "movie", id: movie, watched: 1, duration: 7200, sourceId: null, updatedAt: Date.now() },
			]),
		).toEqual({ imported: 0 });
	});
});
