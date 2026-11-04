import { PlayIcon, Share2Icon, TvIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatDate, formatNumber } from "@/lib/i18n/intl";
import { localizedValue } from "@/lib/i18n/localized";
import { m } from "@/paraglide/messages";
import { GENRE_LABELS } from "../genres";
import { CertBadge, RatingBadge } from "../kit/badges";
import { formatYear } from "../kit/cards";
import { tmdbImage } from "../kit/image";
import { TmdbImage } from "../kit/tmdb-image";
import { ADAPTERS } from "../player/adapters";
import { PlayerFrame } from "../player/player-frame";
import { statusLabel } from "./labels";
import type { TitleFacts, TitlePlayer, TitleVideo } from "./types";
import { VideoDialog } from "./video-dialog";

/** A TMDB air date (a plain date): read at noon UTC, so no time zone moves it to another day. */
export const formatTmdbDate = (date: string, style: "medium" | "long" = "medium") =>
	formatDate(`${date}T12:00:00Z`, { dateStyle: style });

export const episodeCode = (season: number, episode: number) =>
	m.pd_episode_code({ season: formatNumber(season), episode: formatNumber(episode) });

/**
 * The screen: a 16:9 picture as wide as the height allows, the masks taking the rest
 * (decision 0234). 20rem leaves the top mask and the lower one, poster included, on a
 * laptop's first screen (1280×800).
 */
const SCREEN = "relative mx-auto w-full max-w-[max(24rem,calc((100dvh-20rem)*16/9))]";

const lengthOf = (title: TitleFacts) =>
	title.runtime
		? m.pd_runtime_minutes({ minutes: formatNumber(title.runtime) })
		: title.seasons
			? title.seasons === 1
				? m.pd_season_one()
				: m.pd_seasons({ count: formatNumber(title.seasons) })
			: null;

/** The trailer the Trailer button opens: an official trailer or teaser, else nothing. */
export const trailerOf = (videos: ReadonlyArray<TitleVideo>) =>
	videos.find((video) => video.type === "Trailer") ?? videos.find((video) => video.type === "Teaser") ?? null;

function ShareButton({ title }: { title: string }) {
	const share = async () => {
		const url = window.location.href.split("?")[0] ?? window.location.href;
		try {
			if (typeof navigator.share === "function") {
				await navigator.share({ title, url });
				return;
			}
			await navigator.clipboard.writeText(url);
			toast.success(m.pd_share_copied());
		} catch (error) {
			// The viewer closed the share sheet: nothing to say.
			if (error instanceof DOMException && error.name === "AbortError") return;
			toast.error(m.pd_share_failed());
		}
	};
	return (
		<Button variant="ghost" size="lg" onClick={share} data-testid="title-share">
			<Share2Icon aria-hidden />
			{m.pd_action_share()}
		</Button>
	);
}

/**
 * The title's screen and lower mask (PLAN Task 63): the backdrop between the masks with
 * the tagline as a subtitle, then the poster, the logo or title, the facts and the
 * actions. Play replaces the picture with the player in the same box (a poster facade,
 * PLAN 12.5), so nothing shifts; Task 64 moves it to the watch page.
 */
export function TitleHero({
	title,
	imageBase,
	player,
	videos,
}: {
	title: TitleFacts;
	imageBase: string;
	player: TitlePlayer | null;
	videos: ReadonlyArray<TitleVideo>;
}) {
	const [playing, setPlaying] = useState(false);
	const frameRef = useRef<HTMLIFrameElement>(null);
	const length = lengthOf(title);
	const trailer = trailerOf(videos);
	const genres = title.genres.flatMap((genre) => (GENRE_LABELS[genre] ? [GENRE_LABELS[genre]()] : []));
	const logo = title.logo ? `${imageBase.replace(/\/$/, "")}/w500${title.logo}` : null;
	const status = title.media === "tv" && title.status ? statusLabel(title.status) : null;
	return (
		<section aria-labelledby="title-heading" data-testid="title-hero">
			<div className="bg-pd-mask">
				<div className={SCREEN}>
					{playing && player ? (
						<div className="relative aspect-video bg-black">
							<PlayerFrame
								url={player.url}
								origins={player.origins}
								adapter={ADAPTERS[player.adapter]}
								sandbox={player.sandbox}
								title={m.pd_player_frame({ title: title.title, source: localizedValue(player.name) })}
								frameRef={frameRef}
								onEvent={() => {}}
								className="absolute inset-0 size-full"
							/>
						</div>
					) : (
						<>
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
						</>
					)}
				</div>
			</div>
			<div className="bg-pd-mask px-4 pt-4 pb-6 sm:px-6 lg:px-8">
				<div className="flex gap-5 md:items-end md:gap-6">
					<div className="hidden w-24 shrink-0 md:block lg:w-28">
						<TmdbImage
							image={tmdbImage(imageBase, title.poster, "poster")}
							alt=""
							label={title.title}
							aspect="poster"
							sizes="(min-width: 1024px) 7rem, 6rem"
						/>
					</div>
					<div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-8">
						<div className="flex min-w-0 flex-col gap-2">
							<h1
								id="title-heading"
								className="pd-display text-balance text-pd-title leading-none [&:lang(ne)]:leading-[1.2]"
								data-testid="title-heading"
							>
								{/* A logo is drawn for a dark ground: shown in the dark theme only, the name read either way. */}
								{logo ? (
									<img
										src={logo}
										alt=""
										aria-hidden
										className="hidden h-16 w-auto max-w-full object-contain object-left dark:block lg:h-20"
									/>
								) : null}
								<span className={logo ? "line-clamp-2 dark:sr-only" : "line-clamp-2"}>{title.title}</span>
							</h1>
							{title.tagline ? <p className="sr-only">{title.tagline}</p> : null}
							<p
								className="flex flex-wrap items-center gap-x-3 gap-y-1 text-pd-muted text-sm"
								data-testid="title-facts"
							>
								{title.year ? <span>{formatYear(title.year)}</span> : null}
								<CertBadge certification={title.certification} />
								{length ? <span>{length}</span> : null}
								{title.rating > 0 ? (
									<span className="inline-flex items-center gap-1">
										<RatingBadge rating={title.rating} className="text-pd-ink" />
										<span>({m.pd_votes({ count: formatNumber(title.votes) })})</span>
									</span>
								) : null}
								{genres.length ? <span>{genres.join(" · ")}</span> : null}
							</p>
							{status || title.next ? (
								<p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-pd-muted text-sm">
									{status ? <span>{status}</span> : null}
									{title.next ? (
										<span data-testid="title-next-episode">
											{m.pd_next_episode({
												code: episodeCode(title.next.season, title.next.episode),
												date: title.next.airDate ? formatTmdbDate(title.next.airDate) : m.pd_date_unknown(),
											})}
										</span>
									) : null}
								</p>
							) : null}
						</div>
						<div className="flex shrink-0 flex-wrap items-center gap-2">
							{player ? (
								<Button
									size="lg"
									onClick={() => setPlaying(true)}
									disabled={playing}
									data-testid="title-play"
									aria-describedby={player.episode ? "title-play-episode" : undefined}
								>
									<PlayIcon aria-hidden />
									{m.pd_action_play()}
									{player.episode ? (
										<span id="title-play-episode" className="text-xs opacity-80">
											{episodeCode(player.episode.season, player.episode.episode)}
										</span>
									) : null}
								</Button>
							) : null}
							{trailer ? (
								<VideoDialog video={trailer} title={title.title}>
									<Button variant={player ? "outline" : "default"} size="lg" data-testid="title-trailer">
										<TvIcon aria-hidden />
										{m.pd_action_trailer()}
									</Button>
								</VideoDialog>
							) : null}
							<ShareButton title={title.title} />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
