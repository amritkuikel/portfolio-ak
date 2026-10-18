import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

const ASPECTS = {
	portrait: "aspect-[4/5]",
	landscape: "aspect-[3/2]",
	wide: "aspect-[1600/760]",
	square: "aspect-square",
} as const;

type CoverFrameProps = {
	/**
	 * Shared-element name: the same slug on a work card and on the case study
	 * hero lets the browser morph one into the other (a View Transition).
	 * Only one element per page may use a given slug.
	 */
	transitionSlug?: string | undefined;
	aspect?: keyof typeof ASPECTS;
	/** Zoom the art slightly on hover/focus of the enclosing link. */
	zoom?: boolean;
	className?: string | undefined;
	children: ReactNode;
};

/** A fixed-ratio, clipped box for cover art: reserves its space, so it never shifts the layout. */
export function CoverFrame({
	transitionSlug,
	aspect = "landscape",
	zoom = false,
	className,
	children,
}: CoverFrameProps) {
	return (
		<div
			className={cn("relative overflow-clip bg-pf-paper-2", ASPECTS[aspect], zoom && "pf-zoom", className)}
			style={transitionSlug ? { viewTransitionName: `pf-cover-${transitionSlug}` } : undefined}
			data-pf-cover={transitionSlug ? "" : undefined}
		>
			{children}
		</div>
	);
}
