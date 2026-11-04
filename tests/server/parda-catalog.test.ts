import { readFileSync } from "node:fs";
import { asc, eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { sourceProblems } from "@/features/parda/player/templates";
import { isAppError } from "@/lib/errors";
import * as schema from "@/server/db/schema";
import { listLabSources, openLabPlayer } from "@/server/parda/admin/player-lab";
import { refreshTitles } from "@/server/parda/catalog/refresh";
import { type CatalogServices, popularTitles, titleDetails } from "@/server/parda/catalog/service";
import { createPardaControls } from "@/server/parda/controls";
import { runPardaCron } from "@/server/parda/cron";
import { createTmdbCache } from "@/server/parda/tmdb/cache";
import { createTmdb, type Tmdb } from "@/server/parda/tmdb/client";
import { createTestDb } from "../utils/test-db";

/**
 * Parda's catalogue on PGlite (decisions 0229, 0230): takedowns from every entry point, the
 * cache epoch, locale fill-in, the daily refresh, the seeded sources and the lab's service.
 */
let env: Awaited<ReturnType<typeof createTestDb>>;

const fixture = (name: string): unknown =>
	JSON.parse(readFileSync(new URL(`../fixtures/tmdb/${name}.json`, import.meta.url), "utf8"));

/** TMDB answered from the fixtures, the way the e2e stand-in does. */
const fixtureFetcher = vi.fn<typeof fetch>(async (input) => {
	const url = new URL(String(input));
	const name = url.pathname.replace("/3/", "").replaceAll("/", "_");
	try {
		return new Response(JSON.stringify(fixture(`${name}.${url.searchParams.get("language")}`)));
	} catch {
		return new Response("{}", { status: 404 });
	}
});
const tmdb: Tmdb = createTmdb(
	{ token: "t".repeat(24), apiBase: "https://tmdb.test/3", imageBase: "https://img.test" },
	fixtureFetcher,
);

const EN = { locale: "en", region: "US", cap: null } as const;
const NE = { ...EN, locale: "ne" } as const;

let time = 0;
const services = (): CatalogServices => ({
	tmdb,
	cache: createTmdbCache(),
	controls: createPardaControls(env.db, () => time),
});
/** Past the controls' 30 s cache. */
const later = () => {
	time += 30_001;
};

const firstId = async (media: "movie" | "tv") => {
	const { results } = await popularTitles(services(), EN, media);
	const id = results[0]?.id;
	if (!id) throw new Error("no fixture");
	return id;
};

beforeAll(async () => {
	env = await createTestDb();
}, 120_000);
beforeEach(async () => {
	await env.reset();
	await env.db.insert(schema.pdSettings).values({ id: 1 });
	fixtureFetcher.mockClear();
	time += 60_000;
});
afterAll(async () => {
	await env.close();
});

describe("takedowns", () => {
	const block = (media: "movie" | "tv", tmdbId: number) =>
		env.db.insert(schema.pdBlockedTitle).values({ media, tmdbId, reason: "A notice" });

	it("leave lists and 404 on details", async () => {
		const id = await firstId("movie");
		const live = services();
		expect((await popularTitles(live, EN, "movie")).results.map((row) => row.id)).toContain(id);
		await block("movie", id);
		later();
		expect((await popularTitles(live, EN, "movie")).results.map((row) => row.id)).not.toContain(id);
		const error = await titleDetails(live, EN, "movie", id).catch((caught: unknown) => caught);
		expect(isAppError(error) && error.code).toBe("NOT_FOUND");
	});

	it("apply in Nepali too, and only to that media type", async () => {
		const id = await firstId("movie");
		await block("tv", id);
		const live = services();
		expect((await popularTitles(live, NE, "movie")).results.map((row) => row.id)).toContain(id);
		await block("movie", id);
		later();
		expect((await popularTitles(live, NE, "movie")).results.map((row) => row.id)).not.toContain(id);
	});

	it("never reach TMDB for a blocked title", async () => {
		await block("movie", 123);
		await titleDetails(services(), EN, "movie", 123).catch(() => {});
		expect(fixtureFetcher).not.toHaveBeenCalled();
	});
});

describe("the catalogue", () => {
	it("serves from the cache, until the epoch is bumped", async () => {
		const live = services();
		await popularTitles(live, EN, "movie");
		await popularTitles(live, EN, "movie");
		expect(fixtureFetcher).toHaveBeenCalledTimes(1);
		await env.db.update(schema.pdSettings).set({ cacheEpoch: 1 });
		later();
		await popularTitles(live, EN, "movie");
		expect(fixtureFetcher).toHaveBeenCalledTimes(2);
	});

	it("fills Nepali from the cached English answer", async () => {
		const live = services();
		const english = await popularTitles(live, EN, "movie");
		const nepali = await popularTitles(live, NE, "movie");
		expect(fixtureFetcher).toHaveBeenCalledTimes(2);
		expect(nepali.results.every((row) => row.title !== "")).toBe(true);
		const withOverview = english.results.find((row) => row.overview);
		expect(nepali.results.find((row) => row.id === withOverview?.id)?.overview).toBe(withOverview?.overview);
	});

	it("reads details with the region's certification", async () => {
		const id = await firstId("tv");
		expect(await titleDetails(services(), EN, "tv", id)).toMatchObject({ id, media: "tv" });
	});

	it("rereads the controls after 30 s, and not before", async () => {
		const controls = createPardaControls(env.db, () => time);
		expect((await controls.settings()).cacheEpoch).toBe(0);
		await env.db.update(schema.pdSettings).set({ cacheEpoch: 5 });
		expect((await controls.settings()).cacheEpoch).toBe(0);
		later();
		expect((await controls.settings()).cacheEpoch).toBe(5);
	});
});

describe("the daily refresh", () => {
	it("writes ranked titles in both languages, and is safe to run twice", async () => {
		await refreshTitles(env.db, tmdb);
		await refreshTitles(env.db, tmdb);
		const rows = await env.db.select().from(schema.pdTitle).orderBy(asc(schema.pdTitle.popularityRank));
		const movies = rows.filter((row) => row.media === "movie");
		expect(movies.map((row) => row.popularityRank)).toEqual(movies.map((_, index) => index + 1));
		expect(rows.every((row) => row.title.en !== "" && row.title.ne !== "")).toBe(true);
	});

	it("clears the rank of a title that left the list", async () => {
		await env.db.insert(schema.pdTitle).values({
			media: "movie",
			tmdbId: 5,
			title: { en: "Old", ne: "" },
			popularityRank: 1,
		});
		await refreshTitles(env.db, tmdb);
		const [row] = await env.db.select().from(schema.pdTitle).where(eq(schema.pdTitle.tmdbId, 5));
		expect(row?.popularityRank).toBeNull();
	});

	it("is skipped without a token, and reports a failure without throwing", async () => {
		expect(await runPardaCron(env.db, null)).toEqual({ titles: { ok: true, skipped: true } });
		const broken: Tmdb = { ...tmdb, get: () => Promise.reject(new Error("down")) };
		expect(await runPardaCron(env.db, broken)).toEqual({ titles: { ok: false } });
		expect((await runPardaCron(env.db, tmdb)).titles.ok).toBe(true);
	});
});

describe("the seeded sources and the lab", () => {
	const seedLikeTheMigration = async () => {
		const migration = readFileSync(new URL("../../drizzle/0028_parda_foundation.sql", import.meta.url), "utf8");
		const statement = migration
			.split("--> statement-breakpoint")
			.find((part) => part.includes('INSERT INTO "pd_source"'));
		if (!statement) throw new Error("no seed in the migration");
		await env.client.exec(statement);
	};

	it("seeds servers 1 to 4 on the placeholder's routes, each passing validation", async () => {
		await seedLikeTheMigration();
		const rows = await env.db.select().from(schema.pdSource).orderBy(asc(schema.pdSource.position));
		expect(rows.map((row) => row.name.en)).toEqual(["Server 1", "Server 2", "Server 3", "Server 4"]);
		for (const [index, row] of rows.entries()) {
			expect(row.movieTemplate).toContain(`/parda/api/${index + 1}/movie/{id}`);
			expect(row.tvTemplate).toContain(`/parda/api/${index + 1}/tv/{id}/{season}/{episode}`);
			expect(row.enabled).toBe(true);
			expect(row.adapter).toBe("parda");
			expect(sourceProblems(row)).toEqual([]);
		}
	});

	it("fills any row, disabled too, and adds a cue only for the placeholder's protocol", async () => {
		await seedLikeTheMigration();
		const [first] = await listLabSources(env);
		if (!first) throw new Error("no source");
		await env.db.update(schema.pdSource).set({ enabled: false }).where(eq(schema.pdSource.id, first.id));
		const input = { sourceId: first.id, media: "tv", id: 7, season: 1, episode: 2, start: 30, cue: "stall" } as const;
		expect((await openLabPlayer(env, input)).url).toMatch(
			/^\/parda\/api\/1\/tv\/7\/1\/2\?start=30&lang=\w+&cue=stall$/,
		);
		await env.db.update(schema.pdSource).set({ adapter: "none" }).where(eq(schema.pdSource.id, first.id));
		expect((await openLabPlayer(env, input)).url).not.toContain("cue=");
	});

	it("refuses an unknown source", async () => {
		const error = await openLabPlayer(env, {
			sourceId: "00000000-0000-4000-8000-000000000000",
			media: "movie",
			id: 1,
			season: 1,
			episode: 1,
			start: 0,
			cue: null,
		}).catch((caught: unknown) => caught);
		expect(isAppError(error) && error.code).toBe("NOT_FOUND");
	});
});
