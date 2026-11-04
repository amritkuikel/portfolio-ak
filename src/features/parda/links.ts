import { linkOptions } from "@tanstack/react-router";
import { PARDA_HUBS, type PardaHub, type PardaPage, typeOfMedia } from "./search";
import { titleParam } from "./slug";

/**
 * Every link into Parda (PLAN 12.5, "Paths"): pages link through these, so moving the
 * product is a move of `src/routes/_parda/app/parda` and this file. Links arrive with
 * their routes (PLAN 12.3).
 */

type Media = "movie" | "tv";

export const pardaLinks = {
	home: () => linkOptions({ to: "/app/parda" }),
	hub: (hub: PardaHub) => linkOptions({ to: "/app/parda/$hub", params: { hub } }),
	/** A title's page, by TMDB's media type and id, with its slug (decision 0235). */
	title: (media: Media, id: number, slug: string) =>
		linkOptions({ to: "/app/parda/$type/$id", params: { type: typeOfMedia(media), id: titleParam(id, slug) } }),
	credits: (media: Media, id: number, slug: string) =>
		linkOptions({
			to: "/app/parda/$type/$id/credits",
			params: { type: typeOfMedia(media), id: titleParam(id, slug) },
		}),
	person: (id: number) => linkOptions({ to: "/app/parda/person/$id", params: { id: String(id) } }),
	collection: (id: number) => linkOptions({ to: "/app/parda/collection/$id", params: { id: String(id) } }),
	/** A random title from the page's good lists: a redirect, so it works without JavaScript. */
	surprise: (from: PardaPage) => linkOptions({ to: "/app/parda/surprise", search: { from } }),
	about: (hash?: string) => linkOptions({ to: "/app/parda/about", ...(hash ? { hash } : {}) }),
	signIn: (redirect?: string) => linkOptions({ to: "/app/parda/sign-in", search: { redirect } }),
	signUp: (redirect?: string) => linkOptions({ to: "/app/parda/sign-up", search: { redirect } }),
};

/** De-localized paths for redirects, `?redirect=` targets, heads and the sitemap. */
export const PARDA_PATHS = {
	home: "/app/parda",
	about: "/app/parda/about",
	hub: (hub: PardaHub) => `/app/parda/${hub}`,
	title: (media: Media, id: number, slug: string) => `/app/parda/${typeOfMedia(media)}/${titleParam(id, slug)}`,
	credits: (media: Media, id: number, slug: string) => `${PARDA_PATHS.title(media, id, slug)}/credits`,
	person: (id: number) => `/app/parda/person/${id}`,
	collection: (id: number) => `/app/parda/collection/${id}`,
} as const;

/** Parda's indexable pages without parameters (PLAN 12.5, "SEO"); titles come from `pd_title` (sitemap.ts). */
export const PARDA_SITEMAP: ReadonlyArray<string> = [
	PARDA_PATHS.home,
	...PARDA_HUBS.map(PARDA_PATHS.hub),
	PARDA_PATHS.about,
];
