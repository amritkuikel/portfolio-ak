/**
 * Parda's foundation (Task 59, decision 0230): the placeholder player's four routes are
 * real documents framed only by this app, and the player lab loads one and logs what it
 * reports, in a production build under the real CSP (the guard fails on any violation).
 */

import type { Page } from "@playwright/test";
import { E2E } from "../harness/config.ts";
import { fixtureTitlePath, pardaFixturePath, popularFixture } from "../harness/tmdb.ts";
import { expect, RESOURCE_STATUS, signedIn, test } from "../support/fixtures.ts";

test.describe("Parda's placeholder player", () => {
	for (const server of [1, 2, 3, 4]) {
		test(`server ${server} serves its movie and series routes`, async ({ request }) => {
			for (const path of [`/parda/api/${server}/movie/550`, `/parda/api/${server}/tv/1396/1/1`]) {
				const response = await request.get(path);
				expect(response.status()).toBe(200);
				expect(response.headers()["x-frame-options"]).toBe("SAMEORIGIN");
				expect(response.headers()["content-security-policy"]).toContain("frame-ancestors 'self'");
				expect(await response.text()).toContain("<h1>");
			}
		});
	}

	test("anything else under the route is a 404", async ({ request }) => {
		expect((await request.get("/parda/api/5/movie/550")).status()).toBe(404);
		expect((await request.get("/parda/api/1/movie/abc")).status()).toBe(404);
	});

	test("the harness stands in for TMDB", async ({ request }) => {
		const response = await request.get(`${E2E.harnessURL}/tmdb/3/movie/popular?language=en-US`);
		expect(response.ok()).toBe(true);
		expect((await response.json()).results.length).toBeGreaterThan(0);
	});
});

test.describe("Parda's player lab as the viewer", () => {
	test.use(signedIn("viewer"));

	test("is a 403", async ({ page, guard }) => {
		guard.allow(RESOURCE_STATUS(403));
		const response = await page.goto("/admin/parda/player-lab", { waitUntil: "networkidle" });
		expect(response?.status()).toBe(403);
	});
});

test.describe("Parda's player lab as the admin", () => {
	test.use(signedIn("admin"));

	test("loads a source, logs its messages, sends commands and rehearses a failure", async ({ page }) => {
		await page.goto("/admin/parda/player-lab", { waitUntil: "networkidle" });
		await page.getByRole("button", { name: "Load player" }).click();

		const log = page.getByTestId("pd-lab-log");
		await expect(log).toContainText('"kind":"ready"');
		await expect(log).toContainText('"kind":"play"');
		await expect(page.getByTestId("pd-lab-position")).toContainText("Position:");

		await page.getByRole("button", { name: "Pause" }).click();
		await expect(log).toContainText('"kind":"pause"');
		await page.getByRole("button", { name: "Forward 60 s" }).click();
		await expect(log).toContainText('"kind":"seeked"');

		await page.getByLabel("Rehearse").selectOption("fail");
		await page.getByRole("button", { name: "Load player" }).click();
		await expect(log).toContainText('"kind":"failed"');
	});
});

// Task 61: the frame, the brand and the pages for visitors.
test.describe("Parda's frame for a visitor", () => {
	test("is dark by default, branded, and keeps the visitor inside Parda", async ({ page }) => {
		await page.goto("/app/parda", { waitUntil: "networkidle" });
		const html = page.locator("html");
		await expect(html).toHaveAttribute("data-section", "parda");
		await expect(html).toHaveClass(/\bdark\b/);
		await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/app/parda/manifest.webmanifest");
		await expect(page.locator('meta[name="theme-color"]').first()).toHaveAttribute("content", "#08080a");
		await expect(page.getByTestId("parda-footer").getByRole("img", { name: "TMDB" })).toBeVisible();
		await page.getByTestId("parda-nav-about").click();
		await expect(page).toHaveURL(/\/app\/parda\/about$/);
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
		await page.getByTestId("parda-sign-in-link").click();
		await expect(page).toHaveURL(/\/app\/parda\/sign-in\?redirect=/);
		await expect(page.getByTestId("parda-frame")).toBeVisible();
	});

	test("an explicit light choice wins over the dark default", async ({ page }) => {
		await page.context().addCookies([{ name: "theme", value: "light", url: E2E.baseURL }]);
		await page.goto("/app/parda/about", { waitUntil: "networkidle" });
		await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
	});

	test("an unknown address is Parda's 404, in its frame", async ({ page, guard }) => {
		guard.allow(RESOURCE_STATUS(404));
		const response = await page.goto("/ne/app/parda/no-such-page", { waitUntil: "networkidle" });
		expect(response?.status()).toBe(404);
		await expect(page.getByTestId("parda-frame")).toBeVisible();
		await expect(page.getByTestId("not-found-page")).toBeVisible();
	});

	test("serves its manifest in each language", async ({ request }) => {
		for (const [path, lang, start] of [
			["/app/parda/manifest.webmanifest", "en", "/app/parda"],
			["/ne/app/parda/manifest.webmanifest", "ne", "/ne/app/parda"],
		] as const) {
			const response = await request.get(path);
			expect(response.ok()).toBe(true);
			const manifest = await response.json();
			expect(manifest).toMatchObject({ name: "Parda", lang, start_url: start, theme_color: "#08080a" });
		}
	});
});

test.describe("Parda's frame on a phone", () => {
	test.use({ viewport: { width: 390, height: 844 } });

	test("puts the sections in the tab bar", async ({ page }) => {
		await page.goto("/app/parda", { waitUntil: "networkidle" });
		const tabs = page.getByTestId("parda-tab-bar");
		await expect(tabs).toBeVisible();
		await tabs.getByRole("link", { name: /About|बारेमा/ }).click();
		await expect(page).toHaveURL(/\/app\/parda\/about$/);
		await expect(page.getByTestId("parda-header").getByTestId("parda-nav-about")).toBeHidden();
	});
});

// Task 62: the home, the hubs and the title page stub, on the recorded catalogue.
test.describe("Parda's home and hubs", () => {
	test("streams every rail, and the billboard leads to a title", async ({ page }) => {
		await page.goto("/app/parda", { waitUntil: "networkidle" });
		await expect(page.getByTestId("billboard")).toBeVisible();
		await expect(page.getByTestId("top10-rail").getByRole("link")).toHaveCount(10);
		// Every later rail streamed in: no skeleton is left, and nothing failed.
		await expect(page.getByTestId("rail-skeleton")).toHaveCount(0);
		await expect(page.getByTestId("rail-unavailable")).toHaveCount(0);
		await expect(page.getByTestId("title-rail")).toHaveCount(10);
		// The first picture, in the shape each width shows (the frame preloads other images of its own).
		await expect(page.locator('link[rel="preload"][as="image"][media]')).toHaveCount(2);
		const title = await page.getByTestId("billboard").getByRole("heading", { level: 2 }).textContent();
		await page.getByTestId("billboard-details").click();
		await expect(page).toHaveURL(/\/app\/parda\/(movie|series)\/\d+-[a-z0-9-]+$/);
		await expect(page.getByRole("heading", { level: 1 })).toHaveText(title ?? "");
	});

	test("reaches each hub from the top mask, in Nepali too", async ({ page }) => {
		await page.goto("/ne/app/parda", { waitUntil: "networkidle" });
		for (const hub of ["movies", "series", "anime"] as const) {
			await page.getByTestId(`parda-nav-${hub}`).click();
			await expect(page).toHaveURL(new RegExp(`/ne/app/parda/${hub}$`));
			await expect(page.getByTestId(`parda-page-${hub}`)).toBeVisible();
			await expect(page.getByTestId(`parda-nav-${hub}`)).toHaveAttribute("aria-current", "page");
			await expect(page.getByTestId("title-rail").first()).toBeVisible();
		}
	});

	test("answers Parda's 404 for an unknown hub or title", async ({ page, guard }) => {
		guard.allow(RESOURCE_STATUS(404));
		for (const path of ["/app/parda/cartoons", "/app/parda/movie/abc", "/app/parda/film/550"]) {
			const response = await page.goto(path, { waitUntil: "networkidle" });
			expect(response?.status(), path).toBe(404);
			await expect(page.getByTestId("parda-frame")).toBeVisible();
		}
	});
});

// Task 63: a title's pages, a person and a collection, on the recorded catalogue.
test.describe("Parda's title pages", () => {
	test.beforeEach(async ({ page }) => {
		// Trailers are YouTube's: never reached from CI.
		await page.route("https://www.youtube-nocookie.com/**", (route) =>
			route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>Trailer</title>" }),
		);
	});

	test("answers a missing or wrong slug with a 301 to the canonical address", async ({ request }) => {
		const canonical = pardaFixturePath("movie");
		const id = /\/(\d+)-/.exec(canonical)?.[1] ?? "";
		for (const path of [`/app/parda/movie/${id}`, `/app/parda/movie/${id}-wrong-name`, `/ne/app/parda/movie/${id}`]) {
			const response = await request.get(path, { maxRedirects: 0 });
			expect(response.status(), path).toBe(301);
			expect(response.headers().location, path).toMatch(new RegExp(`${canonical.replace(/\//g, "/")}$`));
		}
		expect(
			(await request.get(`${canonical}/credits`.replace(/-[a-z0-9-]+\//, "/"), { maxRedirects: 0 })).status(),
		).toBe(301);
	});

	test("a movie opens its trailer, browses its gallery, and Play leads to the watch page", async ({ page }) => {
		await page.goto(pardaFixturePath("movie"), { waitUntil: "networkidle" });
		await expect(page.getByTestId("title-heading")).toBeVisible();
		await expect(page.getByTestId("title-cast").getByTestId("person-card").first()).toBeVisible();
		await expect(page.getByTestId("title-crew")).toContainText(/Director/);
		await expect(page.getByTestId("title-play")).toHaveAttribute("href", /\/app\/parda\/watch\/movie\//);

		await page.getByTestId("title-trailer").click();
		await expect(page.getByTestId("video-frame")).toHaveAttribute(
			"src",
			/^https:\/\/www\.youtube-nocookie\.com\/embed\//,
		);
		await page.keyboard.press("Escape");
		await expect(page.getByTestId("video-dialog")).toBeHidden();

		await page.getByTestId("gallery-item").first().click();
		const position = page.getByTestId("gallery-position");
		await expect(position).toHaveText(/^Picture 1 of \d+$/);
		await page.keyboard.press("ArrowRight");
		await expect(position).toHaveText(/^Picture 2 of \d+$/);
		await page.keyboard.press("ArrowLeft");
		await expect(position).toHaveText(/^Picture 1 of \d+$/);
		await page.keyboard.press("Escape");

		await page.getByTestId("title-play").click();
		await expect(page).toHaveURL(/\/app\/parda\/watch\/movie\//);
		await expect(page.locator('iframe[src^="/parda/api/1/movie/"]')).toBeVisible();
	});

	test("the cast leads to the full credits and to a person", async ({ page }) => {
		await page.goto(pardaFixturePath("movie"), { waitUntil: "networkidle" });
		await page.getByTestId("title-credits-link").click();
		await expect(page).toHaveURL(/\/credits$/);
		await expect(page.getByRole("heading", { level: 1 })).toHaveText("Cast and crew");
		await expect(page.getByTestId("credits-department").first()).toBeVisible();
		await page.getByTestId("credits-back").click();
		await page.getByTestId("title-cast").getByTestId("person-card").first().click();
		await expect(page).toHaveURL(/\/app\/parda\/person\/\d+$/);
		await expect(page.getByTestId("person-filmography")).toBeVisible();
	});

	test("a series switches seasons and opens an episode's sheet from the URL", async ({ page }) => {
		await page.goto(pardaFixturePath("series"), { waitUntil: "networkidle" });
		const episodes = page.getByTestId("title-episodes");
		await expect(episodes.getByTestId("episode-card").first()).toBeVisible();
		await episodes.getByTestId("episode-card").first().click();
		await expect(page).toHaveURL(/[?&]episode=\d+/);
		await expect(page.getByTestId("episode-sheet")).toBeVisible();
		await page.keyboard.press("Escape");
		await expect(page.getByTestId("episode-sheet")).toBeHidden();
		await expect(page).not.toHaveURL(/episode=/);
		const seasons = episodes.getByTestId("season-link");
		if ((await seasons.count()) > 1) {
			await seasons.nth(1).click();
			await expect(page).toHaveURL(/[?&]season=\d+/);
			await expect(seasons.nth(1)).toHaveAttribute("aria-current", "page");
			await expect(seasons.first()).not.toHaveAttribute("aria-current", "page");
		}
	});

	test("a franchise banner leads to its collection, in release order", async ({ page }) => {
		await page.goto(pardaFixturePath("collection"), { waitUntil: "networkidle" });
		await expect(page.getByTestId("collection-parts").getByTestId("poster-card").nth(1)).toBeVisible();
		await page.goto("/app/parda/movie/155", { waitUntil: "networkidle" });
		await expect(page).toHaveURL(/\/app\/parda\/movie\/155-[a-z-]+$/);
		await page.getByTestId("title-franchise").getByRole("link").click();
		await expect(page).toHaveURL(/\/app\/parda\/collection\/\d+$/);
		await expect(page.getByTestId("parda-collection")).toBeVisible();
	});

	test("Surprise me redirects to a title from the page's lists", async ({ request, page }) => {
		for (const from of ["home", "movies", "series", "anime"]) {
			const response = await request.get(`/app/parda/surprise?from=${from}`, { maxRedirects: 0 });
			expect(response.status(), from).toBeGreaterThanOrEqual(300);
			expect(response.status(), from).toBeLessThan(400);
			expect(response.headers().location, from).toMatch(/\/app\/parda\/(movie|series)\/\d+(-[a-z0-9-]+)?$/);
		}
		await page.goto("/app/parda", { waitUntil: "networkidle" });
		await expect(page.getByTestId("surprise-me").first()).toHaveAttribute("href", /\/app\/parda\/surprise\?from=home$/);
	});

	test("an unknown person or collection is Parda's 404", async ({ page, guard }) => {
		guard.allow(RESOURCE_STATUS(404));
		for (const path of ["/app/parda/person/1", "/app/parda/collection/1", "/app/parda/person/abc"]) {
			const response = await page.goto(path, { waitUntil: "networkidle" });
			expect(response?.status(), path).toBe(404);
			await expect(page.getByTestId("parda-frame")).toBeVisible();
		}
		expect(fixtureTitlePath()).toMatch(/^\/app\/parda\/(movie|series)\/\d+/);
	});
});

// Task 64: the watch page against the placeholder player (decision 0236). `cue` rewrites a
// server's requests on the way out, the way an admin's row would: `start=` puts the clock
// where a test needs it, `cue=fail|silent|stall` rehearses trouble.
const cue = (page: Page, server: number, params: Record<string, string>) =>
	page.route(`**/parda/api/${server}/**`, async (route) => {
		const url = new URL(route.request().url());
		for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
		await route.continue({ url: url.toString() });
	});

const frame = (page: Page) => page.getByTestId("watch-box").locator("iframe");
/** Playing: the first position moved (so progress was saved once), and Parda's controls took over. */
const playing = async (page: Page) => {
	await expect(page.getByTestId("watch-box")).toHaveAttribute("data-status", "playing", { timeout: 15_000 });
	await expect(page.getByTestId("click-shield")).toBeVisible();
};

test.describe("Parda's watch page", () => {
	test("falls back to another CDN group when a server fails", async ({ page }) => {
		await cue(page, 1, { cue: "fail" });
		await page.goto(pardaFixturePath("watch-movie"));
		await expect(page.getByText("Trying Server 3…")).toBeVisible();
		await expect(frame(page)).toHaveAttribute("src", /^\/parda\/api\/3\/movie\//);
		await playing(page);
	});

	test("moves on when a server's position never moves by its deadline", async ({ page }) => {
		test.slow();
		await cue(page, 1, { cue: "silent" });
		await page.goto(pardaFixturePath("watch-movie"));
		await expect(frame(page)).toHaveAttribute("src", /^\/parda\/api\/1\/movie\//);
		await expect(frame(page)).toHaveAttribute("src", /^\/parda\/api\/3\/movie\//, { timeout: 25_000 });
	});

	test("remembers a picked server until Auto clears it, and a switch starts 30 s earlier", async ({ page }) => {
		await cue(page, 1, { start: "600" });
		await page.goto(pardaFixturePath("watch-movie"));
		await playing(page);
		await page.getByTestId("server-menu").click();
		await page.getByTestId("server-option").filter({ hasText: "Server 2" }).click();
		await expect(frame(page)).toHaveAttribute("src", /^\/parda\/api\/2\/movie\/\d+\?start=(5[7-9]\d|6\d\d)&/);
		await page.reload();
		await expect(frame(page)).toHaveAttribute("src", /^\/parda\/api\/2\//);
		await page.getByTestId("server-menu").click();
		await page.getByTestId("server-auto").click();
		await expect(frame(page)).toHaveAttribute("src", /^\/parda\/api\/1\//);
		expect(await page.evaluate(() => localStorage.getItem("pd_server"))).toBeNull();
	});

	test("offers a smoother server when playback stutters, and stays put", async ({ page }) => {
		await cue(page, 1, { cue: "stall" });
		await page.goto(pardaFixturePath("watch-movie"));
		await expect(page.getByText("Playback is stuttering. Try a smoother server?")).toBeVisible({ timeout: 20_000 });
		await expect(frame(page)).toHaveAttribute("src", /^\/parda\/api\/1\//);
	});

	test("the click shield takes the clicks, and Parda's controls send commands", async ({ page }) => {
		await page.goto(pardaFixturePath("watch-movie"));
		await playing(page);
		const shield = page.getByTestId("click-shield");
		const box = await shield.boundingBox();
		if (!box) throw new Error("no shield");
		const onTop = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.getAttribute("data-testid"), {
			x: box.x + box.width / 2,
			y: box.y + box.height / 2,
		});
		expect(onTop).toBe("click-shield");
		await shield.click();
		await expect(page.getByTestId("control-toggle")).toHaveAccessibleName("Play");
		const paused = await page.getByTestId("control-time").textContent();
		await page.waitForTimeout(1_000);
		await expect(page.getByTestId("control-time")).toHaveText(paused ?? "");
		await page.getByTestId("control-toggle").click();
		await expect(page.getByTestId("control-toggle")).toHaveAccessibleName("Pause");
		await page.getByTestId("control-player-menu").click();
		await expect(shield).toBeHidden();
	});

	test("the uBlock Origin Lite button opens Chrome's store in a new tab, and Don't show again sticks", async ({
		page,
	}) => {
		await page.goto(pardaFixturePath("watch-movie"));
		const install = page.getByTestId("blocker-install");
		await expect(install).toHaveAttribute(
			"href",
			/^https:\/\/chromewebstore\.google\.com\/detail\/ublock-origin-lite\//,
		);
		await expect(install).toHaveAttribute("target", "_blank");
		await expect(install).toHaveAttribute("rel", "noopener");
		await page.getByTestId("blocker-dismiss").click();
		await expect(page.getByTestId("blocker-hint")).toBeHidden();
		await page.reload();
		await expect(page.getByTestId("watch-heading")).toBeVisible();
		await expect(page.getByTestId("blocker-hint")).toBeHidden();
		await page.goto("/app/parda/about#ad-blocker");
		await expect(page.locator("#ad-blocker a[href^='https://']")).toHaveCount(4);
	});

	test("Up next counts down near the end and plays the next episode", async ({ page }) => {
		await cue(page, 1, { start: "1485" });
		await page.goto(pardaFixturePath("watch-series"));
		await expect(page.getByTestId("up-next")).toBeVisible({ timeout: 15_000 });
		await expect(page.getByTestId("up-next-countdown")).toBeVisible();
		await expect(page).toHaveURL(/[?&]e=2(&|$)/, { timeout: 20_000 });
		await expect(page.getByTestId("watch-heading")).toBeVisible();
	});

	test("without a session, progress stays in the browser: the title's action and the rail show it", async ({
		page,
	}) => {
		await cue(page, 1, { start: "1800" });
		await page.goto(pardaFixturePath("watch-movie"));
		await playing(page);
		await expect.poll(() => page.evaluate(() => localStorage.getItem("pd_progress") ?? "")).toContain('"watched"');
		await page.goto(pardaFixturePath("movie"));
		await expect(page.getByTestId("title-play")).toContainText(/Resume · \d+ min left/);
		await page.goto("/app/parda");
		await expect(page.getByTestId("continue-rail").getByTestId("backdrop-card")).toHaveCount(1);
		await page.getByTestId("continue-remove").click();
		await expect(page.getByTestId("continue-rail")).toBeHidden();
	});
});

test.describe("Parda's progress with a session", () => {
	test.use(signedIn("member"));

	test("progress survives a reload: the action, the bar and the rail show it", async ({ page }) => {
		await cue(page, 1, { start: "2400" });
		await page.goto(pardaFixturePath("watch-movie"));
		await playing(page);
		// The first moving position is saved at once; pausing saves again.
		await page.getByTestId("click-shield").click();
		await expect(page.getByTestId("control-toggle")).toHaveAccessibleName("Play");
		await expect
			.poll(async () => {
				await page.goto(pardaFixturePath("movie"));
				return page.getByTestId("title-play").textContent();
			})
			.toMatch(/Resume · \d+ min left/);
		await expect(page.getByTestId("title-hero").getByRole("progressbar")).toBeVisible();
		await page.goto("/app/parda");
		await expect(page.getByTestId("continue-rail").getByTestId("backdrop-card").first()).toBeVisible();
		// The watch page resumes from our record.
		await page.unroute("**/parda/api/1/**");
		await page.goto(pardaFixturePath("watch-movie"));
		await expect(frame(page)).toHaveAttribute("src", /start=2[4-9]\d\d/);
	});
});

test.describe("Parda's marks for a visitor", () => {
	test("marking a season watched starts a guest, moves the action and shows the banner", async ({ page, harness }) => {
		await harness.resetRateLimits();
		await page.goto(pardaFixturePath("series"));
		const play = page.getByTestId("title-play");
		await expect(play).toHaveText(/Play/);
		await page.getByTestId("mark-season").click();
		await expect(play).toHaveText(/Next: |Rewatch/);
		await expect(page.getByTestId("parda-guest-banner")).toContainText(/deleted on/);
		await expect(page.getByTestId("season-watched")).toBeVisible();
	});
});

// Task 65: the admin's controls (decision 0237). Each flow uses its own source or title, so
// the flows above, which play Servers 1 to 4 and the first popular titles, run beside it.
const rowAction = async (page: Page, label: string, action: string) => {
	await page.getByRole("button", { name: `Actions for ${label}` }).click();
	await page.getByRole("menuitem", { name: action, exact: true }).click();
};
const frameSrc = async (page: Page, path: string) =>
	(await page.request.get(path)).headers()["content-security-policy"]?.match(/frame-src ([^;]*)/)?.[1] ?? "";

test.describe("Parda's admin", () => {
	test.use(signedIn("admin"));

	test("a source added frames, disabling it takes it out of the switcher and the CSP, deleting it removes it", async ({
		page,
		guard,
	}) => {
		// The refused save answers 400.
		guard.allow(RESOURCE_STATUS(400));
		const name = `E2E Server ${Date.now()}`;
		const origin = "https://e2e-player.invalid";
		const watch = pardaFixturePath("watch-movie");

		await page.goto("/admin/parda/sources/new", { waitUntil: "networkidle" });
		await page.getByLabel("Name (English)").fill(name);
		await page.getByLabel("Movie address").fill(`${origin}/movie/{id}`);
		await page.getByLabel("Episode address").fill(`${origin}/tv/{id}/{season}/{episode}`);
		await page.getByRole("switch", { name: "Enabled" }).click();
		await page.getByRole("button", { name: "Create" }).click();
		// The server checks the templates against the origins, and answers on the field.
		await expect(page.getByText("Add this address's origin to the origins below.").first()).toBeVisible();
		await page.getByLabel("Origins").fill(origin);
		await page.getByLabel("Origins").press("Enter");
		await page.getByRole("button", { name: "Create" }).click();
		await expect(page).toHaveURL(/\/admin\/parda\/sources$/);
		await expect(page.getByRole("link", { name, exact: true })).toBeVisible();

		expect(await frameSrc(page, watch)).toContain(origin);
		await page.goto(watch, { waitUntil: "networkidle" });
		await page.getByTestId("server-menu").click();
		await expect(page.getByTestId("server-option").filter({ hasText: name })).toBeVisible();
		await page.keyboard.press("Escape");

		await page.goto("/admin/parda/sources", { waitUntil: "networkidle" });
		await rowAction(page, name, "Disable");
		await expect(page.getByText(`“${name}” is disabled.`)).toBeVisible();
		expect(await frameSrc(page, watch)).not.toContain(origin);
		await page.goto(watch, { waitUntil: "networkidle" });
		await page.getByTestId("server-menu").click();
		await expect(page.getByTestId("server-option").filter({ hasText: "Server 2" })).toBeVisible();
		await expect(page.getByTestId("server-option").filter({ hasText: name })).toHaveCount(0);
		await page.keyboard.press("Escape");

		await page.goto("/admin/parda/sources", { waitUntil: "networkidle" });
		await rowAction(page, name, "Delete");
		await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();
		await expect(page.getByRole("link", { name, exact: true })).toHaveCount(0);
	});

	test("a blocked title is Parda's 404 and leaves the rails; unblocking brings it back", async ({ page, guard }) => {
		const title = popularFixture("movie", 1);
		const linked = (html: string) => html.includes(`/app/parda/movie/${title.id}`);
		expect(linked(await (await page.request.get("/app/parda")).text())).toBe(true);

		await page.goto("/admin/parda/titles/new", { waitUntil: "networkidle" });
		await page.getByLabel("TMDB id").fill(String(title.id));
		await page.getByLabel("Reason").fill("An e2e takedown");
		await page.getByRole("button", { name: "Block", exact: true }).click();
		await expect(page).toHaveURL(/\/admin\/parda\/titles$/);
		await expect(page.getByText("An e2e takedown")).toBeVisible();

		// Blocking it again is refused on the id.
		await page.goto("/admin/parda/titles/new", { waitUntil: "networkidle" });
		await page.getByLabel("TMDB id").fill(String(title.id));
		await page.getByLabel("Reason").fill("Twice");
		await page.getByRole("button", { name: "Block", exact: true }).click();
		await expect(page.getByText("This title is already blocked.").first()).toBeVisible();

		// The second block answers 409; the blocked page 404.
		guard.allow(RESOURCE_STATUS(409));
		guard.allow(RESOURCE_STATUS(404));
		const blocked = await page.goto(title.path);
		expect(blocked?.status()).toBe(404);
		await expect(page.getByTestId("parda-frame")).toBeVisible();
		expect(linked(await (await page.request.get("/app/parda")).text())).toBe(false);

		await page.goto("/admin/parda/titles", { waitUntil: "networkidle" });
		const row = page.getByRole("row").filter({ hasText: "An e2e takedown" });
		await row.getByRole("button", { name: /^Actions for / }).click();
		await page.getByRole("menuitem", { name: "Delete", exact: true }).click();
		await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();
		await expect(page.getByText("An e2e takedown")).toHaveCount(0);
		expect(linked(await (await page.request.get("/app/parda")).text())).toBe(true);
	});

	test("reports are resolved in bulk and leave the open queue", async ({ page, harness }) => {
		await harness.resetRateLimits();
		const note = `E2E report ${Date.now()}`;
		await page.goto(pardaFixturePath("watch-movie"), { waitUntil: "networkidle" });
		await page.getByRole("button", { name: "Report a problem" }).click();
		await page.getByLabel("Details (optional)").fill(note);
		await page.getByRole("button", { name: "Send report" }).click();
		await expect(page.getByText("Thanks: your report was sent.")).toBeVisible();

		await page.goto(`/admin/parda/reports?q=${encodeURIComponent(note)}`, { waitUntil: "networkidle" });
		const row = page.getByRole("row").filter({ hasText: note });
		await expect(row).toBeVisible();
		await row.getByRole("checkbox").check();
		await page.getByTestId("parda-reports-resolve").click();
		await expect(page.getByText("Reports updated: 1.")).toBeVisible();
		await page.reload();
		await expect(page.getByRole("row").filter({ hasText: note })).toHaveCount(0);
		await page.goto(`/admin/parda/reports?q=${encodeURIComponent(note)}&status=resolved`, { waitUntil: "networkidle" });
		await expect(page.getByRole("row").filter({ hasText: note })).toContainText("Resolved");
	});

	test("the banner shows under Parda's header for visitors, and clearing it hides it", async ({ page, browser }) => {
		const text = `E2E notice ${Date.now()}`;
		const setBanner = async (value: string) => {
			await page.goto("/admin/parda/settings", { waitUntil: "networkidle" });
			await page.getByLabel("Banner (English)").fill(value);
			const saved = page.waitForResponse((response) => response.request().method() === "POST" && response.ok());
			await page.getByRole("button", { name: "Save" }).click();
			await saved;
		};
		await setBanner(text);
		const visitor = await browser.newPage({ baseURL: E2E.baseURL });
		await visitor.goto("/app/parda/about", { waitUntil: "networkidle" });
		await expect(visitor.getByTestId("parda-notice-banner")).toHaveText(text);
		await setBanner("");
		await visitor.reload();
		await expect(visitor.getByTestId("parda-notice-banner")).toHaveCount(0);
		await visitor.close();
	});
});

// Task 65a: source ranking (decision 0238). Standings come from the harness, as the daily
// rollup would leave them; each flow puts the seed order back when it ends.
const setOrder = async (page: Page, mode: "auto" | "manual") => {
	await page.goto("/admin/parda/sources", { waitUntil: "networkidle" });
	const order = page.getByTestId("parda-source-order");
	if ((await order.getAttribute("data-state")) !== mode) await page.getByTestId(`parda-source-order-${mode}`).click();
	await expect(order).toHaveAttribute("data-state", mode);
};

test.describe("Parda's source ranking", () => {
	test.use(signedIn("admin"));

	test.afterEach(async ({ page, harness }) => {
		await harness.pardaUnrank();
		// Switching the mode clears this server's 30 s cache of the standings.
		await setOrder(page, "manual");
		await setOrder(page, "auto");
	});

	test("the probe's route needs its secret, names what to probe and stores a run", async ({ request }) => {
		const endpoint = "/api/parda/probe";
		expect((await request.get(endpoint)).status()).toBe(401);
		const headers = { authorization: `Bearer ${E2E.probeSecret}` };
		const plan = (await (await request.get(endpoint, { headers })).json()) as {
			titles: unknown[];
			sources: Array<{ id: string; name: string; urls: Array<string | null> }>;
		};
		expect(plan.sources.map((source) => source.name)).toEqual(
			expect.arrayContaining(["Server 1", "Server 2", "Server 3", "Server 4"]),
		);
		expect(plan.sources.every((source) => source.urls.length === plan.titles.length)).toBe(true);
		const run = {
			sourceId: plan.sources[0]?.id,
			media: "movie",
			tmdbId: 550,
			alive: true,
			startMs: 1_200,
			topHeight: null,
			ladder: [],
			popups: 0,
			clicks: 0,
			redirects: 0,
			videoHosts: [],
			error: null,
		};
		expect((await request.post(endpoint, { headers, data: { results: [{ ...run, extra: 1 }] } })).status()).toBe(400);
		const stored = await request.post(endpoint, { headers, data: { results: [run] } });
		expect(await stored.json()).toEqual({ ok: true, stored: 1, ignored: 0 });
	});

	test("automatic order starts on the best score; manual order on the admin's first", async ({ page, harness }) => {
		const watch = pardaFixturePath("watch-movie");
		await harness.pardaRank({ "Server 1": 0.2, "Server 2": 0.3, "Server 3": 0.4, "Server 4": 0.9 });
		await setOrder(page, "manual");
		await page.goto(watch);
		await expect(frame(page)).toHaveAttribute("src", /^\/parda\/api\/1\/movie\//);

		await setOrder(page, "auto");
		// The list shows the scores and today's order.
		const row = page.getByRole("row").filter({ has: page.getByRole("link", { name: "Server 4", exact: true }) });
		await expect(row).toContainText("0.9");
		await page.goto(watch);
		await expect(frame(page)).toHaveAttribute("src", /^\/parda\/api\/4\/movie\//);
	});

	test("a slow connection starts on an adaptive source", async ({ page, harness }) => {
		const edit = async (choice: string) => {
			await page.goto(`/admin/parda/sources/${await harness.pardaSourceId("Server 4")}`, { waitUntil: "networkidle" });
			await page.getByRole("combobox", { name: "Adaptive quality" }).click();
			await page.getByRole("option", { name: choice, exact: true }).click();
			await page.getByRole("button", { name: "Save" }).click();
			await expect(page).toHaveURL(/\/admin\/parda\/sources$/);
		};
		await edit("Adaptive");
		try {
			await page.addInitScript(() => {
				Object.defineProperty(navigator, "connection", {
					configurable: true,
					value: { downlink: 1.5, saveData: false },
				});
			});
			await page.goto(pardaFixturePath("watch-movie"));
			await expect(frame(page)).toHaveAttribute("src", /^\/parda\/api\/4\/movie\//);
		} finally {
			await edit("From the probe");
		}
	});

	test("a source failing on a title for two viewers is tried last there", async ({ page, browser, harness }) => {
		await harness.resetRateLimits();
		const watch = pardaFixturePath("watch-series");
		// Each failure must come from someone else (a visitor, then the admin): one client can't hide a source.
		const failOnce = async (viewer: Page, failures: number) => {
			await cue(viewer, 1, { cue: "fail" });
			await viewer.goto(watch);
			await expect(viewer.getByText("Trying Server 3…")).toBeVisible();
			await expect(viewer.getByTestId("watch-box")).toHaveAttribute("data-status", "playing", { timeout: 15_000 });
			await expect.poll(async () => (await harness.pardaTitleFails())[0]?.failures ?? 0).toBe(failures);
			await viewer.unroute("**/parda/api/1/**");
		};
		// A visitor: newContext would otherwise take the admin's storageState from test.use.
		const visitor = await browser.newContext({ baseURL: E2E.baseURL, storageState: { cookies: [], origins: [] } });
		await failOnce(await visitor.newPage(), 1);
		await visitor.close();
		await page.goto(watch);
		await expect(frame(page)).toHaveAttribute("src", /^\/parda\/api\/1\//);
		await failOnce(page, 2);
		expect((await harness.pardaTitleFails())[0]?.skip_until).not.toBeNull();
		await page.goto(watch);
		await expect(frame(page)).toHaveAttribute("src", /^\/parda\/api\/2\//);
		// Another title still starts on Server 1.
		await page.goto(pardaFixturePath("watch-movie"));
		await expect(frame(page)).toHaveAttribute("src", /^\/parda\/api\/1\//);
	});
});
