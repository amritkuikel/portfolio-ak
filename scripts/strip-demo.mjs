/**
 * pnpm strip-demo [--no-build]
 *
 * Turns the template into a clean starting point (docs/guides/new-project.md):
 * removes the editorial portfolio (/portfolio), the /stack page and the home
 * page's Intl showcase, with their routes, data, styles, fonts, messages,
 * sitemap entries, tests and docs. Test CRUD and /dev/examples stay as the
 * references to copy. Run it once, on a fresh clone; it deletes itself.
 *
 * - Whole files and folders: DEMO_PATHS below.
 * - Parts of shared files: the lines between a `demo:start` and a `demo:end`
 *   marker (in any comment style: `//`, `/* *\/`, `{/* *\/}`, `<!-- -->`), and
 *   single lines ending in `// @demo` (for imports: Biome keeps a trailing
 *   comment on its line when it sorts them, but moves a comment line above one)
 *   or holding `<!-- @demo -->` (Markdown, e.g. a table row).
 * - Messages: every key no longer used in src/ or .storybook/ (the same rule
 *   as tests/i18n/message-usage.test.ts), plus a neutral site description.
 *
 * Then it formats what it touched, compiles the messages and runs a build,
 * which regenerates src/routeTree.gen.ts (skip with --no-build).
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const build = !process.argv.includes("--no-build");
const at = (file) => path.join(root, file);
const fail = (message) => {
	console.error(`strip-demo: ${message}`);
	process.exit(1);
};

if (!existsSync(at("src/routes/portfolio"))) fail("the demo is already gone (no src/routes/portfolio)");

const DEMO_PATHS = [
	// The editorial portfolio
	"src/routes/portfolio",
	"src/features/portfolio",
	"src/styles/portfolio.css",
	"tests/components/portfolio",
	"tests/unit/portfolio-data.test.ts",
	"tests/unit/portfolio-lib.test.ts",
	"tests/unit/portfolio-source.test.ts",
	"docs/guides/portfolio.md",
	// /stack
	"src/routes/_public/stack.tsx",
	"src/features/stack",
	"src/functions/stack.ts",
	"src/server/stack",
	"tests/unit/stack.test.ts",
	// This script (it runs once)
	"scripts/strip-demo.mjs",
];
const DEMO_PACKAGES = [
	"@fontsource-variable/anek-devanagari",
	"@fontsource-variable/anek-latin",
	"@fontsource-variable/jetbrains-mono",
];
/** A neutral description in place of the portfolio's (en, ne). */
const NEUTRAL = {
	site_description: ["A fast, server-rendered app in English and Nepali.", "अङ्ग्रेजी र नेपालीमा छिटो, सर्भरमा रेन्डर हुने एप।"],
	home_intro: [
		"A fast, server-rendered app, fully available in English and Nepali.",
		"अङ्ग्रेजी र नेपाली दुवैमा पूर्ण रूपमा उपलब्ध, छिटो र सर्भरमा रेन्डर हुने एप।",
	],
};

const changed = new Set();

// 1. Files and folders
for (const file of DEMO_PATHS) {
	if (existsSync(at(file))) rmSync(at(file), { recursive: true, force: true });
}

// 2. Marked blocks in every tracked text file
const tracked = spawnSync("git", ["ls-files", "-z"], { cwd: root, encoding: "utf8" });
if (tracked.status !== 0) fail("git ls-files failed (run it in a git checkout)");
const DEMO_LINE = /\/\/ @demo$|<!-- @demo -->/m;
const TEXT = /\.(?:[cm]?[jt]sx?|css|md|json|ya?ml|html)$/;
for (const file of tracked.stdout.split("\0")) {
	if (!file || !TEXT.test(file) || !existsSync(at(file)) || statSync(at(file)).isDirectory()) continue;
	const content = readFileSync(at(file), "utf8");
	if (!content.includes("demo:start") && !DEMO_LINE.test(content)) continue;
	const kept = [];
	let depth = 0;
	for (const line of content.split("\n")) {
		if (/demo:start\b/.test(line)) {
			depth += 1;
			continue;
		}
		if (/demo:end\b/.test(line)) {
			if (depth === 0) fail(`${file}: demo:end without demo:start`);
			depth -= 1;
			continue;
		}
		if (depth === 0 && !DEMO_LINE.test(line)) kept.push(line);
	}
	if (depth !== 0) fail(`${file}: demo:start without demo:end`);
	writeFileSync(at(file), kept.join("\n"));
	changed.add(file);
}

// 3. Messages: neutral copy, then drop keys nothing uses any more
const sourceText = () => {
	let text = "";
	const walk = (dir) => {
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			const full = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				if (entry.name !== "paraglide") walk(full);
			} else if (/\.(ts|tsx)$/.test(entry.name)) text += readFileSync(full, "utf8");
		}
	};
	walk(at("src"));
	walk(at(".storybook"));
	return text;
};
const code = sourceText();
const removed = new Set();
for (const [index, locale] of ["en", "ne"].entries()) {
	const file = `messages/${locale}.json`;
	const messages = JSON.parse(readFileSync(at(file), "utf8"));
	for (const [key, values] of Object.entries(NEUTRAL)) if (key in messages) messages[key] = values[index];
	for (const key of Object.keys(messages)) {
		if (key === "$schema") continue;
		if (!new RegExp(`\\bm\\.${key}\\b`).test(code)) {
			delete messages[key];
			removed.add(key);
		}
	}
	writeFileSync(at(file), `${JSON.stringify(messages, null, "\t")}\n`);
	changed.add(file);
}

// 4. Commands: packages, formatting, messages, route tree
const run = (label, command, args, env = {}) => {
	console.log(`strip-demo: ${label}`);
	const result = spawnSync(command, args, {
		cwd: root,
		stdio: "inherit",
		// pnpm is a .cmd shim on Windows; node itself must not go through the shell (spaces in its path).
		shell: process.platform === "win32" && command === "pnpm",
		env: { ...process.env, ...env },
	});
	if (result.status !== 0) fail(`${label} failed`);
};
const node = process.execPath;

const pkg = JSON.parse(readFileSync(at("package.json"), "utf8"));
delete pkg.scripts["strip-demo"];
writeFileSync(at("package.json"), `${JSON.stringify(pkg, null, "\t")}\n`);
run("removing the demo fonts", "pnpm", ["remove", ...DEMO_PACKAGES]);

const existing = [...changed].filter((file) => existsSync(at(file)));
run("formatting", node, [
	"node_modules/@biomejs/biome/bin/biome",
	"check",
	"--write",
	"--no-errors-on-unmatched",
	...existing,
]);
run("compiling messages", node, [
	"node_modules/@inlang/paraglide-js/bin/run.js",
	"compile",
	"--project",
	"./project.inlang",
	"--silent",
]);
if (build) {
	run("building (regenerates the route tree)", node, ["node_modules/vite/bin/vite.js", "build"], {
		VITE_APP_TITLE: process.env.VITE_APP_TITLE || "App",
		VITE_SITE_URL: process.env.VITE_SITE_URL || "http://localhost:3000",
	});
}

console.log(`
strip-demo: removed the portfolio, /stack and the Intl showcase (${removed.size} messages, ${changed.size} files edited).
  Next: docs/guides/new-project.md (rename, env, first admin), then pnpm new:feature <name>.
`);
