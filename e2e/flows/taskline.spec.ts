/**
 * Taskline (decisions 0208–0213): a visitor tries the sandbox from the landing and
 * works in it as a guest; a team member signs in on Taskline's own page and sees the
 * team's projects, but not a private one they aren't on; a workspace's address opens
 * its projects, and an unknown one is a 404 inside the frame. On the board a task
 * moves by keyboard and opens by its own address; a guest keeps their sandbox on
 * signing up (the emailed link) or in (two-factor and the claim cookie); Kanban's old
 * addresses redirect. From the admin, a project is created and someone invited to it, who
 * signs up from the email and lands in it, and gets a 404 once deactivated.
 */
import type { Page } from "@playwright/test";
import { E2E } from "../harness/config.ts";
import { authFetch, expect, RESOURCE_STATUS, signedIn, test } from "../support/fixtures.ts";
import { totp } from "../support/totp.ts";
import { createVerifiedUser, linkIn, uniqueEmail } from "../support/users.ts";

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

/** A board column's tasks, by the column's heading, in the order shown. */
const tasksIn = (page: Page, status: string) =>
	page
		.getByTestId("taskline-column")
		.filter({ has: page.getByRole("heading", { level: 3, name: status, exact: true }) })
		.getByTestId("taskline-card-title");

const nextSave = (page: Page) =>
	page.waitForResponse((response) => response.url().includes("/_serverFn/") && response.request().method() === "POST");

/** Adds a task at the foot of "To do", then moves it one column right with Alt + →, both saved. */
async function addAndMove(page: Page, title: string) {
	const todo = page
		.getByTestId("taskline-column")
		.filter({ has: page.getByRole("heading", { level: 3, name: "To do", exact: true }) });
	await todo.getByTestId("taskline-add-task-open").click();
	const field = todo.getByRole("textbox", { name: "New task in To do" });
	await field.fill(title);
	const added = nextSave(page);
	await field.press("Enter");
	await added;
	// Once the server has numbered it, its title opens it.
	await expect(todo.getByTestId("taskline-card-open").filter({ hasText: title })).toBeVisible();
	await page.getByRole("button", { name: `Move task ${title}` }).focus();
	const moved = nextSave(page);
	await page.keyboard.press("Alt+ArrowRight");
	await expect(page.getByTestId("taskline-announcement")).toHaveText(new RegExp(`${title} moved to In progress`));
	await moved;
	await expect(tasksIn(page, "In progress")).toContainText([title]);
}

/** "Try the sandbox" on the landing, then the sample project's board. */
async function startGuest(page: Page) {
	await open(page, "/app/taskline");
	await page.getByTestId("try-sandbox").click();
	await expect(page).toHaveURL(/\/app\/taskline\/home$/);
	await expect(page.getByTestId("guest-banner")).toBeVisible();
	await open(page, "/app/taskline/sandbox/p/WEB/board");
}

/** The sandbox as the account sees it: the guest's move is there. */
async function sandboxKept(page: Page, title: string) {
	await open(page, "/app/taskline/sandbox/p/WEB/board");
	await expect(page.getByTestId("guest-banner")).toHaveCount(0);
	await expect(tasksIn(page, "In progress")).toContainText([title]);
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

	test("a member moves a task by keyboard and opens it by its address", async ({ page, harness }) => {
		await harness.resetRateLimits();
		await signInAs(page, "asha@taskline.example.com");
		await open(page, "/app/taskline/team/p/WEB/board");
		const title = `Moved by keyboard ${Date.now()}`;
		await addAndMove(page, title);
		// Saved: a reload (server-rendered from the database) shows it moved.
		await page.reload({ waitUntil: "networkidle" });
		await expect(tasksIn(page, "In progress")).toContainText([title]);

		// It opens in a sheet over the board, at its own address.
		await page.getByTestId("taskline-card-open").filter({ hasText: title }).click();
		await expect(page.getByTestId("task-sheet")).toBeVisible();
		await expect(page).toHaveURL(/\/app\/taskline\/team\/t\/WEB-\d+$/);
		// That address, opened anew, is the task's page.
		await open(page, page.url());
		await expect(page.getByTestId("task-page")).toBeVisible();
		await expect(page.getByRole("heading", { level: 1 })).toContainText(title);
	});

	test("Kanban's old addresses redirect to Taskline", async ({ page, harness }) => {
		const landing = await fetch(new URL("/apps/kanban", E2E.baseURL), { redirect: "manual" });
		expect(landing.status).toBe(301);
		expect(landing.headers.get("location")).toMatch(/\/app\/taskline$/);

		await harness.resetRateLimits();
		await signInAs(page, "asha@taskline.example.com");
		await open(page, `/apps/kanban/${await harness.tasklineProjectId("WEB")}`);
		await expect(page).toHaveURL(/\/app\/taskline\/team\/p\/WEB\/board$/);
		await expect(page.getByTestId("taskline-board")).toBeVisible();
		// An id that is no project of theirs: Taskline itself (signed in, that's Home).
		await open(page, `/apps/kanban/${crypto.randomUUID()}`);
		await expect(page).toHaveURL(/\/app\/taskline\/home$/);
	});

	test("a guest moves a task in the sandbox, signs up, verifies and keeps it", async ({ page, harness }) => {
		await harness.resetRateLimits();
		await startGuest(page);
		await addAndMove(page, "Kept after sign-up");

		// A guest's account page is Taskline's sign-up.
		await open(page, "/app/taskline/account");
		await expect(page).toHaveURL(/\/app\/taskline\/sign-up\?redirect=/);
		const email = uniqueEmail("tl-guest");
		await page.getByLabel("Name").fill("Guest Upgrader");
		await page.getByLabel("Email").fill(email);
		await page.getByLabel("Password", { exact: true }).fill(E2E.password);
		await page.getByLabel("Confirm password").fill(E2E.password);
		await page.getByRole("button", { name: "Create account" }).click();
		await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
		const verification = await harness.nextEmail(email, "verify-email");
		await open(page, linkIn(verification.text));
		await expect(page.getByText("Your email is verified and you're signed in.")).toBeVisible();

		await sandboxKept(page, "Kept after sign-up");
	});

	test("a guest signs in to an account with two-factor and keeps the sandbox", async ({ page, harness }) => {
		await harness.resetRateLimits();
		// An account with two-factor on, set up through Better Auth's API.
		const user = await createVerifiedUser(harness, "tl-guest-2fa");
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
		await addAndMove(page, "Kept after two-factor");

		// The password step drops the guest's session; the code finishes the sign-in, and the
		// claim cookie brings the sandbox along.
		await open(page, "/login?redirect=/app/taskline/home");
		await page.getByLabel("Email").fill(user.email);
		await page.getByLabel("Password", { exact: true }).fill(user.password);
		await page.getByRole("button", { name: "Log in" }).click();
		await page.getByLabel("6-digit code").fill(totp(secret));
		await page.getByRole("button", { name: "Sign in" }).click();
		// The whole address: the login page's own (`?redirect=/app/taskline/home`) ends the same way.
		await expect(page).toHaveURL(new URL("/app/taskline/home", E2E.baseURL).href);

		await sandboxKept(page, "Kept after two-factor");
	});
});

test.describe("Taskline from the admin", () => {
	test.use(signedIn("admin"));

	test("an admin creates a project and invites someone, who signs up from the email and lands in it; once deactivated, it's a 404", async ({
		page,
		browser,
		harness,
	}) => {
		await harness.resetRateLimits();
		// A key of its own, so a retry against the same server doesn't meet the first attempt's project.
		const key = `L${Date.now().toString(36).slice(-4).toUpperCase()}`;
		const name = `Launch plan ${key}`;
		// A private project with no lead yet.
		await open(page, "/admin/taskline/projects/new");
		await page.getByLabel("Name").fill(name);
		await page.getByLabel("Key").fill(key);
		await page.getByRole("combobox", { name: "Who can see it" }).click();
		await page.getByRole("option", { name: "Private", exact: true }).click();
		await page.getByRole("button", { name: "Create project" }).click();
		await expect(page).toHaveURL(/\/admin\/taskline\/projects\/[0-9a-f-]{36}$/);
		await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();

		// Invite a new address onto it.
		const email = uniqueEmail("tl-invite");
		await open(page, "/admin/taskline/members");
		await page.getByTestId("invite-member").click();
		const dialog = page.getByTestId("invite-member-dialog");
		await dialog.getByLabel("Email").fill(email);
		await dialog.getByRole("combobox", { name: "Start on a project" }).click();
		await page.getByRole("option", { name: `${key} · ${name}` }).click();
		await dialog.getByRole("button", { name: "Send invitation" }).click();
		await expect(page.getByText(`Invitation sent to ${email}.`)).toBeVisible();
		await open(page, "/admin/taskline/invitations");
		await expect(page.getByTestId("taskline-admin-invitations")).toContainText(email);

		// The invitee, in a browser of their own: the email's link, sign-up, the verification link, Continue.
		const invite = await harness.nextEmail(email, "taskline-invite");
		// Not the admin: the test's signed-in state would otherwise apply to this context too.
		const context = await browser.newContext({ baseURL: E2E.baseURL, storageState: { cookies: [], origins: [] } });
		const invitee = await context.newPage();
		await open(invitee, linkIn(invite.text));
		await expect(invitee).toHaveURL(/\/app\/taskline\/sign-up\?redirect=/);
		await invitee.getByLabel("Name").fill("Invited Ira");
		await invitee.getByLabel("Email").fill(email);
		await invitee.getByLabel("Password", { exact: true }).fill(E2E.password);
		await invitee.getByLabel("Confirm password").fill(E2E.password);
		await invitee.getByRole("button", { name: "Create account" }).click();
		await expect(invitee.getByRole("heading", { name: "Check your email" })).toBeVisible();
		const verification = await harness.nextEmail(email, "verify-email");
		await open(invitee, linkIn(verification.text));
		await invitee.getByRole("link", { name: "Continue" }).click();
		await expect(invitee).toHaveURL(new RegExp(`/app/taskline/team/p/${key}$`));
		await expect(invitee.getByRole("heading", { level: 1, name })).toBeVisible();

		// Deactivated, the project is simply not found for them.
		await open(page, "/admin/taskline/members");
		await page.getByRole("button", { name: "Actions for Invited Ira" }).click();
		await page.getByRole("menuitem", { name: "Deactivate" }).click();
		const deactivate = page.getByTestId("deactivate-member-dialog");
		await deactivate.getByRole("button", { name: "Deactivate" }).click();
		await expect(page.getByText(/Invited Ira deactivated/)).toBeVisible();
		const response = await invitee.goto(`/app/taskline/team/p/${key}`);
		expect(response?.status()).toBe(404);
		await context.close();
	});
});
