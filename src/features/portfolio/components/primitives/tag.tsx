import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

/** A woven-label tag for disciplines, tags and stack items: a cotton patch with a thread down its edge. */
export function Tag({ className, children }: { className?: string | undefined; children: ReactNode }) {
	return (
		<span
			className={cn(
				"pf-label inline-flex items-center border-pf-ink border-l-2 bg-pf-paper-2 px-2.5 py-1 text-pf-ink-2",
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
