import { admin } from "better-auth/plugins";
import { describe, expect, it } from "vitest";
import { DISABLED_ADMIN_PATHS } from "@/server/auth/disabled-paths";

describe("Better Auth admin endpoints", () => {
	it("are all disabled over HTTP (RBAC goes through src/functions/rbac.ts)", () => {
		const paths = Object.values(admin().endpoints).map((endpoint) => endpoint.path);
		expect(paths.length).toBeGreaterThan(0);
		expect([...paths].sort()).toEqual([...DISABLED_ADMIN_PATHS].sort());
	});
});
