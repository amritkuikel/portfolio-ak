import type { ReactNode } from "react";
import { formatNumber } from "@/lib/intl";
import { cn } from "../../lib/cn";

/** "07" in the page's digits (०७ in Nepali). */
export const formatIndex = (index: number): string => formatNumber(index, { minimumIntegerDigits: 2 });

type EyebrowProps = {
	/** Chapter number, shown in the accent colour before the label. */
	index?: number | undefined;
	id?: string | undefined;
	className?: string | undefined;
	children: ReactNode;
};

/** The small mono label above a heading: "01 —— Selected work". */
export function Eyebrow({ index, id, className, children }: EyebrowProps) {
	return (
		<p id={id} className={cn("pf-label flex items-center gap-3 text-pf-stone", className)}>
			{index !== undefined ? <span className="text-pf-accent">{formatIndex(index)}</span> : null}
			<span aria-hidden className="h-px w-8 shrink-0 bg-current" />
			<span>{children}</span>
		</p>
	);
}
