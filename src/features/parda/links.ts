import { linkOptions } from "@tanstack/react-router";
import { PARDA_HUBS, type PardaHub, typeOfMedia } from "./search";

/**
 * Every link into Parda (PLAN 12.5, "Paths"): pages link through these, so moving the
 * product is a move of `src/routes/_parda/app/parda` and this file. Links arrive with
 * their routes (PLAN 12.3).
 */
export const pardaLinks = {
	home: () => linkOptions({ to: "/app/parda" }),
	hub: (hub: PardaHub) => linkOptions({ to: "/app/parda/$hub", params: { hub } }),
	/** A title's page, by TMDB's media type and id. Task 63 adds the slug. */
	title: (media: "movie" | "tv", id: number) =>
		linkOptions({ to: "/app/parda/$type/$id", params: { type: typeOfMedia(media), id: String(id) } }),
	about: (hash?: string) => linkOptions({ to: "/app/parda/about", ...(hash ? { hash } : {}) }),
	signIn: (redirect?: string) => linkOptions({ to: "/app/parda/sign-in", search: { redirect } }),
	signUp: (redirect?: string) => linkOptions({ to: "/app/parda/sign-up", search: { redirect } }),
};

/** De-localized paths for redirects, `?redirect=` targets and the sitemap. */
export const PARDA_PATHS = {
	home: "/app/parda",
	about: "/app/parda/about",
	hub: (hub: PardaHub) => `/app/parda/${hub}`,
} as const;

/** Parda's indexable pages without parameters (PLAN 12.5, "SEO"); titles join them with Task 63. */
export const PARDA_SITEMAP: ReadonlyArray<string> = [
	PARDA_PATHS.home,
	...PARDA_HUBS.map(PARDA_PATHS.hub),
	PARDA_PATHS.about,
];
