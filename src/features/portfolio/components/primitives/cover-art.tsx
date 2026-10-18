import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { round, seededRandom } from "../../lib/seeded-random";
import type { CoverMotif } from "../../schema";

/**
 * Generative cover art: a deterministic SVG composition per project.
 *
 * The same seed draws the same picture on the server and in the browser (no
 * hydration mismatch), the colours are the design tokens (so covers follow the
 * theme and the inverse bands), and the SVG fills a fixed aspect ratio, so it
 * can't shift the layout. No image files, no CSP changes (decision 0108).
 */

export const COVER_RATIOS = {
	portrait: { width: 800, height: 1000 },
	landscape: { width: 1200, height: 800 },
	wide: { width: 1600, height: 760 },
	square: { width: 1000, height: 1000 },
} as const;

export type CoverRatio = keyof typeof COVER_RATIOS;

type Rand = ReturnType<typeof seededRandom>;
type Canvas = { rand: Rand; width: number; height: number };

const INK = "fill-pf-ink";
const ACCENT = "fill-pf-accent";
const PAPER = "fill-pf-paper";

function grid({ rand, width, height }: Canvas): ReactNode {
	const columns = rand.int(7, 11);
	const size = width / columns;
	const rows = Math.ceil(height / size);
	const cells: ReactNode[] = [];
	for (let row = 0; row < rows; row++) {
		for (let column = 0; column < columns; column++) {
			const x = round(column * size);
			const y = round(row * size);
			const key = `${row}-${column}`;
			if (rand.chance(0.1)) {
				cells.push(<rect key={key} x={x} y={y} width={round(size)} height={round(size)} className={ACCENT} />);
			} else if (rand.chance(0.22)) {
				cells.push(
					<circle key={key} cx={round(x + size / 2)} cy={round(y + size / 2)} r={round(size * 0.08)} className={INK} />,
				);
			}
		}
	}
	const lines = Array.from({ length: columns + 1 }, (_, index) => round(index * size));
	return (
		<>
			{lines.map((x) => (
				<line key={`v${x}`} x1={x} x2={x} y1={0} y2={height} className="stroke-pf-line" strokeWidth={1.5} />
			))}
			{Array.from({ length: rows + 1 }, (_, index) => round(index * size)).map((y) => (
				<line key={`h${y}`} x1={0} x2={width} y1={y} y2={y} className="stroke-pf-line" strokeWidth={1.5} />
			))}
			{cells}
		</>
	);
}

function orbit({ rand, width, height }: Canvas): ReactNode {
	const cx = round(width * rand.between(0.5, 0.68));
	const cy = round(height * rand.between(0.3, 0.45));
	const rings = rand.int(5, 8);
	const step = Math.min(width, height) * rand.between(0.07, 0.1);
	return (
		<>
			{Array.from({ length: rings }, (_, index) => {
				const r = round(step * (index + 1));
				const angle = rand.between(0, Math.PI * 2);
				return (
					<g key={r}>
						<circle
							cx={cx}
							cy={cy}
							r={r}
							fill="none"
							className="stroke-pf-ink"
							strokeWidth={index === rings - 1 ? 3 : 1.5}
							strokeDasharray={rand.chance(0.3) ? "6 10" : undefined}
						/>
						<circle
							cx={round(cx + Math.cos(angle) * r)}
							cy={round(cy + Math.sin(angle) * r)}
							r={round(rand.between(6, 16))}
							className={rand.chance(0.35) ? ACCENT : INK}
						/>
					</g>
				);
			})}
			<circle cx={cx} cy={cy} r={round(step * 0.7)} className={ACCENT} />
		</>
	);
}

function waves({ rand, width, height }: Canvas): ReactNode {
	const count = rand.int(14, 20);
	const accentLine = rand.int(3, count - 4);
	const gap = (height * 0.62) / count;
	const frequency = rand.between(1.2, 2.6);
	return Array.from({ length: count }, (_, index) => {
		const baseline = height * 0.08 + gap * index;
		const amplitude = gap * rand.between(0.6, 1.8);
		const phase = rand.between(0, Math.PI * 2);
		const points = Array.from({ length: 41 }, (_, step) => {
			const x = (width / 40) * step;
			const y = baseline + Math.sin((step / 40) * Math.PI * 2 * frequency + phase + index * 0.25) * amplitude;
			return `${round(x)},${round(y)}`;
		}).join(" ");
		const accent = index === accentLine;
		return (
			<polyline
				key={baseline}
				points={points}
				fill="none"
				className={accent ? "stroke-pf-accent" : "stroke-pf-ink"}
				strokeWidth={accent ? 5 : 1.5}
			/>
		);
	});
}

function blocks({ rand, width, height }: Canvas): ReactNode {
	type Box = { x: number; y: number; w: number; h: number };
	const boxes: Box[] = [];
	const split = (box: Box, depth: number) => {
		if (depth === 0 || (depth < 3 && rand.chance(0.25)) || box.w < width * 0.12 || box.h < height * 0.1) {
			boxes.push(box);
			return;
		}
		const vertical = box.w / box.h > 1 ? rand.chance(0.7) : rand.chance(0.3);
		const ratio = rand.between(0.3, 0.7);
		if (vertical) {
			split({ ...box, w: box.w * ratio }, depth - 1);
			split({ ...box, x: box.x + box.w * ratio, w: box.w * (1 - ratio) }, depth - 1);
		} else {
			split({ ...box, h: box.h * ratio }, depth - 1);
			split({ ...box, y: box.y + box.h * ratio, h: box.h * (1 - ratio) }, depth - 1);
		}
	};
	split({ x: 0, y: 0, w: width, h: height * 0.66 }, 5);
	return boxes.map((box) => {
		const roll = rand.next();
		const fill = roll < 0.16 ? ACCENT : roll < 0.28 ? INK : "fill-pf-paper-2";
		return (
			<rect
				key={`${round(box.x)}-${round(box.y)}`}
				x={round(box.x)}
				y={round(box.y)}
				width={round(box.w)}
				height={round(box.h)}
				className={cn(fill, "stroke-pf-ink")}
				strokeWidth={6}
			/>
		);
	});
}

function typeSpecimen({ rand, width, height }: Canvas): ReactNode {
	const baselines = Array.from({ length: 12 }, (_, index) => round(height * 0.06 + index * height * 0.05));
	const labels = ["0x2A", "{ }", "=>", "$_", "fn()", "</>", "&&", "::"];
	return (
		<>
			{baselines.map((y) => (
				<line key={y} x1={0} x2={width} y1={y} y2={y} className="stroke-pf-line" strokeWidth={1.5} />
			))}
			{baselines.slice(1, 9).map((y, index) => (
				<text
					key={`label-${y}`}
					x={round(width * rand.between(0.05, 0.75))}
					y={round(y - 6)}
					className={cn("font-pf-mono", index % 3 === 0 ? ACCENT : INK)}
					fontSize={round(height * 0.03)}
				>
					{labels[index % labels.length]}
				</text>
			))}
			<rect
				x={round(width * rand.between(0.55, 0.75))}
				y={round(height * 0.12)}
				width={round(width * 0.05)}
				height={round(height * 0.3)}
				className={ACCENT}
			/>
		</>
	);
}

function terrain({ rand, width, height }: Canvas): ReactNode {
	const ridges = rand.int(6, 9);
	const sunX = round(width * rand.between(0.55, 0.8));
	const sunY = round(height * rand.between(0.16, 0.26));
	return (
		<>
			<circle cx={sunX} cy={sunY} r={round(Math.min(width, height) * 0.1)} className={ACCENT} />
			{Array.from({ length: ridges }, (_, index) => {
				const top = height * (0.24 + index * (0.42 / ridges));
				let y = top + rand.between(0, height * 0.1);
				const points = [`0,${round(height)}`];
				for (let step = 0; step <= 24; step++) {
					y = Math.min(height * 0.85, Math.max(top - height * 0.12, y + rand.between(-height * 0.05, height * 0.05)));
					points.push(`${round((width / 24) * step)},${round(y)}`);
				}
				points.push(`${round(width)},${round(height)}`);
				return (
					<polygon
						key={top}
						points={points.join(" ")}
						className={cn(index % 2 === 0 ? PAPER : "fill-pf-paper-2", "stroke-pf-ink")}
						strokeWidth={2}
						strokeLinejoin="round"
					/>
				);
			})}
		</>
	);
}

function signal({ rand, width, height }: Canvas): ReactNode {
	const bars = rand.int(18, 28);
	const slot = width / bars;
	const peak = rand.int(4, bars - 5);
	return Array.from({ length: bars }, (_, index) => {
		const distance = Math.abs(index - peak) / bars;
		const barHeight = height * 0.6 * Math.max(0.08, 1 - distance * 2.2) * rand.between(0.55, 1);
		const x = round(index * slot + slot * 0.2);
		return (
			<rect
				key={x}
				x={x}
				y={round(height * 0.68 - barHeight)}
				width={round(slot * 0.6)}
				height={round(barHeight)}
				className={index === peak ? ACCENT : INK}
			/>
		);
	});
}

const MOTIFS: Record<CoverMotif, (canvas: Canvas) => ReactNode> = {
	grid,
	orbit,
	waves,
	blocks,
	type: typeSpecimen,
	terrain,
	signal,
};

type CoverArtProps = {
	/** Usually the project slug; a different seed draws a different picture. */
	seed: string;
	motif: CoverMotif;
	/** One to three characters, set huge in the corner. */
	glyph: string;
	ratio?: CoverRatio;
	/** Accessible name; without it the art is decorative (aria-hidden). */
	title?: string | undefined;
	className?: string | undefined;
};

export function CoverArt({ seed, motif, glyph, ratio = "landscape", title, className }: CoverArtProps) {
	const { width, height } = COVER_RATIOS[ratio];
	const rand = seededRandom(`${seed}:${motif}:${ratio}`);
	return (
		<svg
			viewBox={`0 0 ${width} ${height}`}
			preserveAspectRatio="xMidYMid slice"
			className={cn("block h-full w-full", className)}
			role={title ? "img" : undefined}
			aria-label={title}
			aria-hidden={title ? undefined : true}
			focusable="false"
		>
			<rect width={width} height={height} className="fill-pf-paper-2" />
			{MOTIFS[motif]({ rand, width, height })}
			<text
				x={round(width * 0.05)}
				y={round(height * 0.94)}
				className="pf-display fill-pf-ink"
				fontSize={round(Math.min(width, height) * 0.34)}
			>
				{glyph}
			</text>
		</svg>
	);
}
