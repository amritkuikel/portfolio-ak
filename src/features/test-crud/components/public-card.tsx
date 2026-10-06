import { Link } from "@tanstack/react-router";
import { ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/intl";
import { m } from "@/paraglide/messages";
import type { PublicTestCrudCard } from "../schema";

/**
 * One published item. The title link is stretched over the card, so the whole
 * card is clickable while screen readers hear a single link with the title.
 * The image box has a fixed aspect ratio, so cards don't jump as images load.
 */
export function PublicCard({ item, headingLevel = 2 }: { item: PublicTestCrudCard; headingLevel?: 2 | 3 }) {
	const Heading = `h${headingLevel}` as const;
	return (
		<article className="group relative flex w-full min-w-0 flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs transition-shadow focus-within:ring-[3px] focus-within:ring-ring/50 hover:shadow-md">
			<div className="aspect-[16/9] bg-muted">
				{item.imageUrl ? (
					<img
						src={item.imageUrl}
						alt=""
						loading="lazy"
						decoding="async"
						width={640}
						height={360}
						className="size-full object-cover"
					/>
				) : (
					<div className="flex size-full items-center justify-center">
						<ImageIcon className="size-8 text-muted-foreground/60" aria-hidden />
					</div>
				)}
			</div>
			<div className="flex flex-1 flex-col gap-3 p-4">
				<Heading className="font-semibold text-lg leading-snug tracking-tight">
					<Link
						to="/test-crud/$slug"
						params={{ slug: item.slug }}
						className="outline-none after:absolute after:inset-0 group-hover:underline group-hover:underline-offset-4"
					>
						{item.title}
					</Link>
				</Heading>
				{item.summary ? <p className="line-clamp-3 text-muted-foreground text-sm">{item.summary}</p> : null}
				<div className="mt-auto flex flex-wrap items-center justify-between gap-2 text-sm">
					<span className="font-medium tabular-nums">{formatCurrency(item.price)}</span>
					<time dateTime={item.publishedAt} className="text-muted-foreground">
						{formatDate(item.publishedAt, { dateStyle: "medium" })}
					</time>
				</div>
				{item.tags.length > 0 ? (
					<ul className="flex flex-wrap gap-1" aria-label={m.test_crud_public_tags()}>
						{item.tags.map((tag) => (
							<li key={tag}>
								<Badge variant="secondary">{tag}</Badge>
							</li>
						))}
					</ul>
				) : null}
			</div>
		</article>
	);
}

/** Same footprint as PublicCard, for pending navigations. */
export function PublicCardSkeleton() {
	return (
		<div className="flex w-full min-w-0 flex-col overflow-hidden rounded-xl border" aria-hidden>
			<div className="aspect-[16/9] animate-pulse bg-muted" />
			<div className="flex flex-col gap-3 p-4">
				<div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
				<div className="h-4 w-full animate-pulse rounded bg-muted" />
				<div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
				<div className="flex justify-between">
					<div className="h-4 w-20 animate-pulse rounded bg-muted" />
					<div className="h-4 w-24 animate-pulse rounded bg-muted" />
				</div>
			</div>
		</div>
	);
}
