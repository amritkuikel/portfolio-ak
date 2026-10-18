/** GET /api/health for uptime monitors, and the request id every response carries. */
import { expect, test } from "../support/fixtures.ts";

test("the health endpoint answers 200 JSON with the database latency, never cached", async ({ request }) => {
	const response = await request.get("/api/health");
	expect(response.status()).toBe(200);
	expect(response.headers()["content-type"]).toMatch(/^application\/json/);
	expect(response.headers()["cache-control"]).toBe("no-store");
	const body = await response.json();
	expect(body).toMatchObject({ status: "ok", checks: { database: { status: "ok" } } });
	expect(typeof body.checks.database.latencyMs).toBe("number");
	expect((await request.head("/api/health")).status()).toBe(200);
});

test("every response has its own request id", async ({ request }) => {
	const ids = await Promise.all(
		["/", "/api/health", "/no-such-page"].map(async (path) => (await request.get(path)).headers()["x-request-id"]),
	);
	for (const id of ids) expect(id).toMatch(/^[0-9a-f-]{36}$/);
	expect(new Set(ids).size).toBe(ids.length);
});
