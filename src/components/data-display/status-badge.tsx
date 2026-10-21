import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StatusTone = "neutral" | "success" | "warning" | "info" | "danger";

const TONES: Record<StatusTone, string> = {
	neutral: "bg-muted text-muted-foreground",
	success: "bg-success-subtle text-success",
	warning: "bg-warning-subtle text-warning",
	info: "bg-info-subtle text-info",
	danger: "bg-danger-subtle text-danger",
};

/**
 * A state in a word ("Published", "Banned"), tinted by Graphite's status tokens
 * (each pair is 4.5:1 in every theme and accent, tests/unit/design-tokens.test.ts).
 * The dot repeats the colour; the word carries the meaning, so colour is never the
 * only signal.
 */
export function StatusBadge({
	tone = "neutral",
	children,
	className,
}: {
	tone?: StatusTone;
	children: ReactNode;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 font-medium text-caption",
				TONES[tone],
				className,
			)}
			data-tone={tone}
		>
			<span className="size-1.5 rounded-full bg-current" aria-hidden />
			{children}
		</span>
	);
}
