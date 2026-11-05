import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { MAIN_CONTENT } from "@/components/layout/skip-link";
import { formatNumber } from "@/lib/i18n/intl";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { CatalogUnconfigured } from "../home/catalog-unconfigured";
import { POSTER_SIZES, toPosterItem } from "../home/title-rails";
import { PosterCard } from "../kit/cards";
import { tmdbImage } from "../kit/image";
import { TmdbImage } from "../kit/tmdb-image";
import { CardListToggle } from "../library/save-buttons";
import { pardaLinks } from "../links";
import { pardaCollectionQueryOptions } from "../queries";
import { INSET } from "./title-sections";
import type { CollectionPageData } from "./types";

const route = getRouteApi("/_parda/app/parda/collection/$id");

function CollectionContent({ data }: { data: Extract<CollectionPageData, { configured: true }> }) {
	const { collection, imageBase, parts } = data;
	return (
		<>
			<div className="bg-pd-mask">
				<div className="relative mx-auto w-full max-w-[max(24rem,calc((100dvh-16rem)*16/9))]">
					<TmdbImage
						image={tmdbImage(imageBase, collection.backdrop, "backdrop")}
						alt=""
						label={collection.name}
						aspect="backdrop"
						sizes="100vw"
						priority
					/>
				</div>
			</div>
			<header className={cn(INSET, "flex flex-col gap-2 bg-pd-mask pt-4 pb-6")}>
				<h1 className="pd-display text-balance text-pd-title leading-none [&:lang(ne)]:leading-[1.2]">
					{collection.name}
				</h1>
				<p className="text-pd-muted text-sm">{m.pd_collection_count({ count: formatNumber(parts.length) })}</p>
			</header>
			<div className="flex flex-col gap-8 pt-8 pb-12">
				{collection.overview ? (
					<p className={cn(INSET, "max-w-prose text-base leading-relaxed")}>{collection.overview}</p>
				) : null}
				<section aria-labelledby="collection-parts" className={cn(INSET, "flex flex-col gap-4")}>
					<h2 id="collection-parts" className="pd-display text-pd-head font-bold">
						{m.pd_collection_in_order()}
					</h2>
					<ol
						className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
						data-testid="collection-parts"
					>
						{parts.map((part, index) => (
							<li key={part.id} className="flex flex-col gap-1">
								<span className="text-pd-muted text-xs tabular-nums">
									{m.pd_collection_part({ number: formatNumber(index + 1) })}
								</span>
								<PosterCard
									item={toPosterItem(part, imageBase)}
									link={pardaLinks.title(part.media, part.id, part.slug)}
									sizes={POSTER_SIZES}
									action={<CardListToggle title={{ media: part.media, id: part.id, title: part.title }} />}
								/>
							</li>
						))}
					</ol>
				</section>
			</div>
		</>
	);
}

/** A franchise (PLAN Task 63): its titles in release order, the ones still to come last. */
export function PardaCollectionPage() {
	const { id } = route.useParams();
	const { data } = useSuspenseQuery(pardaCollectionQueryOptions(getLocale(), Number(id)));
	return (
		<main {...MAIN_CONTENT} className="flex flex-1 flex-col outline-none" data-testid="parda-collection">
			{data.configured ? (
				<CollectionContent data={data} />
			) : (
				<>
					<h1 className="sr-only">{m.pd_catalog_unconfigured()}</h1>
					<CatalogUnconfigured />
				</>
			)}
		</main>
	);
}
