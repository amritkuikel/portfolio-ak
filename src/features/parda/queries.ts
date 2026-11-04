import { queryOptions } from "@tanstack/react-query";
import { getPardaHub, getPardaRail, getPardaTitle } from "@/functions/parda/catalog";
import type { Locale } from "@/paraglide/runtime";
import { pardaKeys } from "./keys";
import type { PardaPage, PardaType } from "./search";

/**
 * Catalogue reads. Route loaders import this module with `await import()` (0194), so
 * the server-function stubs stay out of every page's JavaScript.
 */

/** TMDB's lists change hourly at most (the server caches them for an hour), so a tab never needs them fresher. */
const CATALOG_STALE = 10 * 60_000;

export const pardaPageQueryOptions = (locale: Locale, page: PardaPage) =>
	queryOptions({
		queryKey: pardaKeys.page(locale, page),
		queryFn: () => getPardaHub({ data: { page, locale } }),
		staleTime: CATALOG_STALE,
	});

export const pardaRailQueryOptions = (locale: Locale, page: PardaPage, rail: string) =>
	queryOptions({
		queryKey: pardaKeys.rail(locale, page, rail),
		queryFn: () => getPardaRail({ data: { page, rail, locale } }),
		staleTime: CATALOG_STALE,
	});

export const pardaTitleQueryOptions = (locale: Locale, type: PardaType, id: number) =>
	queryOptions({
		queryKey: pardaKeys.title(locale, type, id),
		queryFn: () => getPardaTitle({ data: { type, id, locale } }),
		staleTime: CATALOG_STALE,
	});
