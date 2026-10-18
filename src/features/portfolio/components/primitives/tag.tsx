import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

/** A hairline pill for disciplines, tags and stack items. */
export function Tag({ className, children }: { className?: string | undefined; children: ReactNode }) {
	return (
		<span
			className={cn(
				"pf-label inline-flex items-center rounded-full border border-pf-line px-3 py-1 text-pf-ink-2",
				className,
			)}
		>
			{children}
		</span>
	);
}

/** A row of tags as a list (so screen readers announce the count). */
export function TagList({
	items,
	label,
	className,
}: {
	items: ReadonlyArray<string>;
	label?: string | undefined;
	className?: string | undefined;
}) {
	return (
		<ul aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
			{items.map((item) => (
				<li key={item}>
					<Tag>{item}</Tag>
				</li>
			))}
		</ul>
	);
}
