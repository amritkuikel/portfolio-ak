import { localizedUrl, seo } from "@/lib/seo";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { PARDA_NAME } from "../brand";
import type { PardaImage } from "../kit/image";
import { PARDA_PATHS } from "../links";
import type { PardaHub, PardaPage } from "../search";

/**
 * The home's and the hubs' heads (route options, so in every page's JavaScript: keep
 * this module small). Indexable, in the sitemap, with the first billboard picture
 * preloaded in the shape each width shows (PLAN Task 62).
 */

/** The first billboard picture: the poster on phones, the backdrop from `md` (the Billboard's own breakpoint). */
export type HeroPreload = { narrow: PardaImage | null; wide: PardaImage | null };

const HUB_TITLES: Readonly<Record<PardaHub, () => string>> = {
	movies: m.pd_hub_movies,
	series: m.pd_hub_series,
	anime: m.pd_hub_anime,
};

const DESCRIPTIONS: Readonly<Record<PardaPage, () => string>> = {
	home: m.pd_description,
	movies: m.pd_hub_movies_description,
	series: m.pd_hub_series_description,
	anime: m.pd_hub_anime_description,
};

export const hubTitle = (hub: PardaHub) => HUB_TITLES[hub]();

const pathOf = (page: PardaPage) => (page === "home" ? PARDA_PATHS.home : PARDA_PATHS.hub(page));

const preload = (image: PardaImage, media: string) => ({
	rel: "preload",
	as: "image",
	href: image.src,
	imageSrcSet: image.srcSet,
	imageSizes: "100vw",
	media,
	fetchPriority: "high" as const,
});

export function pardaPageHead(page: PardaPage, hero: HeroPreload | undefined) {
	const path = pathOf(page);
	const description = DESCRIPTIONS[page]();
	const title = page === "home" ? m.pd_home_title() : hubTitle(page);
	const home = localizedUrl(PARDA_PATHS.home, getLocale());
	const head = seo({
		title,
		siteName: PARDA_NAME,
		description,
		path,
		jsonLd:
			page === "home"
				? {
						"@type": "WebSite",
						"@id": `${home}#website`,
						name: PARDA_NAME,
						url: home,
						description,
						inLanguage: getLocale(),
					}
				: {
						"@type": "CollectionPage",
						name: title,
						description,
						url: localizedUrl(path, getLocale()),
						inLanguage: getLocale(),
						isPartOf: { "@id": `${home}#website` },
					},
	});
	return {
		meta: head.meta,
		links: [
			...head.links,
			...(hero?.narrow ? [preload(hero.narrow, "(max-width: 767.98px)")] : []),
			...(hero?.wide ? [preload(hero.wide, "(min-width: 768px)")] : []),
		],
	};
}
