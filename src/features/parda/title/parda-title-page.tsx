import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { MAIN_CONTENT } from "@/components/layout/skip-link";
import { formatNumber } from "@/lib/i18n/intl";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { GENRE_LABELS } from "../genres";
import { CatalogUnconfigured } from "../home/catalog-unconfigured";
import { CertBadge, RatingBadge } from "../kit/badges";
import { formatYear } from "../kit/cards";
import { tmdbImage } from "../kit/image";
import { TmdbImage } from "../kit/tmdb-image";
import { pardaTitleQueryOptions } from "../queries";
import { titleParamsSchema } from "../search";
import type { TitlePageData } from "./types";

const route = getRouteApi("/_parda/app/parda/$type/$id");

function TitleContent({ data }: { data: Extract<TitlePageData, { configured: true }> }) {
	const { title, imageBase } = data;
	const length = title.runtime
		? m.pd_runtime_minutes({ minutes: formatNumber(title.runtime) })
		: title.seasons
			? title.seasons === 1
				? m.pd_season_one()
				: m.pd_seasons({ count: formatNumber(title.seasons) })
			: null;
	const genres = title.genres.flatMap((genre) => {
		const label = GENRE_LABELS[genre];
		return label ? [label()] : [];
	});
	return (
		<>
			{/* The screen fits its picture (16:9) and the masks take the rest, so the title stays on a laptop's first screen. */}
			<div className="bg-pd-mask">
				<div className="relative mx-auto w-full max-w-[max(24rem,calc((100dvh-16rem)*16/9))]">
					<TmdbImage
						image={tmdbImage(imageBase, title.backdrop, "backdrop")}
						alt=""
						label={title.title}
						aspect="backdrop"
						sizes="100vw"
						priority
					/>
					{title.tagline ? (
						<p
							aria-hidden
							className="pd-scrim absolute inset-x-0 bottom-0 flex h-28 items-end justify-center px-6 pb-4 text-center"
						>
							<span className="line-clamp-2 max-w-3xl text-pd-sub text-pd-subtitle">{title.tagline}</span>
						</p>
					) : null}
				</div>
			</div>
			<div className="flex flex-col gap-2 bg-pd-mask px-4 pt-4 pb-6 sm:px-6 lg:px-8">
				<h1 className="pd-display line-clamp-2 text-balance text-pd-title leading-none [&:lang(ne)]:leading-[1.2]">
					{title.title}
				</h1>
				{title.tagline ? <p className="sr-only">{title.tagline}</p> : null}
				<p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-pd-muted text-sm">
					{title.year ? <span>{formatYear(title.year)}</span> : null}
					{length ? <span>{length}</span> : null}
					<CertBadge certification={title.certification} />
					<RatingBadge rating={title.rating} className="text-pd-ink" />
					{genres.length ? <span>{genres.join(" · ")}</span> : null}
				</p>
			</div>
			<div className="px-4 py-8 sm:px-6 lg:px-8">
				{title.overview ? (
					<p className="max-w-prose text-base leading-relaxed">{title.overview}</p>
				) : (
					<p className="text-pd-muted">{m.pd_title_no_overview()}</p>
				)}
			</div>
		</>
	);
}

/**
 * A title's page until Task 63 builds the rest (decision 0234): the backdrop between
 * the masks, its tagline as a subtitle, the title and its facts in the lower mask,
 * and the overview.
 */
export function PardaTitlePage() {
	const params = titleParamsSchema.parse(route.useParams());
	const { data } = useSuspenseQuery(pardaTitleQueryOptions(getLocale(), params.type, params.id));
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
