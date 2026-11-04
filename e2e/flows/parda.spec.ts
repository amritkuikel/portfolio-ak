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
