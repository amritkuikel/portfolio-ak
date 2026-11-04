/**
 * Parda's foundation (Task 59, decision 0230): the placeholder player's four routes are
 * real documents framed only by this app, and the player lab loads one and logs what it
 * reports, in a production build under the real CSP (the guard fails on any violation).
 */
import { E2E } from "../harness/config.ts";
import { fixtureTitlePath, pardaFixturePath } from "../harness/tmdb.ts";
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

	test("a movie plays on its first source, opens its trailer and browses its gallery", async ({ page }) => {
		await page.goto(pardaFixturePath("movie"), { waitUntil: "networkidle" });
		await expect(page.getByTestId("title-heading")).toBeVisible();
		await expect(page.getByTestId("title-cast").getByTestId("person-card").first()).toBeVisible();
		await expect(page.getByTestId("title-crew")).toContainText(/Director/);
		await page.getByTestId("title-play").click();
		await expect(page.locator('iframe[src^="/parda/api/1/movie/"]')).toBeVisible();

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
