import { cn } from "../../lib/cn";
import type { CoverMotif } from "../../schema";
import { Weave } from "./weave";

/**
 * Generative cover art: a piece of Dhaka cloth per project, with the
 * project's glyph on a woven label.
 *
 * The same seed weaves the same cloth on the server and in the browser (no
 * hydration mismatch), the colours are the design tokens (so covers follow the
 * theme), and the SVG fills a fixed aspect ratio, so it can't shift the
 * layout. No image files, no CSP changes (decisions 0108 and 0110).
 */

export const COVER_RATIOS = {
	portrait: { width: 800, height: 1000 },
	landscape: { width: 1200, height: 800 },
	wide: { width: 1600, height: 760 },
	square: { width: 1000, height: 1000 },
} as const;

export type CoverRatio = keyof typeof COVER_RATIOS;

/** The motif sets the scale of the weave: fine cloth for some projects, bold for others. */
const CELL: Record<CoverMotif, number> = {
	grid: 25,
	orbit: 40,
	waves: 20,
	blocks: 50,
	type: 32,
	terrain: 20,
	signal: 25,
};

type CoverArtProps = {
	/** Usually the project slug; a different seed weaves a different cloth. */
	seed: string;
	motif: CoverMotif;
	/** One to three characters, set on the label in the corner. */
	glyph: string;
	ratio?: CoverRatio;
	/** Accessible name; without it the art is decorative (aria-hidden). */
	title?: string | undefined;
	className?: string | undefined;
};

export function CoverArt({ seed, motif, glyph, ratio = "landscape", title, className }: CoverArtProps) {
	const { width, height } = COVER_RATIOS[ratio];
	const cell = CELL[motif];
	const columns = Math.ceil(width / cell);
	const rows = Math.ceil(height / cell);
	// The label: a cotton patch stitched to the bottom-left corner, sized in whole cells.
	const label = Math.round((Math.min(width, height) * 0.36) / cell) * cell;
	const fontSize = Math.round(label * (glyph.length > 1 ? 0.48 : 0.7));
	return (
		<Weave seed={`${seed}:${motif}`} columns={columns} rows={rows} cell={cell} title={title} className={cn(className)}>
			{/* A row of ground around the label keeps it apart from the cotton threads. */}
			<rect
				x={0}
				y={rows * cell - label - cell * 2}
				width={label + cell * 2}
				height={label + cell * 2}
				className="fill-pf-ink"
			/>
			<rect x={cell} y={rows * cell - label - cell} width={label} height={label} className="fill-pf-paper" />
			<text
				x={cell + label / 2}
				y={rows * cell - cell - label * 0.3}
				textAnchor="middle"
				className="pf-display fill-pf-ink"
				fontSize={fontSize}
			>
				{glyph}
			</text>
		</Weave>
	);
}
