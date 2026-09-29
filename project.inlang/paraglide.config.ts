import { defineConfig } from "@inlang/paraglide-js";

/**
 * Paraglide compiler options, read by both the Vite plugin and the
 * `paraglide-js compile` CLI (used by `pnpm typecheck` on a fresh clone).
 *
 * URL strategy: English (base locale) is unprefixed, Nepali lives under /ne.
 * Paraglide matches `localized` entries in order, so the prefixed pattern comes first.
 * See docs/decisions.md for why cookie/Accept-Language are not page strategies.
 *
 * Server function RPCs (/_serverFn/...) carry no locale prefix, so they read the
 * page locale from a header set by src/lib/i18n/locale-middleware.ts instead.
 */
export default defineConfig({
	outdir: "./src/paraglide",
	outputStructure: "message-modules",
	emitTsDeclarations: true,
	strategy: ["url", "baseLocale"],
	routeStrategies: [{ match: "/_serverFn/:path(.*)?", strategy: ["custom-header", "baseLocale"] }],
	urlPatterns: [
		{
			pattern: "/:path(.*)?",
			localized: [
				["ne", "/ne/:path(.*)?"],
				["en", "/:path(.*)?"],
			],
		},
	],
});
