import { MAIN_CONTENT } from "@/components/layout/skip-link";
import { m } from "@/paraglide/messages";

/** Shown when a route's loader takes longer than the router's pending delay. */
export function PendingPage() {
	return (
		<main {...MAIN_CONTENT} className="mx-auto max-w-3xl px-4 py-16" aria-busy="true">
			<output className="flex items-center gap-3 text-muted-foreground">
				<span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
				{m.pending_loading()}
			</output>
		</main>
	);
}
