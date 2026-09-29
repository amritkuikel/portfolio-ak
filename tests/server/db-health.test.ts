import { describe, expect, it, vi } from "vitest";
import { checkDatabaseHealth } from "@/server/db/health";

const clock = (...times: number[]) => {
	const queue = [...times];
	return () => queue.shift() ?? 0;
};

describe("checkDatabaseHealth", () => {
	it("reports ok with the measured latency", async () => {
		const ping = vi.fn().mockResolvedValue([{ "?column?": 1 }]);
		const result = await checkDatabaseHealth(ping, clock(100, 142.4));
		expect(ping).toHaveBeenCalledOnce();
		expect(result).toMatchObject({ status: "ok", latencyMs: 42 });
		expect(Number.isNaN(Date.parse(result.checkedAt))).toBe(false);
	});

	it("reports error without leaking driver details, and logs the cause on the server", async () => {
		const log = vi.spyOn(console, "error").mockImplementation(() => {});
		const driverError = new Error("connect ECONNREFUSED 10.0.0.5:5432 password=secret");
		const ping = vi.fn().mockRejectedValue(new Error("Failed query: select 1", { cause: driverError }));

		const result = await checkDatabaseHealth(ping, clock(0, 5));

		expect(result).toEqual({ status: "error", latencyMs: 5, checkedAt: expect.any(String) });
		expect(JSON.stringify(result)).not.toMatch(/ECONNREFUSED|secret|10\.0\.0\.5/);
		expect(log).toHaveBeenCalledWith("[db] health check failed:", "Failed query: select 1", driverError.message);
	});
});
