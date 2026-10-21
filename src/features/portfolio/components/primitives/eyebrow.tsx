import type { ReactNode } from "react";
import { formatNumber } from "@/lib/i18n/intl";
import { cn } from "../../lib/cn";

/** "07" in the page's digits (०७ in Nepali), for real sequences such as process steps. */
export const formatIndex = (index: number): string => formatNumber(index, { minimumIntegerDigits: 2 });

/** Each chapter of the story takes the next thread, so the page reads like bands of cloth. */
const THREAD_BG = ["bg-pf-crimson", "bg-pf-marigold", "bg-pf-jade"] as const;

export const threadBg = (index: number | undefined): string => THREAD_BG[(index ?? 0) % THREAD_BG.length] as string;

type EyebrowProps = {
	/** Chapter position in the story: picks the thread colour of the marker. */
	index?: number | undefined;
	id?: string | undefined;
	className?: string | undefined;
	children: ReactNode;
};

/** The small label above a heading, marked with a stepped diamond in the chapter's thread. */
export function Eyebrow({ index, id, className, children }: EyebrowProps) {
	return (
		<p id={id} className={cn("pf-label flex items-center gap-2.5 text-pf-ink-2", className)}>
			<span aria-hidden className={cn("size-2.5 shrink-0 rotate-45", threadBg(index))} />
			<span>{children}</span>
		</p>
	);
}
