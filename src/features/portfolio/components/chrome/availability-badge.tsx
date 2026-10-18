import { m } from "@/paraglide/messages";
import { cn } from "../../lib/cn";
import type { Profile } from "../../types";

type Status = Profile["availability"]["status"];

const LABELS: Record<Status, () => string> = {
	open: m.portfolio_availability_open,
	limited: m.portfolio_availability_limited,
	closed: m.portfolio_availability_closed,
};

/** "● Limited availability": a pulsing dot (accent when open or limited) and the status. */
export function AvailabilityBadge({ status, className }: { status: Status; className?: string | undefined }) {
	return (
		<span className={cn("pf-label inline-flex items-center gap-2", className)}>
			<span aria-hidden className="relative flex size-2">
				{status === "closed" ? null : (
					<span className="absolute inline-flex size-full animate-ping rounded-full bg-pf-accent opacity-60 motion-reduce:hidden" />
				)}
				<span
					className={cn(
						"relative inline-flex size-2 rounded-full",
						status === "closed" ? "bg-pf-stone" : "bg-pf-accent",
					)}
				/>
			</span>
			{LABELS[status]()}
		</span>
	);
}
