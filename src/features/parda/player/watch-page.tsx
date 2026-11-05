import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import {
	ArrowLeftIcon,
	CheckIcon,
	ListVideoIcon,
	MaximizeIcon,
	MousePointerClickIcon,
	PauseIcon,
	PlayIcon,
	RectangleHorizontalIcon,
	ServerIcon,
	TvIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { MAIN_CONTENT } from "@/components/layout/skip-link";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHotkeys } from "@/hooks/use-hotkeys";
import { formatNumber } from "@/lib/i18n/intl";
import { localizedValue } from "@/lib/i18n/localized";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { CatalogUnconfigured } from "../home/catalog-unconfigured";
import { tmdbImage } from "../kit/image";
import { TmdbImage } from "../kit/tmdb-image";
import { pardaWatchQueryOptions } from "../library/queries";
import { HeartButton, ListIconButton } from "../library/save-buttons";
import { pardaLinks } from "../links";
import { titleRouteParams } from "../search";
import { episodeCode } from "../title/title-hero";
import { VideoDialog } from "../title/video-dialog";
import { ADAPTERS } from "./adapters";
import { formatClock } from "./machine";
import { PlayerFrame } from "./player-frame";
import { useWatchPlayer, type WatchPlayer } from "./use-watch-player";
import { BlockerHint, EpisodesSheet, ReportDialog, UpNext } from "./watch-panels";
import type { WatchPageData } from "./watch-types";

const route = getRouteApi("/_parda/app/parda/watch/$type/$id");

type Data = Extract<WatchPageData, { configured: true }>;

/** Clock digits in the page's language ("३४:१०" in Nepali). */
const clock = (seconds: number) => formatClock(seconds).replace(/\d/g, (digit) => formatNumber(Number(digit)));

/**
 * The player's box (PLAN 12.6, "Player size"): as wide as the height allows at 16:9,
 * never wider than the page; theater mode gives it the height the details took.
 */
const box = (theater: boolean) =>
	cn(
		"relative mx-auto aspect-video w-full bg-black",
		theater ? "max-w-[calc((100dvh-7.5rem)*16/9)]" : "max-w-[max(20rem,calc((100dvh-12rem)*16/9))]",
	);

/**
 * The server switcher: Auto, then the sources in their order. The server renders it from
 * the page's data, so it's there before the player picks (no shift); its label is the
 * pick, or Auto.
 */
function ServerMenu({ player, sources }: { player: WatchPlayer; sources: Data["sources"] }) {
	if (sources.length < 2) return null;
	const listed = player.order.length ? player.order : sources;
	const picked = player.picked ? listed.find((source) => source.id === player.picked) : undefined;
	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="sm" data-testid="server-menu">
					<ServerIcon aria-hidden />
					{picked ? localizedValue(picked.name) : m.pd_server_auto()}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				<DropdownMenuLabel>{m.pd_server_label()}</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuRadioGroup
					value={player.picked ?? "auto"}
					onValueChange={(value) => player.choose(value === "auto" ? null : value)}
				>
					<DropdownMenuRadioItem value="auto" data-testid="server-auto">
						{m.pd_server_auto()}
					</DropdownMenuRadioItem>
					{listed.map((source) => (
						<DropdownMenuRadioItem key={source.id} value={source.id} data-testid="server-option">
							{source.quality
								? m.pd_server_quality({ name: localizedValue(source.name), quality: source.quality })
								: localizedValue(source.name)}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/**
 * Parda's own controls, for a player that obeys commands (PLAN 12.5, "Click shield"):
 * play, pause, a seek bar and fullscreen on our wrapper. *Player menu* lifts the shield
 * for the player's own settings, and says clicks there may open ads.
 */
function ShieldControls({
	player,
	shielded,
	onShield,
	wrapper,
	enabled,
}: {
	player: WatchPlayer;
	/** False until the player is ready (and for one that doesn't obey commands): shown, so nothing moves, but inert. */
	enabled: boolean;
	shielded: boolean;
	onShield: (on: boolean) => void;
	wrapper: React.RefObject<HTMLDivElement | null>;
}) {
	const toggle = () => player.command({ action: player.playing ? "pause" : "play" });
	return (
		<div className="flex min-w-0 flex-1 basis-full items-center gap-2 sm:basis-auto" data-testid="shield-controls">
			<Button
				variant="ghost"
				size="icon"
				onClick={toggle}
				disabled={!enabled}
				aria-label={player.playing ? m.pd_player_pause() : m.pd_player_play()}
				data-testid="control-toggle"
			>
				{player.playing ? <PauseIcon aria-hidden /> : <PlayIcon aria-hidden />}
			</Button>
			<span className="w-24 shrink-0 text-pd-muted text-xs tabular-nums sm:w-28" data-testid="control-time">
				{clock(player.position)}
				{player.duration ? ` / ${clock(player.duration)}` : null}
			</span>
			<input
				type="range"
				min={0}
				max={Math.max(1, Math.floor(player.duration ?? 0))}
				step={1}
				value={Math.floor(player.position)}
				disabled={!enabled || !player.duration}
				onChange={(event) => player.command({ action: "seek", position: Number(event.target.value) })}
				aria-label={m.pd_player_seek()}
				aria-valuetext={clock(player.position)}
				className="h-6 min-w-0 flex-1 accent-[var(--pd-action)]"
				data-testid="control-seek"
			/>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => void wrapper.current?.requestFullscreen?.().catch(() => {})}
				disabled={!enabled}
				aria-label={m.pd_player_fullscreen()}
			>
				<MaximizeIcon aria-hidden />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				aria-pressed={!shielded}
				onClick={() => onShield(!shielded)}
				disabled={!enabled}
				title={m.pd_player_menu_warning()}
				data-testid="control-player-menu"
			>
				{shielded ? <MousePointerClickIcon aria-hidden /> : <CheckIcon aria-hidden />}
				{shielded ? m.pd_player_menu() : m.pd_player_menu_done()}
			</Button>
		</div>
	);
}

function Screen({ data }: { data: Data }) {
	const navigate = useNavigate();
	const frameRef = useRef<HTMLIFrameElement>(null);
	const wrapper = useRef<HTMLDivElement>(null);
	const player = useWatchPlayer(data, frameRef);
	const [theater, setTheater] = useState(false);
	const [episodesOpen, setEpisodesOpen] = useState(false);
	const [shielded, setShielded] = useState(true);
	const [upNextDismissed, setUpNextDismissed] = useState(false);
	const { title, episode } = data;
	const adapter = player.source ? ADAPTERS[player.source.adapter] : null;
	const canCommand = Boolean(adapter?.command) && player.ready;
	// Parda's controls take a row when the first source obeys commands, rendered from the server so the bar never grows.
	const firstSource = data.sources.find((source) => source.id === data.order.ok[0]);
	const controlsRow = firstSource ? ADAPTERS[firstSource.adapter].command !== null : false;
	const watchLink = (target: { season: number; episode: number }) =>
		pardaLinks.watch(title.media, title.id, title.slug, target);

	useHotkeys({
		n: () => data.next && void navigate(watchLink(data.next)),
		p: () => data.previous && void navigate(watchLink(data.previous)),
		e: () => episode && setEpisodesOpen((open) => !open),
		t: () => setTheater((on) => !on),
		escape: () => setTheater(false),
		k: () => canCommand && player.command({ action: player.playing ? "pause" : "play" }),
	});

	const heading = episode ? `${title.title} · ${episodeCode(episode.season, episode.episode)}` : title.title;
	const frameTitle = player.source
		? m.pd_player_frame({ title: heading, source: localizedValue(player.source.name) })
		: heading;

	return (
		<>
			<section aria-label={m.pd_watch_player()} className="bg-pd-mask" data-testid="watch-player">
				<div ref={wrapper} className={box(theater)} data-testid="watch-box" data-status={player.status}>
					{player.src && player.source ? (
						<PlayerFrame
							url={player.src}
							origins={player.source.origins}
							adapter={ADAPTERS[player.source.adapter]}
							sandbox={player.source.sandbox}
							title={frameTitle}
							frameRef={frameRef}
							onEvent={player.onEvent}
							className="absolute inset-0 size-full"
						/>
					) : (
						<TmdbImage
							image={tmdbImage(data.imageBase, episode?.still ?? title.backdrop, "backdrop")}
							alt=""
							label={title.title}
							aspect="backdrop"
							sizes="100vw"
							priority
						/>
					)}
					{canCommand && shielded ? (
						// The shield: the iframe never gets a click, so clicks can't open ads (PLAN 12.5).
						<button
							type="button"
							className="absolute inset-0 size-full cursor-pointer outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset"
							onClick={() => player.command({ action: player.playing ? "pause" : "play" })}
							aria-label={player.playing ? m.pd_player_pause() : m.pd_player_play()}
							data-testid="click-shield"
						/>
					) : null}
					{player.clickHint && player.status === "loading" ? (
						<p className="pointer-events-none absolute inset-x-0 top-0 bg-pd-scrim/0 p-3 text-center text-pd-on-picture text-sm">
							<span className="bg-black/70 px-2 py-1">{m.pd_player_press_play()}</span>
						</p>
					) : null}
					{player.status === "unavailable" || player.status === "off" ? (
						<output
							className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/75 p-6 text-center text-pd-on-picture"
							data-testid="watch-unavailable"
						>
							<p className="pd-display text-pd-head">
								{data.playback === "off" ? m.pd_watch_off() : m.pd_watch_unavailable()}
							</p>
							{data.playback === "off" ? null : <p className="text-sm">{m.pd_watch_unavailable_detail()}</p>}
							<div className="flex flex-wrap justify-center gap-2">
								{data.trailer ? (
									<VideoDialog video={data.trailer} title={title.title}>
										<Button size="sm">
											<TvIcon aria-hidden />
											{m.pd_action_trailer()}
										</Button>
									</VideoDialog>
								) : null}
								{data.playback === "off" ? null : <ReportDialog data={data} sourceId={null} variant="outline" />}
							</div>
						</output>
					) : null}
					{player.nearEnd && data.next && !upNextDismissed ? (
						<UpNext data={data} next={data.next} onCancel={() => setUpNextDismissed(true)} />
					) : null}
				</div>
				<div
					className={cn(
						"mx-auto flex flex-wrap items-center gap-1 px-2 py-2 sm:px-4",
						box(theater),
						"aspect-auto bg-transparent",
					)}
					data-testid="player-bar"
				>
					{controlsRow ? (
						<ShieldControls
							player={player}
							enabled={canCommand}
							shielded={shielded}
							onShield={setShielded}
							wrapper={wrapper}
						/>
					) : null}
					{episode ? (
						<Button variant="ghost" size="sm" onClick={() => setEpisodesOpen(true)} data-testid="watch-episodes-open">
							<ListVideoIcon aria-hidden />
							{m.pd_episodes_heading()}
						</Button>
					) : null}
					<Button
						variant="ghost"
						size="sm"
						aria-pressed={theater}
						onClick={() => setTheater((on) => !on)}
						className="max-md:hidden"
						data-testid="watch-theater"
					>
						<RectangleHorizontalIcon aria-hidden />
						{m.pd_watch_theater()}
					</Button>
					<ListIconButton title={{ media: title.media, id: title.id, title: title.title }} playerMounted />
					<HeartButton title={{ media: title.media, id: title.id, title: title.title }} playerMounted />
					{data.playback === "on" ? <ReportDialog data={data} sourceId={player.source?.id ?? null} /> : null}
					<ServerMenu player={player} sources={data.sources} />
				</div>
			</section>
			{theater ? null : (
				<section aria-labelledby="watch-heading" className="flex flex-col gap-2 px-4 pt-6 pb-4 sm:px-6 lg:px-8">
					<Link
						{...pardaLinks.title(title.media, title.id, title.slug)}
						className="inline-flex w-fit items-center gap-1 text-pd-muted text-sm hover:text-pd-ink"
						data-testid="watch-back"
					>
						<ArrowLeftIcon aria-hidden className="size-4" />
						{m.pd_watch_back()}
					</Link>
					<h1 id="watch-heading" className="pd-display text-pd-head" data-testid="watch-heading">
						{title.title}
						{episode ? (
							<span className="mt-1 block font-normal text-base text-pd-muted">
								{episodeCode(episode.season, episode.episode)}
								{episode.name ? ` · ${episode.name}` : null}
							</span>
						) : null}
					</h1>
					{title.overview ? (
						<p className="max-w-prose text-pd-muted text-sm leading-relaxed">{title.overview}</p>
					) : null}
					<p className="text-pd-muted text-xs">{m.pd_watch_shortcuts()}</p>
				</section>
			)}
			{episode ? <EpisodesSheet data={data} open={episodesOpen} onOpenChange={setEpisodesOpen} /> : null}
			<BlockerHint />
		</>
	);
}

/**
 * The watch page (PLAN Task 64, decision 0236), noindex: the player between the masks,
 * its bar (Parda's controls where the player obeys commands, the server, episodes,
 * theater mode, *Report a problem*), the title, and the ad-blocker hint.
 */
export function PardaWatchPage() {
	const params = titleRouteParams(route.useParams());
	const search = route.useSearch();
	const { data } = useSuspenseQuery(
		pardaWatchQueryOptions(getLocale(), params?.type ?? "movie", params?.id ?? 0, search.s, search.e),
	);
	return (
		// Named: a player's own document may hold a <main> too, and landmarks must differ.
		<main
			{...MAIN_CONTENT}
			aria-label={m.pd_watch_main()}
			className="flex flex-1 flex-col outline-none"
			data-testid="parda-watch"
		>
			{data.configured ? (
				// A new episode is a new player: its state starts over.
				<Screen key={`${data.title.id}:${data.episode?.season}:${data.episode?.episode}`} data={data} />
			) : (
				<>
					<h1 className="sr-only">{m.pd_catalog_unconfigured()}</h1>
					<CatalogUnconfigured />
				</>
			)}
		</main>
	);
}
