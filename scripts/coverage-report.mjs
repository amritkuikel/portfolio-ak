// Per-area coverage report (docs/PLAN.md, Phase 11b). Reads Vitest's
// json-summary output and prints line / branch / function coverage for each
// area of the codebase, plus the overall total.
//
//   pnpm test:coverage          (runs the tests, then this script)
//   node scripts/coverage-report.mjs [coverage/coverage-summary.json]
import { readFileSync } from "node:fs";
import path from "node:path";

const summaryPath = process.argv[2] ?? "coverage/coverage-summary.json";

/** Areas in the order of the plan. A file counts toward every area whose pattern it matches. */
const AREAS = [
	{
		name: "Schemas & validation",
		patterns: [
			/^src\/lib\/validation\.ts$/,
			/^src\/features\/[^/]+\/(schema|constants|validation)\.ts$/,
			/^src\/lib\/(date-only|fn-input|redirect)\.ts$/,
		],
	},
	{ name: "Form fields", patterns: [/^src\/components\/forms\//] },
	{
		name: "Server functions",
		patterns: [
			/^src\/functions\//,
			/^src\/server\/test-crud\//,
			/^src\/server\/rich-text\//,
			/^src\/server\/analytics\//,
		],
	},
	{ name: "Guards", patterns: [/^src\/middleware\//, /^src\/lib\/(errors|http-status)\.ts$/, /^src\/server\/http\//] },
	{ name: "Email", patterns: [/^src\/server\/email\//] },
	{ name: "i18n", patterns: [/^src\/lib\/i18n\//, /^src\/lib\/intl(-ne)?\.ts$/, /^src\/lib\/seo\.ts$/] },
	{ name: "Env", patterns: [/^src\/server\/env\.ts$/, /^src\/lib\/(client-env|client-env\.schema|env\.shared)\.ts$/] },
];

const raw = JSON.parse(readFileSync(summaryPath, "utf8"));
const root = process.cwd();
const files = Object.entries(raw)
	.filter(([file]) => file !== "total")
	.map(([file, data]) => [path.relative(root, file).split(path.sep).join("/"), data]);

const emptyTotals = () => ({ lines: [0, 0], branches: [0, 0], functions: [0, 0] });
const add = (totals, data) => {
	for (const key of Object.keys(totals)) {
		totals[key][0] += data[key].covered;
		totals[key][1] += data[key].total;
	}
};
const pct = ([covered, total]) => (total === 0 ? "–" : `${((covered / total) * 100).toFixed(1)}%`);

const rows = AREAS.map((area) => {
	const totals = emptyTotals();
	let count = 0;
	for (const [file, data] of files) {
		if (area.patterns.some((pattern) => pattern.test(file))) {
			add(totals, data);
			count += 1;
		}
	}
	return [area.name, count, totals];
});
const overall = emptyTotals();
for (const [, data] of files) add(overall, data);
rows.push(["Overall (all measured files)", files.length, overall]);

const header = ["Area", "Files", "Lines", "Branches", "Functions"];
const table = [
	header,
	...rows.map(([name, count, t]) => [name, String(count), pct(t.lines), pct(t.branches), pct(t.functions)]),
];
const widths = header.map((_, column) => Math.max(...table.map((row) => row[column].length)));
const line = (row) =>
	`| ${row.map((cell, column) => (column === 0 ? cell.padEnd(widths[column]) : cell.padStart(widths[column]))).join(" | ")} |`;
console.log("\nCoverage by area\n");
console.log(line(table[0]));
console.log(
	`|${widths.map((width, column) => (column === 0 ? `:${"-".repeat(width + 1)}` : `${"-".repeat(width + 1)}:`)).join("|")}|`,
);
for (const row of table.slice(1)) console.log(line(row));
console.log(
	"\nNotes: src/functions/* are thin createServerFn wrappers that only execute inside the TanStack Start\n" +
		"runtime, so unit tests cannot run them; their logic lives in src/server/** (tested) and their auth\n" +
		"middleware is asserted by tests/server/test-crud-functions.test.ts. Route pages and UI composition are\n" +
		"exercised by `pnpm test:storybook` (in a real browser) rather than by this unit run.\n",
);
