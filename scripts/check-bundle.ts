/**
 * Bundle budget for a production build (`pnpm build` first). Fails when:
 *  - the JavaScript every page preloads (the root route's preloads) is over ENTRY_BUDGET_KB gzip
 *    (the TanStack DB chunk is counted on its own line, see SEPARATE_CHUNKS);
 *  - any route adds more than ROUTE_BUDGET_KB gzip on top of the root;
 *  - a font preloaded by a `fonts.ts` module is over FONT_BUDGET_KB.
 *
 *   node scripts/check-bundle.ts            check and print the table
 *   node scripts/check-bundle.ts --report   print only, never fail
 *
 * Decision 0151. The numbers it prints are the ones recorded there.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";

// Lowered to 200 once the site header leaves the root layout (Task 35).
const ENTRY_BUDGET_KB = 240;
const ROUTE_BUDGET_KB = 250;
const FONT_BUDGET_KB = 150;
/** Chunks reported apart from the entry total, each with its own budget (kB gzip). */
const SEPARATE_CHUNKS: ReadonlyArray<{ name: string; test: RegExp; budgetKb: number }> = [
	{ name: "tanstack-db", test: /\/tanstack-db-[\w-]+\.js$/, budgetKb: 105 },
];

/**
 * Preloaded fonts allowed over budget for now, with the reason. An entry that no longer
 * matches a preloaded font fails the check, so the exemption is removed with the font.
 */
const FONT_EXEMPTIONS: ReadonlyMap<string, string> = new Map<string, string>([]);

const ROOT = resolve(import.meta.dirname, "..");
const OUTPUT = join(ROOT, ".output");
const reportOnly = process.argv.includes("--report");

type Manifest = { routes: Record<string, { preloads?: string[] }> };

const loadManifest = async (): Promise<Manifest> => {
	const dir = join(OUTPUT, "server");
	const file = readdirSync(dir).find((name) => name.startsWith("_tanstack-start-manifest") && name.endsWith(".mjs"));
	if (!file) throw new Error("No build found: run `pnpm build` first (.output/server has no Start manifest).");
	const module = (await import(pathToFileURL(join(dir, file)).href)) as { tsrStartManifest: () => Manifest };
	return module.tsrStartManifest();
};

const gzipCache = new Map<string, number>();
const gzipKb = (asset: string): number => {
	const cached = gzipCache.get(asset);
	if (cached !== undefined) return cached;
	const size = gzipSync(readFileSync(join(OUTPUT, "public", asset))).length / 1024;
	gzipCache.set(asset, size);
	return size;
};

const sum = (assets: Iterable<string>) => [...assets].reduce((total, asset) => total + gzipKb(asset), 0);
const kb = (value: number) => `${value.toFixed(1)} kB`;

/** Fonts imported with `?url` by a fonts.ts module: the files the app preloads. */
const preloadedFonts = (): Array<{ file: string; kb: number }> => {
	const sources: string[] = [];
	const walk = (dir: string) => {
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			const path = join(dir, entry.name);
			if (entry.isDirectory()) walk(path);
			else if (entry.name === "fonts.ts") sources.push(path);
		}
	};
	walk(join(ROOT, "src"));
	const fonts: Array<{ file: string; kb: number }> = [];
	for (const source of sources) {
		for (const [, specifier] of readFileSync(source, "utf8").matchAll(/from "([^"]+\.woff2)\?url"/g)) {
			const file = join(ROOT, "node_modules", specifier ?? "");
			fonts.push({ file: specifier ?? "", kb: statSync(file).size / 1024 });
		}
	}
	return fonts;
};

const manifest = await loadManifest();
const rootPreloads = new Set(manifest.routes.__root__?.preloads ?? []);
const failures: string[] = [];

const separate = SEPARATE_CHUNKS.map(({ name, test, budgetKb }) => {
	const assets = [...rootPreloads].filter((asset) => test.test(asset));
	for (const asset of assets) rootPreloads.delete(asset);
	return { name, size: sum(assets), budgetKb };
});

const entry = sum(rootPreloads);
console.log(`Entry JS (every page): ${kb(entry)} gzip in ${rootPreloads.size} files (budget ${ENTRY_BUDGET_KB} kB)`);
if (entry > ENTRY_BUDGET_KB) failures.push(`entry JS is ${kb(entry)}, over ${ENTRY_BUDGET_KB} kB`);
for (const { name, size, budgetKb } of separate) {
	console.log(`  + ${name}: ${kb(size)} gzip (budget ${budgetKb} kB)`);
	if (size > budgetKb) failures.push(`${name} is ${kb(size)}, over ${budgetKb} kB`);
}

const routes = Object.entries(manifest.routes)
	.filter(([id]) => id !== "__root__")
	.map(([id, route]) => ({ id, extra: sum((route.preloads ?? []).filter((asset) => !rootPreloads.has(asset))) }))
	.sort((a, b) => b.extra - a.extra);
console.log("\nHeaviest routes (JS added on top of the root):");
for (const { id, extra } of routes.slice(0, 8)) console.log(`  ${kb(extra).padStart(10)}  ${id}`);
for (const { id, extra } of routes) {
	if (extra > ROUTE_BUDGET_KB) failures.push(`route ${id} adds ${kb(extra)}, over ${ROUTE_BUDGET_KB} kB`);
}

console.log("\nPreloaded fonts:");
const fonts = preloadedFonts();
for (const { file, kb: size } of fonts) {
	const exemption = FONT_EXEMPTIONS.get(file);
	console.log(`  ${kb(size).padStart(10)}  ${file}${exemption ? `  (exempt: ${exemption})` : ""}`);
	if (size > FONT_BUDGET_KB && !exemption) {
		failures.push(`preloaded font ${file} is ${kb(size)}, over ${FONT_BUDGET_KB} kB`);
	}
}
for (const file of FONT_EXEMPTIONS.keys()) {
	if (!fonts.some((font) => font.file === file)) failures.push(`stale exemption: ${file} isn't preloaded any more`);
}

if (failures.length > 0) {
	console.error(`\nBundle budget exceeded:\n${failures.map((failure) => `  - ${failure}`).join("\n")}`);
	if (!reportOnly) process.exit(1);
}
