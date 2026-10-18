/**
 * Preloads for the portfolio's display faces (same approach as src/lib/fonts.ts).
 *
 * The giant headlines render on first paint in Fraunces (and, on Nepali pages,
 * Noto Serif Devanagari), so those files are preloaded by the /portfolio layout
 * only; the rest of the app never fetches them. The `?url` imports resolve to
 * the same hashed files portfolio.css references. Production only: Vite's dev
 * stylesheets make the browser fetch fonts twice (decision 0026).
 */
import frauncesLatin from "@fontsource-variable/fraunces/files/fraunces-latin-opsz-normal.woff2?url";
import notoSerifDevanagari from "@fontsource-variable/noto-serif-devanagari/files/noto-serif-devanagari-devanagari-wght-normal.woff2?url";
import type { Locale } from "@/paraglide/runtime";

const preload = (href: string) =>
	({
		rel: "preload",
		href,
		as: "font",
		type: "font/woff2",
		crossOrigin: "anonymous",
	}) as const;

export const portfolioFontPreloads = (locale: Locale) => {
	if (import.meta.env.DEV) return [];
	return locale === "ne" ? [preload(frauncesLatin), preload(notoSerifDevanagari)] : [preload(frauncesLatin)];
};
