import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

const SIZES = {
	mega: "text-pf-mega",
	hero: "text-pf-hero",
	h1: "text-pf-h1",
	h2: "text-pf-h2",
	h3: "text-pf-h3",
} as const;

export type DisplaySize = keyof typeof SIZES;

type DisplayProps = {
	/** The element: pick it for the outline, pick `size` for the look. */
	as?: "h1" | "h2" | "h3" | "p" | "span";
	size: DisplaySize;
	id?: string | undefined;
	className?: string | undefined;
	children: ReactNode;
};

/** Display type (Anek, condensed and heavy): heading level and visual size are chosen separately. */
export function Display({ as: Tag = "h2", size, id, className, children }: DisplayProps) {
	return (
		<Tag id={id} className={cn("pf-display", SIZES[size], className)}>
			{children}
		</Tag>
	);
}
