// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";

describe("server env in a browser environment", () => {
	it("refuses to load when evaluated where `window` exists", async () => {
		vi.resetModules();
		await expect(import("@/server/env")).rejects.toThrow(/server-only and was loaded in a browser/);
	});

	it("client env still loads in the browser", async () => {
		vi.resetModules();
		vi.stubEnv("VITE_APP_TITLE", "Portfolio");
		const { clientEnv } = await import("@/lib/client-env");
		expect(clientEnv.VITE_APP_TITLE).toBe("Portfolio");
	});
});
