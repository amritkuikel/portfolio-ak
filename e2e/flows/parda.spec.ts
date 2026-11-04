/**
 * Parda's foundation (Task 59, decision 0230): the placeholder player's four routes are
 * real documents framed only by this app, and the player lab loads one and logs what it
 * reports, in a production build under the real CSP (the guard fails on any violation).
 */
import { E2E } from "../harness/config.ts";
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
