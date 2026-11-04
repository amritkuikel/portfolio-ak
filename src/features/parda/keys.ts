import type { Locale } from "@/paraglide/runtime";
import type { PardaPage, PardaType } from "./search";

/** Parda's query keys: the catalogue's answers depend on the language (TMDB's text, the Nepali fill-in). */
export const pardaKeys = {
	all: ["parda"] as const,
	catalog: (locale: Locale) => [...pardaKeys.all, "catalog", locale] as const,
	page: (locale: Locale, page: PardaPage) => [...pardaKeys.catalog(locale), "page", page] as const,
	rail: (locale: Locale, page: PardaPage, rail: string) => [...pardaKeys.page(locale, page), "rail", rail] as const,
	title: (locale: Locale, type: PardaType, id: number) => [...pardaKeys.catalog(locale), "title", type, id] as const,
};
