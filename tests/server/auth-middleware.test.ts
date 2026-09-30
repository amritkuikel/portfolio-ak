import { describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/errors";
import type { Session } from "@/lib/session";
import { requireAdminMiddleware, requireUserMiddleware, sessionMiddleware } from "@/middleware/auth";

// The real lookup asks Better Auth (database + request cookies); tests control its result.
const getServerSession = vi.hoisted(() => vi.fn<() => Promise<Session | null>>());
vi.mock("@/server/auth/session", () => ({ getServerSession }));

// Calls a middleware's own server step with a given upstream context, capturing what it passes to next().
type ServerStep = (args: {
	next: (options?: { context?: Record<string, unknown> }) => unknown;
	context: Record<string, unknown>;
}) => unknown;

const runServer = async (middleware: { options: { server?: unknown } }, context: Record<string, unknown>) => {
	const next = vi.fn((options?: { context?: Record<string, unknown> }) => ({ passed: options?.context }));
	const server = middleware.options.server as ServerStep;
	const result = await server({ next, context });
	return { next, result };
};

const session = (role: "user" | "admin"): Session => ({
	user: { id: "u1", email: "a@example.com", name: "A", role },
});

describe("auth middleware", () => {
	it("sessionMiddleware passes null for anonymous requests", async () => {
		getServerSession.mockResolvedValue(null);
		const { next } = await runServer(sessionMiddleware, {});
		expect(next).toHaveBeenCalledWith({ context: { session: null } });
	});

	it("sessionMiddleware passes the Better Auth session on", async () => {
		getServerSession.mockResolvedValue(session("admin"));
		const { next } = await runServer(sessionMiddleware, {});
		expect(next).toHaveBeenCalledWith({ context: { session: session("admin") } });
	});

	it("requireUserMiddleware rejects anonymous calls with UNAUTHORIZED", async () => {
		await expect(runServer(requireUserMiddleware, { session: null })).rejects.toMatchObject({
			code: "UNAUTHORIZED",
			status: 401,
		});
	});

	it("requireUserMiddleware passes the user on", async () => {
		const { next } = await runServer(requireUserMiddleware, { session: session("user") });
		expect(next).toHaveBeenCalledWith({ context: { user: session("user").user } });
	});

	it("requireAdminMiddleware rejects non-admins with FORBIDDEN", async () => {
		const run = runServer(requireAdminMiddleware, { user: session("user").user });
		await expect(run).rejects.toBeInstanceOf(AppError);
		await expect(runServer(requireAdminMiddleware, { user: session("user").user })).rejects.toMatchObject({
			code: "FORBIDDEN",
		});
	});

	it("requireAdminMiddleware lets admins through", async () => {
		const { next } = await runServer(requireAdminMiddleware, { user: session("admin").user });
		expect(next).toHaveBeenCalledOnce();
	});

	it("builds the chain: admin requires user requires session", () => {
		expect(requireAdminMiddleware.options).toMatchObject({ middleware: [requireUserMiddleware] });
		expect(requireUserMiddleware.options).toMatchObject({ middleware: [sessionMiddleware] });
	});
});
