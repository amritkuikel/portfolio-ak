import "@tanstack/react-start/server-only";
import type { TitlePageData } from "@/features/parda/title/types";
import type { PardaMedia } from "@/server/db/schema";
import { type CatalogScope, type CatalogServices, titleDetails } from "./service";

/**
 * A title's page (decision 0234): until Task 63 builds the full page, its hero, facts
 * and overview. A blocked or unknown title is NOT_FOUND; TMDB failing is
 * UPSTREAM_UNAVAILABLE, and the page answers 503 (PLAN 12.5: only a title page throws).
 */
export async function titlePage(
	services: CatalogServices,
	scope: CatalogScope,
	media: PardaMedia,
	id: number,
): Promise<Extract<TitlePageData, { configured: true }>> {
	const details = await titleDetails(services, scope, media, id);
	return {
		configured: true,
		imageBase: services.tmdb.config.imageBase,
		title: {
			media: details.media,
			id: details.id,
			title: details.title,
			year: details.year,
			poster: details.poster,
			backdrop: details.backdrop,
			overview: details.overview,
			genres: details.genres,
			rating: details.rating,
			tagline: details.tagline,
			runtime: media === "movie" ? details.runtime : null,
			seasons: details.seasons,
			certification: details.certification,
		},
	};
}
