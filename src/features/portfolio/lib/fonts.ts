/**
 * Preloads for the portfolio's faces (same approach as src/lib/fonts.ts).
 *
 * Anek renders the giant headlines and the body on first paint (and, on
 * Nepali pages, Anek Devanagari), so those files are preloaded by the
 * /portfolio layout only; the rest of the app never fetches them. The `?url`
 * imports resolve to the same hashed files portfolio.css references.
 * Production only: Vite's dev stylesheets make the browser fetch fonts twice
 * (decision 0026).
 */
import anekDevanagari from "@fontsource-variable/anek-devanagari/files/anek-devanagari-devanagari-wdth-normal.woff2?url";
import anekLatin from "@fontsource-variable/anek-latin/files/anek-latin-latin-wdth-normal.woff2?url";
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
	return locale === "ne" ? [preload(anekLatin), preload(anekDevanagari)] : [preload(anekLatin)];
};
