/**
 * Taskline's shell (decision 0208): a visitor tries the sandbox from the landing and
 * works in it as a guest; a team member signs in on Taskline's own page and sees the
 * team's projects, but not a private one they aren't on; a workspace's address opens
 * its projects, and an unknown one is a 404 inside the frame.
 */
import type { Page } from "@playwright/test";
import { E2E } from "../harness/config.ts";
import { expect, RESOURCE_STATUS, test } from "../support/fixtures.ts";

/** Opens a page and waits until it's hydrated (no requests in flight). */
const open = (page: Page, path: string) => page.goto(path, { waitUntil: "networkidle" });

/** Signs in on Taskline's sign-in page as a seeded member of the demo team. */
async function signInAs(page: Page, email: string) {
	await open(page, "/app/taskline/sign-in");
	await page.getByRole("textbox", { name: "Email" }).fill(email);
	await page.getByRole("textbox", { name: "Password" }).fill(E2E.password);
	await page.getByRole("button", { name: "Log in" }).click();
	await expect(page).toHaveURL(/\/app\/taskline\/home$/);
}

test.describe("Taskline", () => {
	test("a visitor tries the sandbox from the landing", async ({ page, harness }) => {
		await harness.resetRateLimits();
		await open(page, "/app/taskline");
		await expect(page.getByRole("heading", { level: 1 })).toContainText("Plan the work");
		await page.getByTestId("try-sandbox").click();
		await expect(page).toHaveURL(/\/app\/taskline\/home$/);
		await expect(page.getByTestId("guest-banner")).toBeVisible();
		await expect(page.getByTestId("taskline-sidebar")).toBeVisible();
		// No other section's chrome: the apps' switcher isn't here.
		await expect(page.getByTestId("app-switcher")).toHaveCount(0);
		await expect(page.getByTestId("recent-projects")).toContainText("Website relaunch");

		await page.getByTestId("taskline-sidebar").getByRole("link", { name: "Projects" }).click();
		await expect(page).toHaveURL(/\/app\/taskline\/sandbox\/projects$/);
		await page.getByTestId("project-cards").getByRole("link", { name: "Website relaunch" }).click();
		await expect(page.getByRole("heading", { level: 1, name: "Website relaunch" })).toBeVisible();
		await expect(page.getByTestId("project-statuses")).toContainText("In progress");

		// The landing sends a signed-in visitor (a guest too) straight to Home.
		await open(page, "/app/taskline");
		await expect(page).toHaveURL(/\/app\/taskline\/home$/);
	});

	test("a member sees the team's projects, and not a private one they aren't on", async ({ page, harness, guard }) => {
		await harness.resetRateLimits();
		await signInAs(page, "asha@taskline.example.com");
		await expect(page.getByTestId("my-tasks")).toBeVisible();

		await page.getByTestId("taskline-sidebar").getByRole("link", { name: "Projects" }).click();
		await expect(page).toHaveURL(/\/app\/taskline\/team\/projects$/);
		const cards = page.getByTestId("project-cards");
		await expect(cards.getByRole("link", { name: "Website relaunch" })).toBeVisible();
		await expect(cards.getByRole("link", { name: "Mobile app" })).toBeVisible();
		await expect(cards.getByRole("link", { name: "Operations" })).toHaveCount(0);
		// The private project is simply not there for them: a 404 page.
		guard.allow(RESOURCE_STATUS(404));
		await open(page, "/app/taskline/team/p/OPS");
		await expect(page.getByTestId("not-found-page")).toBeVisible();
		await expect(page.getByTestId("taskline-sidebar")).toBeVisible();

		// Stars show in the sidebar.
		await open(page, "/app/taskline/team/projects");
		await page.getByTestId("star-WEB").click();
		await expect(page.getByTestId("nav-starred")).toContainText("Website relaunch");
		await page.getByTestId("star-WEB").click();
		await expect(page.getByTestId("nav-starred")).toHaveCount(0);

		// The palette finds a project by its key.
		await page.keyboard.press("Control+k");
		await page.getByTestId("command-input").fill("APP");
		await page.keyboard.press("Enter");
		await expect(page.getByRole("heading", { level: 1, name: "Mobile app" })).toBeVisible();
	});

	test("a workspace opens on its projects, and an unknown one is a 404 in the frame", async ({
		page,
		harness,
		guard,
	}) => {
		await harness.resetRateLimits();
		await signInAs(page, "bikash@taskline.example.com");
		await open(page, "/app/taskline/team");
		await expect(page).toHaveURL(/\/app\/taskline\/team\/projects$/);
		// Bikash is on the private project.
		await expect(page.getByTestId("project-cards").getByRole("link", { name: "Operations" })).toBeVisible();
		guard.allow(RESOURCE_STATUS(404));
		const response = await page.goto("/app/taskline/elsewhere/projects");
		expect(response?.status()).toBe(404);
		await expect(page.getByTestId("not-found-page")).toBeVisible();
		await expect(page.getByRole("link", { name: "Go to Taskline" })).toBeVisible();
	});

	test("a visitor is sent to Taskline's own sign-in, and comes back", async ({ page }) => {
		await open(page, "/app/taskline/home");
		await expect(page).toHaveURL(/\/app\/taskline\/sign-in\?redirect=/);
		await expect(page.getByTestId("taskline-auth-panel")).toBeAttached();
		await expect(page.getByRole("heading", { level: 1, name: "Sign in to Taskline" })).toBeVisible();
	});
});
