/**
 * The showcase apps (decisions 0185–0188): a guest tries Kanban without an account, moves
 * cards with the keyboard, and keeps the board on signing up (the emailed link) or on
 * signing in to an account with two-factor (the claim cookie). A guest reaches no
 * account or admin page.
 */
import type { Page } from "@playwright/test";
import { E2E } from "../harness/config.ts";
import { authFetch, expect, RESOURCE_STATUS, test } from "../support/fixtures.ts";
import { totp } from "../support/totp.ts";
import { createVerifiedUser, linkIn, uniqueEmail } from "../support/users.ts";

/** Opens a page and waits until it's hydrated (no requests in flight). */
const open = (page: Page, path: string) => page.goto(path, { waitUntil: "networkidle" });

/** The cards of a column, by its heading, in the order shown. */
const cardsIn = (page: Page, column: string) =>
	page
		.getByTestId("kanban-column")
		.filter({ has: page.getByRole("heading", { level: 3, name: column, exact: true }) })
		.getByTestId("kanban-card-open");

/** "Try it now" on the Kanban landing, then the sample board. */
async function startGuest(page: Page) {
	await open(page, "/apps/kanban");
	await page.getByTestId("try-app").click();
	await expect(page.getByRole("heading", { level: 1, name: "Your boards" })).toBeVisible();
	await expect(page.getByTestId("guest-banner")).toBeVisible();
	await page.getByTestId("kanban-board-link").filter({ hasText: "Getting started" }).click();
	await expect(page.getByRole("heading", { level: 1, name: "Getting started" })).toBeVisible();
	await page.waitForLoadState("networkidle");
}

/** Moves "Drag me to Doing" one column right with Alt + →, and adds a card, both saved. */
async function changeBoard(page: Page) {
	await page.getByRole("button", { name: "Move card Drag me to Doing" }).focus();
	const saved = page.waitForResponse(
		(response) => response.url().includes("/_serverFn/") && response.request().method() === "POST",
	);
	await page.keyboard.press("Alt+ArrowRight");
	await expect(page.getByTestId("kanban-announcement")).toHaveText(
		/Drag me to Doing moved to Doing, position 1 of 2\./,
	);
	await expect(cardsIn(page, "Doing")).toHaveText(["Drag me to Doing", "Open a card to edit it"]);
	await saved;

	const todo = page.getByTestId("kanban-column").first();
	await todo.getByTestId("kanban-add-card-open").click();
	await todo.getByRole("textbox", { name: "New card in To do" }).fill("Kept after sign-up");
	const added = page.waitForResponse(
		(response) => response.url().includes("/_serverFn/") && response.request().method() === "POST",
	);
	await todo.getByRole("textbox", { name: "New card in To do" }).press("Enter");
	await added;
	await expect(cardsIn(page, "To do")).toContainText(["Kept after sign-up"]);
}

/** The board as the account sees it: the guest's changes are there. */
async function boardKept(page: Page) {
	await open(page, "/apps/kanban");
	await expect(page.getByTestId("guest-banner")).toHaveCount(0);
	await page.getByTestId("kanban-board-link").filter({ hasText: "Getting started" }).click();
	await expect(cardsIn(page, "Doing")).toHaveText(["Drag me to Doing", "Open a card to edit it"]);
	await expect(cardsIn(page, "To do")).toContainText(["Kept after sign-up"]);
}

test.beforeEach(async ({ harness }) => {
	await harness.resetRateLimits();
});

test("a guest tries Kanban with the keyboard, registers, verifies and keeps the board", async ({ page, harness }) => {
	await startGuest(page);
	await changeBoard(page);

	// The move is saved: a reload (server-rendered from the database) shows it.
	await page.reload({ waitUntil: "networkidle" });
	await expect(cardsIn(page, "Doing")).toHaveText(["Drag me to Doing", "Open a card to edit it"]);

	// No account pages for a guest.
	await open(page, "/account");
	await expect(page).toHaveURL(/\/upgrade\?redirect=/);
	await expect(page.getByRole("heading", { level: 1, name: "Keep what you made" })).toBeVisible();

	// Sign up from the upgrade page, verify in the same browser.
	const email = uniqueEmail("guest");
	await page.getByTestId("upgrade-register").click();
	await page.waitForLoadState("networkidle");
	await page.getByLabel("Name").fill("Guest Upgrader");
	await page.getByLabel("Email").fill(email);
	await page.getByLabel("Password", { exact: true }).fill(E2E.password);
	await page.getByLabel("Confirm password").fill(E2E.password);
	await page.getByRole("button", { name: "Create account" }).click();
	await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
	const verification = await harness.nextEmail(email, "verify-email");
	await open(page, linkIn(verification.text));
	await expect(page.getByText("Your email is verified and you're signed in.")).toBeVisible();

	await boardKept(page);
});

test("a guest signs in to an account with two-factor and keeps the board", async ({ page, harness }) => {
	// An account with two-factor on, set up through Better Auth's API.
	const user = await createVerifiedUser(harness, "guest-2fa");
	const signIn = await authFetch("/api/auth/sign-in/email", { email: user.email, password: user.password });
	const cookie = signIn.headers
		.getSetCookie()
		.map((header) => header.split(";")[0])
		.join("; ");
	const post = (path: string, body: unknown) =>
		fetch(new URL(path, E2E.baseURL), {
			method: "POST",
			headers: { "content-type": "application/json", origin: E2E.baseURL, cookie },
			body: JSON.stringify(body),
		});
	const enabled = (await (await post("/api/auth/two-factor/enable", { password: user.password })).json()) as {
		totpURI: string;
	};
	const secret = new URL(enabled.totpURI).searchParams.get("secret") ?? "";
	expect((await post("/api/auth/two-factor/verify-totp", { code: totp(secret) })).status).toBe(200);

	await startGuest(page);
	await changeBoard(page);

	// The password step drops the guest's session; the code finishes the sign-in, and the
	// claim cookie brings the board along.
	await open(page, "/login?redirect=/apps/kanban");
	await page.getByLabel("Email").fill(user.email);
	await page.getByLabel("Password", { exact: true }).fill(user.password);
	await page.getByRole("button", { name: "Log in" }).click();
	await page.getByLabel("6-digit code").fill(totp(secret));
	await page.getByRole("button", { name: "Sign in" }).click();
	await expect(page).toHaveURL(new URL("/apps/kanban", E2E.baseURL).href);

	await boardKept(page);
});

test("a guest can't enter the admin area or change an account", async ({ page, guard }) => {
	await startGuest(page);
	await open(page, "/admin");
	await expect(page).toHaveURL(/\/login\?redirect=/);
	// Better Auth refuses account changes from a guest session.
	guard.allow(RESOURCE_STATUS(403));
	const refused = await page.evaluate(async () => {
		const response = await fetch("/api/auth/change-email", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ newEmail: "someone@example.com" }),
		});
		return { status: response.status, body: await response.text() };
	});
	expect(refused.status).toBe(403);
	expect(refused.body).toContain("GUEST_ACCOUNT");
});
