import { createFileRoute } from "@tanstack/react-router";
import { PARDA_BRAND, pardaTitle } from "@/features/parda/brand";
import { pardaFontPreloads } from "@/features/parda/lib/fonts";
import { PardaNotFound, PardaSection } from "@/features/parda/shell/section";
import { NOINDEX } from "@/lib/seo";
import { getLocale } from "@/paraglide/runtime";

/**
 * Parda at /app/parda (docs/guides/parda.md, decisions 0228 and 0232): a product of its
 * own. Its brand ("Masking" on <html>, dark by default, its icons and manifest), its
 * title suffix, its fonts, and noindex for every page that doesn't say otherwise
 * with seo(). Every page is in its frame; a 404 brings the frame itself.
 */
export const Route = createFileRoute("/_parda")({
	staticData: { brand: PARDA_BRAND },
	head: () => ({ meta: [{ title: pardaTitle() }, NOINDEX], links: pardaFontPreloads(getLocale()) }),
	notFoundComponent: PardaNotFound,
	component: PardaSection,
});
