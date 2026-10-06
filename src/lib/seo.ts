import { baseLocale, getLocale, type Locale, locales, localizeHref } from "@/paraglide/runtime";
import { clientEnv } from "./client-env";

/** Title template: "Page · Site". The site name comes from VITE_APP_TITLE. */
export const pageTitle = (page?: string): string =>
	page ? `${page} · ${clientEnv.VITE_APP_TITLE}` : clientEnv.VITE_APP_TITLE;

/** Absolute URL on the public origin (VITE_SITE_URL). */
export const absoluteUrl = (path: string): string => new URL(path, clientEnv.VITE_SITE_URL).href;

/** The page's URL in a given language ("/test-crud" -> "/ne/test-crud" for ne). */
export const localizedUrl = (path: string, locale: Locale): string => absoluteUrl(localizeHref(path, { locale }));

const OG_LOCALES: Readonly<Record<Locale, string>> = { en: "en_US", ne: "ne_NP" };

export type SeoInput = {
	/** Page title without the site name (the template adds it). */
	title: string;
	description: string;
	/** De-localized path with any query that identifies the page, e.g. "/test-crud?page=2". */
	path: string;
	/** Absolute URL or site path of a preview image. */
	image?: string | null | undefined;
	type?: "website" | "article";
	/** For pages that shouldn't be indexed (e.g. search results). */
	noindex?: boolean;
};

/**
 * Head tags for a public page: title, description, canonical, hreflang
 * alternates for every locale plus x-default, Open Graph and Twitter cards.
 * Spread into a route's `head`: `head: () => seo({...})`.
 */
export function seo({ title, description, path, image, type = "website", noindex = false }: SeoInput) {
	const locale = getLocale();
	const canonical = localizedUrl(path, locale);
	const fullTitle = pageTitle(title);
	const imageUrl = image ? absoluteUrl(image) : undefined;
	return {
		meta: [
			{ title: fullTitle },
			{ name: "description", content: description },
			...(noindex ? [{ name: "robots", content: "noindex, follow" }] : []),
			{ property: "og:type", content: type },
			{ property: "og:site_name", content: clientEnv.VITE_APP_TITLE },
			{ property: "og:title", content: title },
			{ property: "og:description", content: description },
			{ property: "og:url", content: canonical },
			{ property: "og:locale", content: OG_LOCALES[locale] },
			...locales
				.filter((other) => other !== locale)
				.map((other) => ({ property: "og:locale:alternate", content: OG_LOCALES[other] })),
			...(imageUrl ? [{ property: "og:image", content: imageUrl }] : []),
			{ name: "twitter:card", content: imageUrl ? "summary_large_image" : "summary" },
			{ name: "twitter:title", content: title },
			{ name: "twitter:description", content: description },
		],
		links: [
			{ rel: "canonical", href: canonical },
			...locales.map((other) => ({ rel: "alternate", hrefLang: other, href: localizedUrl(path, other) })),
			{ rel: "alternate", hrefLang: "x-default", href: localizedUrl(path, baseLocale) },
		],
	};
}
