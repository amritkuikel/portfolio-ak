/**
 * Baseline server env for tests. Modules like src/server/env.ts validate
 * process.env when imported, so every test file starts from a valid config.
 * Individual tests still override values (vi.stubEnv) to test failures. The values
 * are set, not defaulted, so a shell or CI env (e.g. CI's VITE_APP_TITLE) can't
 * change what the tests expect.
 */
const defaults: Record<string, string> = {
	DATABASE_URL: "postgres://user:pass@localhost:5432/test",
	EMAIL_FROM: "Portfolio <hello@example.com>",
	BETTER_AUTH_SECRET: "test-secret-that-is-at-least-32-characters-long",
	BETTER_AUTH_URL: "http://localhost:3000",
	VITE_APP_TITLE: "Portfolio",
	VITE_SITE_URL: "http://localhost:3000",
};

for (const [key, value] of Object.entries(defaults)) process.env[key] = value;
