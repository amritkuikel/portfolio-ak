import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { createAuthMiddleware } from "better-auth/api";
import { emailOTP, haveIBeenPwned, twoFactor } from "better-auth/plugins";
import { afterEach, describe, expect, it, vi } from "vitest";
import { refuseEmailCodeWithTwoFactor } from "@/server/auth/hooks";
import { BREACHED_PASSWORD_PATHS, mustSetUpTwoFactor } from "@/server/auth/policy";

/**
 * The parts of src/server/auth/auth.ts that change what Better Auth allows, run
 * against a real Better Auth instance (in-memory database): the breached-password
 * paths and the email-code guard for accounts with two-factor on.
 */
const sha1Hex = async (value: string) => {
	const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(value));
	return Buffer.from(digest).toString("hex").toUpperCase();
};

function createAuth() {
	const tables: Record<string, Array<Record<string, unknown>>> = {
		user: [],
		session: [],
		account: [],
		verification: [],
		twoFactor: [],
	};
	const codes = new Map<string, string>();
	const auth = betterAuth({
		baseURL: "http://localhost:3000",
		secret: "test-secret-that-is-at-least-32-characters-long",
		database: memoryAdapter(tables),
		emailAndPassword: { enabled: true },
		rateLimit: { enabled: false },
		hooks: { after: createAuthMiddleware(refuseEmailCodeWithTwoFactor) },
		plugins: [
			emailOTP({
				disableSignUp: true,
				sendVerificationOTP: async ({ email, otp }) => {
					codes.set(email, otp);
				},
			}),
			twoFactor(),
			haveIBeenPwned({ paths: [...BREACHED_PASSWORD_PATHS] }),
		],
	});
	return { auth, tables, codes };
}

/** Pretends to be the Have I Been Pwned range API, listing `breached` as found. */
const stubPwnedPasswords = async (breached: string) => {
	const hash = await sha1Hex(breached);
	return vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
		const url = String(input instanceof Request ? input.url : input);
		const body = url.endsWith(hash.slice(0, 5)) ? `${hash.slice(5)}:42\r\n0000000000000000000000000000000000A:1` : "";
		return new Response(body, { status: 200 });
	});
};

const codeOf = async (promise: Promise<unknown>) => {
	try {
		await promise;
		return "resolved";
	} catch (error) {
		return (error as { body?: { code?: string } }).body?.code ?? "unknown";
	}
};

afterEach(() => vi.restoreAllMocks());

describe("breached passwords", () => {
	it("refuses a password from the breach corpus on sign-up, and allows others", async () => {
		const fetchSpy = await stubPwnedPasswords("password123");
		const { auth } = createAuth();
		expect(
			await codeOf(auth.api.signUpEmail({ body: { name: "A", email: "a@example.com", password: "password123" } })),
		).toBe("PASSWORD_COMPROMISED");
		expect(
			await codeOf(
				auth.api.signUpEmail({ body: { name: "A", email: "a@example.com", password: "a-long-unique-phrase-9" } }),
			),
		).toBe("resolved");
		// Only the first five characters of the hash leave the server.
		const urls = fetchSpy.mock.calls.map(([input]) => String(input));
		expect(urls.every((url) => /\/range\/[0-9A-F]{5}$/.test(url))).toBe(true);
	});
});

describe("email-code sign-in with two-factor on", () => {
	it("is refused and leaves no session; without two-factor it signs in", async () => {
		await stubPwnedPasswords("never-used");
		const { auth, tables, codes } = createAuth();
		for (const email of ["plain@example.com", "secure@example.com"]) {
			await auth.api.signUpEmail({ body: { name: "U", email, password: "a-long-unique-phrase-9" } });
		}
		for (const row of tables.user ?? []) {
			row.emailVerified = true;
			row.twoFactorEnabled = row.email === "secure@example.com";
		}

		const signInWithCode = async (email: string) => {
			await auth.api.sendVerificationOTP({ body: { email, type: "sign-in" } });
			return auth.api.signInEmailOTP({ body: { email, otp: codes.get(email) ?? "" } });
		};

		expect(await codeOf(signInWithCode("plain@example.com"))).toBe("resolved");
		const sessionsBefore = tables.session?.length ?? 0;
		expect(await codeOf(signInWithCode("secure@example.com"))).toBe("TWO_FACTOR_USE_PASSWORD");
		expect(tables.session?.length).toBe(sessionsBefore);
	});
});

describe("mustSetUpTwoFactor (AUTH_REQUIRE_ADMIN_2FA)", () => {
	it("applies only when required, to users with an admin permission and no second factor", () => {
		const admin = ["users:read"];
		expect(mustSetUpTwoFactor({ required: true, permissions: admin, twoFactorEnabled: false })).toBe(true);
		expect(mustSetUpTwoFactor({ required: true, permissions: admin, twoFactorEnabled: true })).toBe(false);
		expect(mustSetUpTwoFactor({ required: true, permissions: [], twoFactorEnabled: false })).toBe(false);
		expect(mustSetUpTwoFactor({ required: false, permissions: admin, twoFactorEnabled: false })).toBe(false);
	});
});
