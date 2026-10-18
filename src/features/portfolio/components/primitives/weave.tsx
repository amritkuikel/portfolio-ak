import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { type Thread, weave } from "../../lib/weave";

/** Thread → fill class. The ground is the ink token, so cotton is the paper token (it flips with the theme). */
export const THREAD_FILL: Record<Thread, string> = {
	crimson: "fill-pf-crimson",
	marigold: "fill-pf-marigold",
	jade: "fill-pf-jade",
	cotton: "fill-pf-paper",
};

type WeaveProps = {
	seed: string;
	columns: number;
	rows: number;
	/** Pixels per cell in the viewBox (integers keep the edges crisp). */
	cell?: number;
	/** Weave in row by row on load (the hero's one motion moment). */
	animate?: boolean;
	/** Drawn on top of the cloth, in viewBox units (columns × cell). */
	children?: ReactNode;
	/** Accessible name; without it the cloth is decorative (aria-hidden). */
	title?: string | undefined;
	className?: string | undefined;
};

/**
 * A piece of generated Dhaka cloth (lib/weave.ts) as SVG: an ink ground and
 * threads of crimson, marigold, jade and cotton. It fills its box (slice), so
 * give it a sized parent; the same seed always weaves the same cloth.
 */
export function Weave({ seed, columns, rows, cell = 10, animate = false, children, title, className }: WeaveProps) {
	const runs = weave({ seed, columns, rows });
	const width = columns * cell;
	const height = rows * cell;
	return (
		<svg
			viewBox={`0 0 ${width} ${height}`}
			preserveAspectRatio="xMidYMid slice"
			shapeRendering="crispEdges"
			className={cn("block h-full w-full bg-pf-ink", animate && "pf-weaving", className)}
			role={title ? "img" : undefined}
			aria-label={title}
			aria-hidden={title ? undefined : true}
			focusable="false"
		>
			{runs.map((run) => (
				<rect
					key={`${run.x}-${run.y}`}
					x={run.x * cell}
					y={run.y * cell}
					width={run.width * cell}
					height={cell}
					className={THREAD_FILL[run.thread]}
				/>
			))}
			{children}
		</svg>
	);
}
