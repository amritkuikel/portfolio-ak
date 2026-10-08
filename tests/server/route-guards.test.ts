import { isRedirect } from "@tanstack/react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/errors";
import type { Session } from "@/lib/session";
import { overwriteGetLocale } from "@/paraglide/runtime";

/**
 * The layout routes' beforeLoad guards. The admin role check itself is a server
 * function (ensureAdmin -> requireAdminMiddleware, tested in auth-middleware.test.ts);
 * here it's mocked to return or throw what the server would.
 */
const ensureAdmin = vi.hoisted(() => vi.fn<() => Promise<Session>>());
vi.mock("@/functions/auth", () => ({ ensureAdmin }));
const setErrorStatus = vi.hoisted(() => vi.fn(async () => {}));
vi.mock("@/lib/http-status", () => ({ setErrorStatus }));

const { Route: authedRoute } = await import("@/routes/_authed");
const { Route: authRoute } = await import("@/routes/_auth");
const { Route: adminRoute } = await import("@/routes/_admin");

type BeforeLoad = (ctx: Record<string, unknown>) => unknown;
const beforeLoad = (route: { options: unknown }) => (route.options as { beforeLoad: BeforeLoad }).beforeLoad;

const session = (role: "user" | "admin"): Session => ({ user: { id: "u1", email: "a@example.com", name: "A", role } });
const location = { href: "/account?tab=sessions" };

/** Runs a guard and returns what it threw (or undefined). */
const thrown = async (run: () => unknown) => {
	try {
		await run();
		return undefined;
	} catch (error) {
		return error;
	}
};

afterEach(() => {
	overwriteGetLocale(() => "en");
	ensureAdmin.mockReset();
	setErrorStatus.mockClear();
});

describe("_authed (signed-in pages)", () => {
	it("sends anonymous visitors to /login with a return URL", async () => {
		const error = await thrown(() => beforeLoad(authedRoute)({ context: { session: null }, location }));
		expect(isRedirect(error)).toBe(true);
		expect((error as { options: unknown }).options).toMatchObject({
			to: "/login",
			search: { redirect: "/account?tab=sessions" },
		});
	});

	it("lets signed-in users through and narrows the session for child routes", async () => {
		const user = session("user");
		expect(await beforeLoad(authedRoute)({ context: { session: user }, location })).toEqual({ session: user });
	});
});

describe("_auth (login, register, ...)", () => {
	it("sends signed-in users on to their validated redirect target, localized", async () => {
		overwriteGetLocale(() => "ne");
		const error = await thrown(() =>
			beforeLoad(authRoute)({ context: { session: session("user") }, search: { redirect: "/admin/test-crud" } }),
		);
		expect(isRedirect(error)).toBe(true);
		expect((error as { options: { href: string } }).options.href).toBe("/ne/admin/test-crud");
	});

	it("defaults to the account page and leaves anonymous visitors alone", async () => {
		const error = await thrown(() => beforeLoad(authRoute)({ context: { session: session("user") }, search: {} }));
		expect((error as { options: { href: string } }).options.href).toBe("/account");
		expect(await thrown(() => beforeLoad(authRoute)({ context: { session: null }, search: {} }))).toBeUndefined();
	});
});

describe("_admin (admin area)", () => {
	it("asks the server on every navigation and passes the admin session on", async () => {
		ensureAdmin.mockResolvedValue(session("admin"));
		expect(await beforeLoad(adminRoute)({ location })).toEqual({ session: session("admin") });
		expect(ensureAdmin).toHaveBeenCalledOnce();
	});

	it("redirects anonymous visitors (UNAUTHORIZED) to /login with a return URL", async () => {
		ensureAdmin.mockRejectedValue(new AppError("UNAUTHORIZED"));
		const error = await thrown(() => beforeLoad(adminRoute)({ location }));
		expect(isRedirect(error)).toBe(true);
		expect((error as { options: unknown }).options).toMatchObject({
			to: "/login",
			search: { redirect: location.href },
		});
	});

	it("rethrows FORBIDDEN for signed-in non-admins, with the 403 status recorded for SSR", async () => {
		const forbidden = new AppError("FORBIDDEN");
		ensureAdmin.mockRejectedValue(forbidden);
		expect(await thrown(() => beforeLoad(adminRoute)({ location }))).toBe(forbidden);
		expect(setErrorStatus).toHaveBeenCalledWith(forbidden);
	});
});
