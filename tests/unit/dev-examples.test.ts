import { existsSync } from "node:fs";
import { type AnyRoute, createRouter, isNotFound } from "@tanstack/react-router";
import { describe, expect, it, vi } from "vitest";
import { EXAMPLES } from "@/features/dev/examples/registry";
import { isAppError } from "@/lib/errors";
import { assertDev } from "@/middleware/dev";
import type { RouterContext } from "@/router";
import { Route as DevLayout } from "@/routes/_public/dev/route";
import { routeTree } from "@/routeTree.gen";

const router = createRouter({ routeTree, context: {} as RouterContext });
const exampleRoutes = (Object.values(router.routesById) as AnyRoute[])
	.map((route) => route.fullPath as string)
	.filter((path) => /^\/dev\/examples\/[^/$]+\/?$/.test(path))
	.map((path) => path.replace(/^\/dev\/examples\//, "").replace(/\/$/, ""));

describe("/dev/examples", () => {
	it("the index lists exactly the example routes", () => {
		expect([...new Set(exampleRoutes)].sort()).toEqual(EXAMPLES.map((example) => example.slug).sort());
	});

	it("covers every module named in the plan", () => {
		// 14 from Part 2, plus idempotency keys (Task 28 recipe).
		expect(EXAMPLES).toHaveLength(15);
	});

	it("each example's source file and guide exist", () => {
		for (const example of EXAMPLES) {
			expect(existsSync(example.source), example.source).toBe(true);
			expect(existsSync(example.guide), example.guide).toBe(true);
		}
	});

	it("every /dev page is a 404 outside development", () => {
		vi.stubEnv("DEV", false);
		const beforeLoad = DevLayout.options.beforeLoad as () => void;
		let thrown: unknown;
		try {
			beforeLoad();
		} catch (error) {
			thrown = error;
		}
		expect(isNotFound(thrown)).toBe(true);
	});

	it("is open in development", () => {
		const beforeLoad = DevLayout.options.beforeLoad as () => void;
		expect(() => beforeLoad()).not.toThrow();
	});

	it("dev-only server functions refuse with NOT_FOUND outside development", () => {
		expect(() => assertDev()).not.toThrow();
		vi.stubEnv("DEV", false);
		let thrown: unknown;
		try {
			assertDev();
		} catch (error) {
			thrown = error;
		}
		expect(isAppError(thrown) && thrown.code).toBe("NOT_FOUND");
	});
});
