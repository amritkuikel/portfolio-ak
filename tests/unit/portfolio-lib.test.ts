import { describe, expect, it } from "vitest";
import { cn } from "@/features/portfolio/lib/cn";
import { formatMetric } from "@/features/portfolio/lib/format-metric";
import { isLocalized, resolveLocalized } from "@/features/portfolio/lib/localize";
import { readingMinutes } from "@/features/portfolio/lib/reading-time";
import { hashString, round, seededRandom } from "@/features/portfolio/lib/seeded-random";
import { weave } from "@/features/portfolio/lib/weave";

describe("resolveLocalized", () => {
	it("resolves { en, ne } pairs deeply, through arrays and objects", () => {
		const record = {
			slug: "momo",
			title: { en: "Dumplings", ne: "मःम" },
			tags: ["food"],
			steps: [{ text: { en: "Fold", ne: "बेर्नुहोस्" } }],
			edge: ["a", "b"] as [string, string],
		};
		expect(resolveLocalized(record, "ne")).toEqual({
			slug: "momo",
			title: "मःम",
			tags: ["food"],
			steps: [{ text: "बेर्नुहोस्" }],
			edge: ["a", "b"],
		});
		expect(resolveLocalized(record, "en").title).toBe("Dumplings");
	});

	it("only treats objects with exactly the locale keys as localized", () => {
		expect(isLocalized({ en: "a", ne: "b" })).toBe(true);
		expect(isLocalized({ en: "a" })).toBe(false);
		expect(isLocalized({ en: "a", ne: "b", de: "c" })).toBe(false);
		expect(isLocalized(["en", "ne"])).toBe(false);
		expect(isLocalized(null)).toBe(false);
	});
});

describe("formatMetric", () => {
	it("formats each kind of number in English", () => {
		expect(formatMetric({ value: 0.63, format: "percent" }, "en")).toBe("63%");
		expect(formatMetric({ value: 0.9998, format: "percent" }, "en")).toBe("99.98%");
		expect(formatMetric({ value: 1_200_000, format: "compact" }, "en")).toBe("1.2M");
		expect(formatMetric({ value: 3, format: "multiplier" }, "en")).toBe("3×");
		expect(formatMetric({ value: 10, format: "plus" }, "en")).toBe("10+");
		expect(formatMetric({ value: 48, format: "ms" }, "en")).toBe("48 ms");
		expect(formatMetric({ value: 1.1, format: "seconds" }, "en")).toBe("1.1 s");
		expect(formatMetric({ value: 1400, format: "number" }, "en")).toBe("1,400");
	});

	it("uses Devanagari digits in Nepali", () => {
		expect(formatMetric({ value: 0.63, format: "percent" }, "ne")).toMatch(/^६३/);
		expect(formatMetric({ value: 48, format: "ms" }, "ne")).toBe("४८ ms");
	});
});

describe("seededRandom", () => {
	it("is deterministic per seed (server and client draw the same art)", () => {
		const a = seededRandom("ledgerline");
		const b = seededRandom("ledgerline");
		const sequence = Array.from({ length: 5 }, () => a.next());
		expect(Array.from({ length: 5 }, () => b.next())).toEqual(sequence);
		expect(seededRandom("haat").next()).not.toBe(sequence[0]);
		expect(hashString("ledgerline")).toBe(hashString("ledgerline"));
	});

	it("keeps helpers in range", () => {
		const rand = seededRandom("range");
		for (let index = 0; index < 200; index++) {
			const value = rand.between(2, 5);
			expect(value).toBeGreaterThanOrEqual(2);
			expect(value).toBeLessThan(5);
			const int = rand.int(1, 3);
			expect([1, 2, 3]).toContain(int);
		}
		expect(round(1.2345)).toBe(1.2);
	});
});

describe("weave", () => {
	const size = { columns: 31, rows: 60 };

	it("weaves the same cloth from the same seed, and a different one from another", () => {
		expect(weave({ seed: "haat", ...size })).toEqual(weave({ seed: "haat", ...size }));
		expect(weave({ seed: "haat", ...size })).not.toEqual(weave({ seed: "khoj", ...size }));
	});

	it("keeps every run inside the cloth, merged and in whole cells", () => {
		const runs = weave({ seed: "bounds", ...size });
		expect(runs.length).toBeGreaterThan(0);
		for (const run of runs) {
			expect(Number.isInteger(run.x) && Number.isInteger(run.y) && Number.isInteger(run.width)).toBe(true);
			expect(run.x).toBeGreaterThanOrEqual(0);
			expect(run.width).toBeGreaterThan(0);
			expect(run.x + run.width).toBeLessThanOrEqual(size.columns);
			expect(run.y).toBeLessThan(size.rows);
		}
	});

	it("mirrors left to right on an odd width", () => {
		const runs = weave({ seed: "mirror", ...size });
		const cells = new Map<string, string>();
		for (const run of runs) {
			for (let x = run.x; x < run.x + run.width; x++) cells.set(`${x},${run.y}`, run.thread);
		}
		for (const [key, thread] of cells) {
			const [x, y] = key.split(",").map(Number) as [number, number];
			expect(cells.get(`${size.columns - 1 - x},${y}`)).toBe(thread);
		}
	});

	it("never weaves a full row of cotton (it would read as a hole)", () => {
		for (const seed of ["a", "b", "c", "d", "e", "f"]) {
			const fullRows = weave({ seed, ...size }).filter((run) => run.width === size.columns);
			expect(fullRows.every((run) => run.thread !== "cotton")).toBe(true);
		}
	});
});

describe("readingMinutes", () => {
	it("counts words across every block kind, at least one minute", () => {
		const words = (count: number) => Array.from({ length: count }, () => "word").join(" ");
		expect(readingMinutes([{ kind: "paragraph", text: "Short." }])).toBe(1);
		expect(
			readingMinutes([
				{ kind: "paragraph", text: words(300) },
				{ kind: "list", items: [words(100), words(40)] },
				{ kind: "code", language: "ts", code: "x" },
			]),
		).toBe(2);
	});
});

describe("portfolio cn", () => {
	it("keeps a custom font size and a custom colour together (tailwind-merge knows the scale)", () => {
		expect(cn("text-pf-h2", "text-pf-accent")).toBe("text-pf-h2 text-pf-accent");
		expect(cn("text-pf-h2", "text-pf-h3")).toBe("text-pf-h3");
		expect(cn("text-pf-stone", "text-current")).toBe("text-current");
	});
});
