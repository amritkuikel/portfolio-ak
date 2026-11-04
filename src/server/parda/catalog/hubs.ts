import "@tanstack/react-start/server-only";
import type { HubPageData, HubRailData, HubRailTitles, HubSlide, HubTitle } from "@/features/parda/home/types";
import type { PardaPage } from "@/features/parda/search";
import { AppError, isAppError } from "@/lib/errors";
import { errorFields, log } from "@/server/log";
import type { TitleSummary } from "../tmdb/mappers";
import { AWAITED_RAILS, BILLBOARD_SIZE, PAGE_LAYOUTS, type RailContext, type RailSpec, railContext } from "./rails";
import { type CatalogScope, type CatalogServices, listTitles, titleDetails } from "./service";

/**
 * The home and the hubs (PLAN Task 62, decision 0234): the billboard and the first
 * rails, awaited before the page is sent, and each later rail on its own call, so the
 * page streams them. A rail TMDB can't answer degrades to "couldn't load" in place
 * (PLAN 12.5); only a title page fails whole.
 */

/** A rail shows at most this many titles: TMDB's first page. */
const RAIL_SIZE = 20;
/** The poster preview shows four lines of overview, so the page carries no more than that. */
const OVERVIEW_MAX = 280;

const cut = (text: string) => {
	if (text.length <= OVERVIEW_MAX) return text;
	const space = text.lastIndexOf(" ", OVERVIEW_MAX);
	return `${text.slice(0, space > OVERVIEW_MAX / 2 ? space : OVERVIEW_MAX).trimEnd()}…`;
};

const toHubTitle = (title: TitleSummary): HubTitle => ({
	media: title.media,
	id: title.id,
	title: title.title,
	year: title.year,
	poster: title.poster,
	backdrop: title.backdrop,
	overview: cut(title.overview),
	genres: title.genres,
	rating: title.rating,
});

/** TMDB failing (UPSTREAM_UNAVAILABLE) is logged and becomes null; anything else is a bug and throws. */
async function degrade<T>(what: string, load: () => Promise<T>): Promise<T | null> {
	try {
		return await load();
	} catch (error) {
		if (!isAppError(error) || error.code !== "UPSTREAM_UNAVAILABLE") throw error;
		log("warn", "parda rail unavailable", { what, ...errorFields(error) });
		return null;
	}
}

const railTitles = (services: CatalogServices, scope: CatalogScope, spec: RailSpec, context: RailContext) =>
	degrade(spec.id, async () => {
		const list = await listTitles(services, scope, spec.request(context));
		return list.results.slice(0, RAIL_SIZE);
	});

/** The billboard: the first titles with a backdrop in its rail, each with its details (tagline, runtime, certificate). */
async function billboard(
	services: CatalogServices,
	scope: CatalogScope,
	spec: RailSpec,
	context: RailContext,
): Promise<HubSlide[]> {
	const titles = (await railTitles(services, scope, spec, context)) ?? [];
	const picked = titles.filter((title) => title.backdrop).slice(0, BILLBOARD_SIZE);
	const slides = await Promise.all(
		picked.map((title) =>
			degrade(`${title.media}/${title.id}`, async (): Promise<HubSlide> => {
				const details = await titleDetails(services, scope, title.media, title.id);
				return {
					...toHubTitle(details),
					tagline: details.tagline,
					runtime: title.media === "movie" ? details.runtime : null,
					seasons: details.seasons,
					certification: details.certification,
				};
			}),
		),
	);
	return slides.filter((slide) => slide !== null);
}

export async function hubPage(
	services: CatalogServices,
	scope: CatalogScope,
	page: PardaPage,
	now: Date = new Date(),
): Promise<Extract<HubPageData, { configured: true }>> {
	const layout = PAGE_LAYOUTS[page];
	const context = railContext(scope.region, now);
	const from = layout.rails.find((spec) => spec.id === layout.billboardFrom);
	if (!from) throw new Error(`Parda: ${page}'s billboard rail "${layout.billboardFrom}" isn't in its layout`);
	// The billboard's rail is usually one of these, and the cache gives both one TMDB call.
	const [awaited, slides] = await Promise.all([
		Promise.all(
			layout.rails.slice(0, AWAITED_RAILS).map(async (spec): Promise<HubRailTitles> => {
				const titles = await railTitles(services, scope, spec, context);
				return titles?.map(toHubTitle) ?? null;
			}),
		),
		billboard(services, scope, from, context),
	]);
	return {
		configured: true,
		page,
		imageBase: services.tmdb.config.imageBase,
		billboard: slides,
		rails: layout.rails.map((spec, index) => ({
			id: spec.id,
			kind: spec.kind,
			label: spec.label,
			...(index < AWAITED_RAILS ? { titles: awaited[index] ?? null } : {}),
		})),
	};
}

/** One streamed rail of a page, by its id. */
export async function hubRail(
	services: CatalogServices,
	scope: CatalogScope,
	page: PardaPage,
	railId: string,
	now: Date = new Date(),
): Promise<HubRailData> {
	const spec = PAGE_LAYOUTS[page].rails.find((rail) => rail.id === railId);
	if (!spec) throw new AppError("NOT_FOUND", `Parda: no rail "${railId}" on ${page}`);
	const titles = await railTitles(services, scope, spec, railContext(scope.region, now));
	return { imageBase: services.tmdb.config.imageBase, titles: titles?.map(toHubTitle) ?? null };
}
