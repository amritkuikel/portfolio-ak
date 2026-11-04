import { useQuery, useQueryClient } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Rail, RailItem, RailSkeleton } from "@/components/data-display/rail";
import { errorMessage } from "@/components/errors/error-page";
import { Button } from "@/components/ui/button";
import { sessionQueryOptions } from "@/features/auth/queries";
import { formatNumber } from "@/lib/i18n/intl";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { BackdropCard, BackdropCardSkeleton } from "../kit/cards";
import { tmdbImage } from "../kit/image";
import { pardaLinks } from "../links";
import { episodeCode } from "../title/title-hero";
import { localContinue, readLocalProgress, removeLocalTitle } from "./local";
import { keepsLocalProgress } from "./local-cookie";
import { pardaContinueQueryOptions, refreshLibrary } from "./queries";
import type { ContinueItem } from "./types";

/**
 * Continue watching (PLAN 12.5, decision 0236): the profile's titles in progress or with
 * a next episode, latest first, each with its bar, its action and *Remove*. With a
 * session the loader awaited it; without one it's the browser's own, and a cookie tells
 * the server to keep its space while the browser fills it in, so nothing moves.
 */

const ITEM = "w-64 lg:w-80";

const ctaLabel = (item: ContinueItem) =>
	item.cta.kind === "next"
		? m.pd_cta_next({ code: episodeCode(item.cta.season, item.cta.episode) })
		: [
				item.cta.season !== null && item.cta.episode !== null ? episodeCode(item.cta.season, item.cta.episode) : null,
				item.cta.left ? m.pd_cta_resume_left({ minutes: formatNumber(item.cta.left) }) : m.pd_cta_resume(),
			]
				.filter(Boolean)
				.join(" · ");

function Items({
	items,
	imageBase,
	onRemove,
}: {
	items: ReadonlyArray<ContinueItem>;
	imageBase: string;
	onRemove: (item: ContinueItem) => void;
}) {
	return (
		<Rail title={m.pd_continue_watching()} data-testid="continue-rail">
			{items.map((item) => {
				const target =
					item.cta.kind === "next"
						? { season: item.cta.season, episode: item.cta.episode }
						: item.cta.season !== null && item.cta.episode !== null
							? { season: item.cta.season, episode: item.cta.episode }
							: null;
				return (
					<RailItem key={`${item.media}:${item.id}`} className={`relative ${ITEM}`}>
						<BackdropCard
							title={item.title}
							detail={ctaLabel(item)}
							backdrop={tmdbImage(imageBase, item.backdrop, "backdrop")}
							link={pardaLinks.watch(item.media, item.id, item.slug, target)}
							progress={item.share}
						/>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onRemove(item)}
							className="absolute end-1 top-1 size-8 bg-black/60 text-pd-on-picture hover:bg-black/80"
							aria-label={m.pd_continue_remove({ title: item.title })}
							data-testid="continue-remove"
						>
							<XIcon aria-hidden />
						</Button>
					</RailItem>
				);
			})}
		</Rail>
	);
}

function ServerRail() {
	const queryClient = useQueryClient();
	const { data } = useQuery(pardaContinueQueryOptions(getLocale()));
	if (!data?.items.length) return null;
	const remove = async (item: ContinueItem) => {
		try {
			const { removePardaContinue } = await import("@/functions/parda/library");
			await removePardaContinue({ data: { media: item.media, id: item.id } });
			await refreshLibrary(queryClient);
		} catch (error) {
			toast.error(errorMessage(error));
		}
	};
	return <Items items={data.items} imageBase={data.imageBase} onRemove={(item) => void remove(item)} />;
}

function LocalRail({ imageBase }: { imageBase: string }) {
	const [items, setItems] = useState<ContinueItem[] | null>(null);
	useEffect(() => setItems(localContinue(readLocalProgress())), []);
	if (items === null) {
		return <RailSkeleton count={4} item={<BackdropCardSkeleton />} itemClassName={ITEM} />;
	}
	if (items.length === 0) return null;
	return (
		<Items
			items={items}
			imageBase={imageBase}
			onRemove={(item) => {
				removeLocalTitle(item.media, item.id);
				setItems(localContinue(readLocalProgress()));
			}}
		/>
	);
}

export function ContinueRail({ imageBase }: { imageBase: string }) {
	const { data: session } = useQuery(sessionQueryOptions());
	if (session) return <ServerRail />;
	return keepsLocalProgress() ? <LocalRail imageBase={imageBase} /> : null;
}
