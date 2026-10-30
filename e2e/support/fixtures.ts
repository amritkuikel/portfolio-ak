/**
 * The suite's `test`: every page a test opens is watched for console errors and
 * warnings (hydration mismatches included), uncaught errors and CSP violations,
 * and the test fails on any it didn't expect. Also: the harness client and sign-in.
 */
import { existsSync, mkdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { test as base, expect, type Page } from "@playwright/test";
import { E2E, type E2EUser } from "../harness/config.ts";
import type { CapturedEmail } from "../harness/inbox.ts";

type Problem = { kind: "console" | "pageerror" | "csp"; text: string };

declare global {
	interface Window {
		__e2e: { cls: number; shifts: string[]; csp: string[] };
	}
}

/** Runs in every page before its scripts: sums layout shifts and records CSP violations. */
const installObservers = () => {
	const state: Window["__e2e"] = { cls: 0, shifts: [], csp: [] };
	window.__e2e = state;
	const describe = (node: Node | null | undefined) => {
		if (!(node instanceof Element)) return node?.nodeName ?? "?";
		const id = node.id ? `#${node.id}` : "";
		const classes = typeof node.className === "string" ? node.className.split(/\s+/).slice(0, 3).join(".") : "";
		return `${node.tagName.toLowerCase()}${id}${classes ? `.${classes}` : ""}`;
	};
	type Shift = PerformanceEntry & { value: number; hadRecentInput: boolean; sources?: Array<{ node?: Node }> };
	new PerformanceObserver((list) => {
		for (const entry of list.getEntries() as Shift[]) {
			if (entry.hadRecentInput) continue;
			state.cls += entry.value;
			state.shifts.push(`${entry.value.toFixed(4)}: ${(entry.sources ?? []).map((s) => describe(s.node)).join(", ")}`);
		}
	}).observe({ type: "layout-shift", buffered: true });
	document.addEventListener("securitypolicyviolation", (event) => {
		state.csp.push(
			`${event.effectiveDirective} blocked ${event.blockedURI || "inline"} (${event.sourceFile}:${event.lineNumber})`,
		);
	});
};

/** A 403/404 page logs the browser's own line for its document; expected when the test asks for that status. */
export const RESOURCE_STATUS = (status: number) =>
	new RegExp(`Failed to load resource: the server responded with a status of ${status}`);

export class PageGuard {
	readonly problems: Problem[] = [];
	private readonly allowed: RegExp[] = [];

	/** Lets the current test log messages matching `pattern` (e.g. the 404 resource line). */
	allow(pattern: RegExp) {
		this.allowed.push(pattern);
	}

	watch(page: Page) {
		page.on("console", (message) => {
			if (message.type() === "error" || message.type() === "warning") {
				this.problems.push({ kind: "console", text: `${message.type()}: ${message.text()}` });
			}
		});
		page.on("pageerror", (error) => this.problems.push({ kind: "pageerror", text: error.message }));
	}

	/** Problems not allowed by the test, including CSP violations recorded in `page`. */
	async unexpected(page?: Page) {
		if (page && !page.isClosed()) {
			const csp = await page.evaluate(() => window.__e2e?.csp ?? []).catch(() => []);
			for (const text of csp) {
				if (!this.problems.some((problem) => problem.text === text)) this.problems.push({ kind: "csp", text });
			}
		}
		return this.problems.filter((problem) => !this.allowed.some((pattern) => pattern.test(problem.text)));
	}
}

export class Harness {
	/** Emails the fake Resend API received for `to`, oldest first. */
	async emails(to: string): Promise<CapturedEmail[]> {
		const response = await fetch(`${E2E.harnessURL}/e2e/emails?to=${encodeURIComponent(to)}`);
		return (await response.json()) as CapturedEmail[];
	}

	/** Waits for the next email to `to` whose template tag is `tag` (delivery runs in the background). */
	async nextEmail(to: string, tag: string, after = 0): Promise<CapturedEmail> {
		let found: CapturedEmail | undefined;
		await expect
			.poll(
				async () => {
					found = (await this.emails(to)).filter((email) => email.tag === tag)[after];
					return Boolean(found);
				},
				{ message: `a "${tag}" email to ${to}`, timeout: 15_000 },
			)
			.toBe(true);
		return found as CapturedEmail;
	}

	/** Auth endpoints are rate limited per IP, and every test shares 127.0.0.1. */
	async resetRateLimits() {
		await fetch(`${E2E.harnessURL}/e2e/reset-rate-limits`, { method: "POST" });
	}

	async testCrudId(slug: string): Promise<string> {
		const response = await fetch(`${E2E.harnessURL}/e2e/test-crud?slug=${encodeURIComponent(slug)}`);
		const row = (await response.json()) as { id?: string };
		if (!row.id) throw new Error(`no seeded Test CRUD item "${slug}"`);
		return row.id;
	}

	// portfolio:start
	/** A portfolio project's or post's id by slug (the seeded ones, or one a flow created). */
	async portfolioId(kind: "project" | "post", slug: string): Promise<string> {
		const response = await fetch(`${E2E.harnessURL}/e2e/portfolio?kind=${kind}&slug=${encodeURIComponent(slug)}`);
		const row = (await response.json()) as { id?: string };
		if (!row.id) throw new Error(`no portfolio ${kind} "${slug}"`);
		return row.id;
	}
	// portfolio:end

	// apps:start
	/** A user's first Kanban board (the harness makes one on first ask). */
	async kanbanBoardId(user: E2EUser): Promise<string> {
		const email = E2E.users[user].email;
		const response = await fetch(`${E2E.harnessURL}/e2e/kanban-board?email=${encodeURIComponent(email)}`);
		const row = (await response.json()) as { id?: string };
		if (!row.id) throw new Error(`no Kanban board for ${user}`);
		return row.id;
	}
	/** A user's shared review note: its id and the public page's token (the harness makes it on first ask). */
	async reviewNote(user: E2EUser): Promise<{ id: string; token: string }> {
		const email = E2E.users[user].email;
		const response = await fetch(`${E2E.harnessURL}/e2e/note?email=${encodeURIComponent(email)}`);
		const row = (await response.json()) as { id?: string; token?: string };
		if (!row.id || !row.token) throw new Error(`no review note for ${user}`);
		return { id: row.id, token: row.token };
	}
	/** A user's review link, with clicks: its id and slug (the harness makes it on first ask). */
	async reviewLink(user: E2EUser): Promise<{ id: string; slug: string }> {
		const email = E2E.users[user].email;
		const response = await fetch(`${E2E.harnessURL}/e2e/link?email=${encodeURIComponent(email)}`);
		const row = (await response.json()) as { id?: string; slug?: string };
		if (!row.id || !row.slug) throw new Error(`no review link for ${user}`);
		return { id: row.id, slug: row.slug };
	}
	// apps:end
}

let runId: Promise<string> | undefined;
/** Changes every time the harness starts, i.e. with every fresh database. */
const harnessRun = () => {
	runId ??= fetch(`${E2E.harnessURL}/e2e/run`)
		.then((response) => response.json() as Promise<{ id: string }>)
		.then((run) => run.id);
	return runId;
};

/**
 * The saved browser state of `user`, signed in through Better Auth's API the first
 * time it's needed for this harness run (the database, and so every session, is new
 * per run). Files are shared by workers and reruns against the same server; the form
 * itself is covered by e2e/flows/auth.spec.ts.
 */
export async function signInState(user: E2EUser): Promise<string> {
	const path = `e2e/.auth/${user}-${await harnessRun()}.json`;
	if (existsSync(path)) return path;
	const harness = new Harness();
	let response: Response;
	for (let attempt = 1; ; attempt++) {
		await harness.resetRateLimits();
		response = await authFetch("/api/auth/sign-in/email", { email: E2E.users[user].email, password: E2E.password });
		if (response.ok) break;
		// Other workers signing in at the same moment can fill the per-IP bucket again.
		if (response.status !== 429 || attempt === 5) {
			throw new Error(`signing in as ${user} failed: ${response.status} ${await response.text()}`);
		}
	}
	const state = { cookies: response.headers.getSetCookie().map(toCookie), origins: [] };
	mkdirSync(dirname(path), { recursive: true });
	// Written whole, then renamed: another worker never reads half a file.
	const partial = `${path}.${process.pid}.tmp`;
	writeFileSync(partial, JSON.stringify(state));
	renameSync(partial, path);
	return path;
}

/**
 * POSTs JSON to Better Auth with the Origin it requires. Plain fetch rather than Playwright's
 * request API: UI mode traces every test, and request contexts created and disposed inside a
 * test broke those traces on Windows (ENOENT on the trace files, failing the test).
 */
export const authFetch = (path: string, body: unknown) =>
	fetch(new URL(path, E2E.baseURL), {
		method: "POST",
		headers: { "content-type": "application/json", origin: E2E.baseURL },
		body: JSON.stringify(body),
	});

/** A Set-Cookie header as a Playwright storage-state cookie for the app's host. */
const toCookie = (header: string) => {
	const [pair = "", ...attributes] = header.split(";").map((part) => part.trim());
	const separator = pair.indexOf("=");
	const attribute = (name: string) =>
		attributes.find((part) => part.toLowerCase().startsWith(`${name}=`))?.slice(name.length + 1);
	const has = (name: string) => attributes.some((part) => part.toLowerCase() === name);
	const maxAge = attribute("max-age");
	const sameSite = attribute("samesite")?.toLowerCase();
	return {
		name: pair.slice(0, separator),
		value: pair.slice(separator + 1),
		domain: new URL(E2E.baseURL).hostname,
		path: attribute("path") ?? "/",
		expires: maxAge ? Math.floor(Date.now() / 1000) + Number(maxAge) : -1,
		httpOnly: has("httponly"),
		secure: has("secure"),
		sameSite: sameSite === "strict" ? "Strict" : sameSite === "none" ? "None" : "Lax",
	} as const;
};

export const test = base.extend<{ guard: PageGuard; harness: Harness; as: E2EUser | undefined }>({
	/** Who the test's browser is signed in as (`test.use(signedIn("admin"))`); anonymous when unset. */
	as: [undefined, { option: true }],
	storageState: async ({ as, storageState }, use) => {
		await use(as ? await signInState(as) : storageState);
	},
	guard: [
		async ({ context, page }, use, testInfo) => {
			const guard = new PageGuard();
			await context.addInitScript(installObservers);
			guard.watch(page);
			context.on("page", (other) => other !== page && guard.watch(other));
			await use(guard);
			const problems = await guard.unexpected(page);
			if (testInfo.status === testInfo.expectedStatus) {
				expect(problems, "console errors/warnings, page errors or CSP violations").toEqual([]);
			}
		},
		{ auto: true },
	],
	// biome-ignore lint/correctness/noEmptyPattern: Playwright fixtures take their dependencies as a destructured object.
	harness: async ({}, use) => {
		await use(new Harness());
	},
});

/** Test options for a browser signed in as `user`: `test.use(signedIn("admin"))`. */
export const signedIn = (user: E2EUser) => ({ as: user });

export { expect };
