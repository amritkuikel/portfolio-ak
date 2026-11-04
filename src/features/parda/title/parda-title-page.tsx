import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { MAIN_CONTENT } from "@/components/layout/skip-link";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { CatalogUnconfigured } from "../home/catalog-unconfigured";
import { pardaLinks } from "../links";
import { pardaTitleQueryOptions } from "../queries";
import { titleRouteParams } from "../search";
import { Episodes, NewEpisodeBanner } from "./episodes";
import { Gallery } from "./gallery";
import { TitleHero } from "./title-hero";
import {
	CastRail,
	ExternalLinks,
	FranchiseBanner,
	INSET,
	KeyCrew,
	PosterRail,
	Reviews,
	TitleDetails,
	Videos,
	WhereToWatch,
} from "./title-sections";
import type { TitlePageData } from "./types";

const route = getRouteApi("/_parda/app/parda/$type/$id/");

function TitleContent({ data }: { data: Extract<TitlePageData, { configured: true }> }) {
	const { title, imageBase } = data;
	return (
		<>
			<TitleHero title={title} imageBase={imageBase} player={data.player} videos={data.videos} />
			<div className="flex flex-col gap-12 pt-8 pb-12">
				<section aria-label={m.pd_overview_heading()} className={INSET}>
					{title.overview ? (
						<p className="max-w-prose text-base leading-relaxed" data-testid="title-overview">
							{title.overview}
						</p>
					) : (
						<p className="text-pd-muted">{m.pd_title_no_overview()}</p>
					)}
				</section>
				{title.media === "tv" && data.seasons.length ? (
					<div className="flex flex-col gap-4">
						<NewEpisodeBanner latest={title.latest} today={data.today} />
						<Episodes id={title.id} seasons={data.seasons} imageBase={imageBase} />
					</div>
				) : null}
				<CastRail
					cast={data.cast}
					imageBase={imageBase}
					credits={pardaLinks.credits(title.media, title.id, title.slug)}
				/>
				<KeyCrew crew={data.crew} />
				<TitleDetails title={title} />
				<WhereToWatch providers={data.providers} imageBase={imageBase} />
				<Videos videos={data.videos} title={title.title} />
				<Gallery
					backdrops={data.gallery.backdrops}
					posters={data.gallery.posters}
					imageBase={imageBase}
					title={title.title}
					heading={m.pd_gallery_heading()}
				/>
				<FranchiseBanner collection={title.collection} imageBase={imageBase} />
				<PosterRail
					title={m.pd_more_like_this()}
					titles={data.recommendations}
					imageBase={imageBase}
					testId="title-recommendations"
				/>
				<PosterRail title={m.pd_similar()} titles={data.similar} imageBase={imageBase} testId="title-similar" />
				<Reviews reviews={data.reviews} />
				<ExternalLinks links={title.links} tmdb={`https://www.themoviedb.org/${title.media}/${title.id}`} />
			</div>
		</>
	);
}

/**
 * A title's page (PLAN Task 63, decision 0235), in the plan's order: the hero and its
 * actions, the overview, a series' episodes, the cast and key crew, the details, where
 * to watch legally, videos and the gallery, the franchise, more like this and similar,
 * reviews and links. My List, ♥, Like and Mark watched arrive with their tables (Tasks 64 and 67).
 */
export function PardaTitlePage() {
	// The loader has already turned anything else into a 404.
	const params = titleRouteParams(route.useParams());
	const { data } = useSuspenseQuery(pardaTitleQueryOptions(getLocale(), params?.type ?? "movie", params?.id ?? 0));
	return (
		<main {...MAIN_CONTENT} className="flex flex-1 flex-col outline-none" data-testid="parda-title">
			{data.configured ? (
				<TitleContent data={data} />
			) : (
				<>
					<h1 className="sr-only">{m.pd_catalog_unconfigured()}</h1>
					<CatalogUnconfigured />
				</>
			)}
		</main>
	);
}
