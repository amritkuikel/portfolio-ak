import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ImageIcon } from "lucide-react";
import { errorMessage } from "@/components/errors/error-page";
import { useCloseOverlay } from "@/components/navigation/use-close-overlay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CloudImage } from "@/features/attachments/components/cloud-image";
import { formatCurrency, formatDate } from "@/lib/i18n/intl";
import { m } from "@/paraglide/messages";
import { publicTestCrudDetailQueryOptions } from "../queries";

const CLOSE = { view: undefined };

/** The dialog for `?view=<slug>` (opened by QuickViewLink, a masked route): the essentials and a link to the full page. */
export function TestCrudQuickView({ slug }: { slug: string }) {
	const close = useCloseOverlay(CLOSE);
	const { data: item, error } = useQuery(publicTestCrudDetailQueryOptions(slug));
	return (
		<Dialog open onOpenChange={(open) => !open && close()}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl" data-testid="quick-view">
				<div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-muted">
					{item?.image ? (
						<CloudImage
							image={item.image}
							variant="cover"
							sizes="(min-width: 640px) 576px, 100vw"
							className="absolute inset-0 size-full object-cover"
						/>
					) : (
						<div className="flex size-full items-center justify-center">
							<ImageIcon className="size-8 text-muted-foreground/60" aria-hidden />
						</div>
					)}
				</div>
				<DialogHeader>
					<DialogTitle className="text-xl leading-snug">{item?.title ?? m.test_crud_loading_item()}</DialogTitle>
					<DialogDescription>
						{item
							? m.test_crud_public_published_on({ date: formatDate(item.publishedAt, { dateStyle: "long" }) })
							: error
								? errorMessage(error)
								: " "}
					</DialogDescription>
				</DialogHeader>
				{item ? (
					<div className="flex flex-col gap-4">
						{item.summary ? <p className="text-muted-foreground">{item.summary}</p> : null}
						<div className="flex flex-wrap items-center justify-between gap-3">
							<span className="font-medium text-lg tabular-nums">{formatCurrency(item.price)}</span>
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
						<Button asChild className="self-start">
							<Link to="/test-crud/$slug" params={{ slug }}>
								{m.test_crud_open_full_page()}
							</Link>
						</Button>
					</div>
				) : error ? null : (
					<output className="flex flex-col gap-3" aria-busy="true">
						<span className="sr-only">{m.test_crud_loading_item()}</span>
						<span className="block h-5 w-full animate-pulse rounded bg-muted" />
						<span className="block h-5 w-2/3 animate-pulse rounded bg-muted" />
						<span className="block h-9 w-40 animate-pulse rounded-md bg-muted" />
					</output>
				)}
			</DialogContent>
		</Dialog>
	);
}
