import { m } from "@/paraglide/messages";
import { cn } from "../../lib/cn";
import type { Profile } from "../../types";

type Status = Profile["availability"]["status"];

const LABELS: Record<Status, () => string> = {
	open: m.portfolio_availability_open,
	limited: m.portfolio_availability_limited,
	closed: m.portfolio_availability_closed,
};

/** "◆ Limited availability": a pulsing diamond (jade when open, marigold when limited) and the status. */
export function AvailabilityBadge({ status, className }: { status: Status; className?: string | undefined }) {
	return (
		<span className={cn("pf-label inline-flex items-center gap-2", className)}>
			<span aria-hidden className="relative flex size-2">
				{status === "closed" ? null : (
					<span
						className={cn(
							"absolute inline-flex size-full rotate-45 animate-ping opacity-60 motion-reduce:hidden",
							status === "open" ? "bg-pf-jade" : "bg-pf-marigold",
						)}
					/>
				)}
				<span
					className={cn(
						"relative inline-flex size-2 rotate-45",
						status === "closed" ? "bg-pf-stone" : status === "open" ? "bg-pf-jade" : "bg-pf-marigold",
					)}
				/>
			</span>
			{LABELS[status]()}
		</span>
	);
}
