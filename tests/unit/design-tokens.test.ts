import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ACCENTS } from "@/lib/stores/preferences";

/**
 * Graphite's colour contrast (src/styles/app.css, decision 0164): every text pair is
 * WCAG AA (4.5:1) in every accent × theme. The browser review only ever sees the
 * default preset, so this is what keeps the other nine combinations readable.
 *
 * The custom properties are read per rule from app.css, applied in source order the
 * way <html class="dark" data-accent="…"> would match them, var() references are
 * resolved, and oklch() is converted to sRGB (clipped to the gamut).
 */

type Theme = "light" | "dark";
type Oklch = { l: number; c: number; h: number; alpha: number };

const css = readFileSync("src/styles/app.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

/** Top-level rules (`selector { --name: value; }`), in order; at-rules like @theme are skipped. */
const rules = [...css.matchAll(/(^|\n)([^@{}\n][^{}]*)\{([^{}]*)\}/g)].map((match) => ({
	selectors: (match[2] ?? "").split(",").map((selector) => selector.trim()),
	declarations: Object.fromEntries(
		[...(match[3] ?? "").matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((d) => [d[1], (d[2] ?? "").trim()]),
	),
}));

/** Does `selector` match <html> with this theme and accent? Descendant selectors never do. */
const matchesHtml = (selector: string, theme: Theme, accent: string) => {
	if (selector.includes(" ")) return false;
	const parts = selector.match(/:root|html|\.[\w-]+|\[[^\]]+\]/g) ?? [];
	if (parts.join("") !== selector.replace(/\s/g, "")) return false;
	return parts.every((part) => {
		if (part === ":root" || part === "html") return true;
		if (part === ".dark") return theme === "dark";
		const attribute = part.match(/^\[data-accent="(\w+)"\]$/);
		return attribute ? attribute[1] === accent : false;
	});
};

const tokensFor = (theme: Theme, accent: string) => {
	const tokens: Record<string, string> = {};
	for (const rule of rules) {
		if (rule.selectors.some((selector) => matchesHtml(selector, theme, accent))) {
			Object.assign(tokens, rule.declarations);
		}
	}
	return tokens;
};

const resolve = (tokens: Record<string, string>, name: string, depth = 0): string => {
	const value = tokens[name];
	if (value === undefined) throw new Error(`${name} is not defined`);
	const reference = value.match(/^var\((--[\w-]+)\)$/);
	if (!reference?.[1]) return value;
	if (depth > 10) throw new Error(`${name}: var() cycle`);
	return resolve(tokens, reference[1], depth + 1);
};

const parseOklch = (value: string): Oklch => {
	const match = value.match(/^oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+)(%?))?\)$/);
	if (!match) throw new Error(`Not an oklch() colour: ${value}`);
	const alpha = match[4] === undefined ? 1 : Number(match[4]) / (match[5] ? 100 : 1);
	return { l: Number(match[1]), c: Number(match[2]), h: Number(match[3]), alpha };
};

/** OKLCH -> linear sRGB (Björn Ottosson's OKLab matrices), clipped to [0, 1]. */
const linearRgb = ({ l: L, c, h }: Oklch) => {
	const a = c * Math.cos((h * Math.PI) / 180);
	const b = c * Math.sin((h * Math.PI) / 180);
	const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
	const clip = (v: number) => Math.min(1, Math.max(0, v));
	return [
		clip(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
		clip(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
		clip(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
	] as const;
};

const luminance = (colour: Oklch) => {
	const [r, g, b] = linearRgb(colour);
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: Oklch, b: Oklch) => {
	const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
	return (light + 0.05) / (dark + 0.05);
};

const SURFACES = ["--background", "--surface-1", "--surface-2", "--card", "--popover", "--sidebar"];

/** [text, background] pairs that must reach 4.5:1. */
const PAIRS: ReadonlyArray<readonly [string, string]> = [
	...[...SURFACES, "--muted", "--secondary", "--accent", "--accent-subtle", "--sidebar-accent"].map(
		(surface) => ["--foreground", surface] as const,
	),
	...[...SURFACES, "--muted", "--accent"].map((surface) => ["--muted-foreground", surface] as const),
	["--card-foreground", "--card"],
	["--popover-foreground", "--popover"],
	["--secondary-foreground", "--secondary"],
	["--accent-foreground", "--accent"],
	["--primary-foreground", "--primary"],
	...[...SURFACES, "--accent-subtle"].map((surface) => ["--primary", surface] as const),
	["--sidebar-foreground", "--sidebar"],
	["--sidebar-accent-foreground", "--sidebar-accent"],
	["--sidebar-primary-foreground", "--sidebar-primary"],
	["--destructive-foreground", "--destructive"],
	...["danger", "success", "warning", "info"].flatMap((status) => [
		[`--${status}-foreground`, `--${status}`] as const,
		[`--${status}`, `--${status}-subtle`] as const,
		["--foreground", `--${status}-subtle`] as const,
		...SURFACES.map((surface) => [`--${status}`, surface] as const),
	]),
];

describe("Graphite tokens", () => {
	it("parses the theme and every accent preset", () => {
		for (const accent of ACCENTS) {
			for (const theme of ["light", "dark"] as const) {
				expect(parseOklch(resolve(tokensFor(theme, accent), "--primary")).alpha).toBe(1);
			}
		}
		// The presets really differ from each other, in both themes.
		for (const theme of ["light", "dark"] as const) {
			const primaries = new Set(ACCENTS.map((accent) => resolve(tokensFor(theme, accent), "--primary")));
			expect(primaries.size).toBe(ACCENTS.length);
		}
	});

	it("reaches 4.5:1 for every text pair in every accent × theme", () => {
		const failures: string[] = [];
		for (const accent of ACCENTS) {
			for (const theme of ["light", "dark"] as const) {
				const tokens = tokensFor(theme, accent);
				for (const [text, background] of PAIRS) {
					const ratio = contrast(parseOklch(resolve(tokens, text)), parseOklch(resolve(tokens, background)));
					if (ratio < 4.5) failures.push(`${accent}/${theme}: ${text} on ${background} is ${ratio.toFixed(2)}:1`);
				}
			}
		}
		expect(failures).toEqual([]);
	});

	it("knows its own maths: black on white is 21:1", () => {
		expect(contrast(parseOklch("oklch(0 0 0)"), parseOklch("oklch(1 0 0)"))).toBeCloseTo(21, 1);
	});
});
