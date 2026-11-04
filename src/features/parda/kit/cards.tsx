import { Link, type LinkOptions } from "@tanstack/react-router";
import { UserRoundIcon } from "lucide-react";
import type { ReactNode } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { ProgressBar, RatingBadge } from "./badges";
import type { PardaImage } from "./image";
import { TmdbImage } from "./tmdb-image";

/** Where a card goes: what `pardaLinks` returns (a title, a person, the player). */
export type PardaLink = LinkOptions;

/** What a poster shows, and what its hover preview adds (the server builds it from a title). */
export type PosterCardItem = {
	title: string;
	year: number | null;
	poster: PardaImage | null;
	backdrop?: PardaImage | null;
	overview?: string;
	/** Genre names, already in the page's language. */
	genres?: string[];
	rating?: number | null;
};

/** Every card's link: the whole card is one target, with the focus ring around the picture's box. */
const cardLink =
	"group pd-press block outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-pd-ground";

/** A caption under a picture: never on it (decision 0232). */
function Caption({ title, detail }: { title: string; detail?: ReactNode }) {
	return (
		<span className="mt-2 flex flex-col gap-0.5">
			<span className="line-clamp-2 font-medium text-sm leading-snug group-hover:underline group-hover:underline-offset-4">
				{title}
			</span>
			{detail ? <span className="text-pd-muted text-xs">{detail}</span> : null}
		</span>
	);
}

/** The year in the page's numerals, without grouping ("२०२४", not "२,०२४"). */
export const formatYear = (year: number | null) =>
	year === null ? "" : new Intl.NumberFormat(getLocale(), { useGrouping: false }).format(year);

/**
 * A title's poster (2:3) and caption. With a fine pointer, resting on it opens a
 * preview: the backdrop, the year and genres, the score and the overview. Touch never
 * opens it (Radix ignores touch), so a tap simply follows the link.
 */
export function PosterCard({
	item,
	link,
	sizes = "(min-width: 1024px) 12rem, 9rem",
	progress,
	preview = true,
	priority = false,
	className,
}: {
	item: PosterCardItem;
	link: PardaLink;
	sizes?: string;
	/** Watched so far (0–1), as a bar flush under the poster. */
	progress?: number;
	preview?: boolean;
	priority?: boolean;
	className?: string;
}) {
	const card = (
		<Link {...link} className={cn(cardLink, className)} data-testid="poster-card">
			<TmdbImage image={item.poster} alt="" label={item.title} aspect="poster" sizes={sizes} priority={priority} />
			{progress !== undefined ? <ProgressBar value={progress} /> : null}
			<Caption title={item.title} detail={formatYear(item.year)} />
		</Link>
	);
	if (!preview || !(item.overview || item.backdrop)) return card;
	return (
		<HoverCard openDelay={600} closeDelay={80}>
			<HoverCardTrigger asChild>{card}</HoverCardTrigger>
			<HoverCardContent
				side="right"
				align="start"
				className="w-80 overflow-hidden rounded-none border-0 bg-pd-mask p-0 text-pd-ink shadow-2xl pointer-coarse:hidden"
				data-testid="poster-preview"
			>
				<TmdbImage image={item.backdrop ?? null} alt="" label={item.title} aspect="backdrop" sizes="20rem" />
				<div className="flex flex-col gap-2 p-4">
					<p className="pd-display text-lg">{item.title}</p>
					<p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-pd-muted text-xs">
						{item.year ? <span>{formatYear(item.year)}</span> : null}
						{item.genres?.length ? <span>{item.genres.slice(0, 3).join(" · ")}</span> : null}
						<RatingBadge rating={item.rating ?? null} className="text-pd-ink" />
					</p>
					{item.overview ? <p className="line-clamp-4 text-pd-muted text-sm leading-relaxed">{item.overview}</p> : null}
				</div>
			</HoverCardContent>
		</HoverCard>
	);
}

/** A wide card (16:9): Continue watching, collections, "more like this". The detail line says what it is ("S2 · E4", a year). */
export function BackdropCard({
	title,
	detail,
	backdrop,
	link,
	progress,
	sizes = "(min-width: 1024px) 20rem, 16rem",
	className,
}: {
	title: string;
	detail?: string;
	backdrop: PardaImage | null;
	link: PardaLink;
	progress?: number;
	sizes?: string;
	className?: string;
}) {
	return (
		<Link {...link} className={cn(cardLink, className)} data-testid="backdrop-card">
			<TmdbImage image={backdrop} alt="" label={title} aspect="backdrop" sizes={sizes} />
			{progress !== undefined ? <ProgressBar value={progress} /> : null}
			<Caption title={title} detail={detail} />
		</Link>
	);
}

export type EpisodeCardItem = {
	season: number;
	episode: number;
	name: string;
	still: PardaImage | null;
	/** Minutes. */
	runtime: number | null;
	/** "YYYY-MM-DD", as TMDB gives it. */
	airDate: string | null;
	overview: string;
};

const formatAirDate = (date: string) =>
	new Intl.DateTimeFormat(getLocale(), { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));

const formatNumber = (value: number) => new Intl.NumberFormat(getLocale()).format(value);

/**
 * One episode in a season's list: the still (16:9) at the start, its number, name,
 * length and air date, two lines of overview, and how much was watched.
 */
export function EpisodeCard({
	item,
	link,
	progress,
	className,
}: {
	item: EpisodeCardItem;
	link: PardaLink;
	progress?: number;
	className?: string;
}) {
	const code = m.pd_episode_code({ season: formatNumber(item.season), episode: formatNumber(item.episode) });
	const facts = [
		item.runtime ? m.pd_runtime_minutes({ minutes: formatNumber(item.runtime) }) : null,
		item.airDate ? formatAirDate(item.airDate) : null,
	].filter(Boolean);
	return (
		<Link {...link} className={cn(cardLink, "flex gap-3 sm:gap-4", className)} data-testid="episode-card">
			<span className="block w-36 shrink-0 sm:w-56">
				<TmdbImage image={item.still} alt="" label={code} aspect="backdrop" sizes="(min-width: 640px) 14rem, 9rem" />
				{progress !== undefined ? <ProgressBar value={progress} /> : null}
			</span>
			<span className="flex min-w-0 flex-col gap-1">
				<span className="text-pd-muted text-xs tabular-nums">{code}</span>
				<span className="line-clamp-2 font-medium text-sm leading-snug group-hover:underline group-hover:underline-offset-4">
					{item.name}
				</span>
				{facts.length ? <span className="text-pd-muted text-xs">{facts.join(" · ")}</span> : null}
				{item.overview ? (
					<span className="line-clamp-2 text-pd-muted text-sm leading-relaxed max-sm:hidden">{item.overview}</span>
				) : null}
			</span>
		</Link>
	);
}

/** A person in the cast or crew: the portrait (2:3), the name, and the part or the job. */
export function PersonCard({
	name,
	role,
	profile,
	link,
	sizes = "(min-width: 1024px) 9rem, 7rem",
	className,
}: {
	name: string;
	role: string | null;
	profile: PardaImage | null;
	link: PardaLink;
	sizes?: string;
	className?: string;
}) {
	return (
		<Link {...link} className={cn(cardLink, className)} data-testid="person-card">
			<TmdbImage
				image={profile}
				alt=""
				aspect="poster"
				sizes={sizes}
				fallback={<UserRoundIcon aria-hidden className="size-10" />}
			/>
			<Caption title={name} detail={role ?? undefined} />
		</Link>
	);
}

/** Skeletons the same size as the cards, for rails that stream in (CLS 0). */
export function PosterCardSkeleton({ className }: { className?: string }) {
	return (
		<div className={className}>
			<Skeleton className="aspect-[2/3] w-full" />
			<Skeleton className="mt-2 h-4 w-4/5" />
			<Skeleton className="mt-1.5 h-3 w-1/3" />
		</div>
	);
}

export function BackdropCardSkeleton({ className }: { className?: string }) {
	return (
		<div className={className}>
			<Skeleton className="aspect-video w-full" />
			<Skeleton className="mt-2 h-4 w-3/5" />
			<Skeleton className="mt-1.5 h-3 w-1/4" />
		</div>
	);
}

export function EpisodeCardSkeleton({ className }: { className?: string }) {
	return (
		<div className={cn("flex gap-3 sm:gap-4", className)}>
			<Skeleton className="aspect-video w-36 shrink-0 sm:w-56" />
			<div className="flex flex-1 flex-col gap-1.5">
				<Skeleton className="h-3 w-12" />
				<Skeleton className="h-4 w-3/5" />
				<Skeleton className="h-3 w-1/3" />
			</div>
		</div>
	);
}

export function PersonCardSkeleton({ className }: { className?: string }) {
	return (
		<div className={className}>
			<Skeleton className="aspect-[2/3] w-full" />
			<Skeleton className="mt-2 h-4 w-4/5" />
			<Skeleton className="mt-1.5 h-3 w-1/2" />
		</div>
	);
}
