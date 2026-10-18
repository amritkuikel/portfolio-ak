import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { round, seededRandom } from "../../lib/seeded-random";

/**
 * A generated "screenshot": a browser window with an abstract interface
 * (a table, a chart or a card grid), seeded per project and screen. Used in
 * case study galleries until real screenshots exist. Decorative: the caption
 * beside it carries the meaning.
 */

const WIDTH = 1200;
const HEIGHT = 780;
const BAR = 56;
const SIDEBAR = 220;

type Rand = ReturnType<typeof seededRandom>;
type Area = { x: number; y: number; w: number; h: number };

function table(rand: Rand, area: Area): ReactNode {
	const rows = 9;
	const rowHeight = area.h / (rows + 1);
	const columns = [0.32, 0.22, 0.2, 0.18];
	return Array.from({ length: rows }, (_, row) => {
		const y = area.y + rowHeight * (row + 1);
		let x = area.x;
		return (
			<g key={round(y)}>
				<line x1={area.x} x2={area.x + area.w} y1={round(y)} y2={round(y)} className="stroke-pf-line" strokeWidth={2} />
				{columns.map((share, column) => {
					const width = area.w * share * rand.between(0.4, 0.85);
					const cell = (
						<rect
							key={round(x)}
							x={round(x)}
							y={round(y + rowHeight * 0.35)}
							width={round(width)}
							height={12}
							rx={6}
							className={column === 3 && rand.chance(0.25) ? "fill-pf-accent" : "fill-pf-stone"}
							opacity={column === 0 ? 0.9 : 0.45}
						/>
					);
					x += area.w * share + 12;
					return cell;
				})}
			</g>
		);
	});
}

function chart(rand: Rand, area: Area): ReactNode {
	const points = Array.from({ length: 13 }, (_, index) => {
		const x = area.x + (area.w / 12) * index;
		const y = area.y + area.h * (0.25 + rand.between(0, 0.5) * (1 - index / 18));
		return [round(x), round(y)] as const;
	});
	const line = points.map(([x, y]) => `${x},${y}`).join(" ");
	const fill = `${area.x},${area.y + area.h} ${line} ${area.x + area.w},${area.y + area.h}`;
	return (
		<>
			{[0.25, 0.5, 0.75].map((share) => (
				<line
					key={share}
					x1={area.x}
					x2={area.x + area.w}
					y1={round(area.y + area.h * share)}
					y2={round(area.y + area.h * share)}
					className="stroke-pf-line"
					strokeWidth={2}
				/>
			))}
			<polygon points={fill} className="fill-pf-accent" opacity={0.12} />
			<polyline points={line} fill="none" className="stroke-pf-accent" strokeWidth={5} strokeLinejoin="round" />
		</>
	);
}

function cards(rand: Rand, area: Area): ReactNode {
	const columns = 3;
	const gap = 20;
	const cardWidth = (area.w - gap * (columns - 1)) / columns;
	const cardHeight = (area.h - gap) / 2;
	return Array.from({ length: columns * 2 }, (_, index) => {
		const x = area.x + (index % columns) * (cardWidth + gap);
		const y = area.y + Math.floor(index / columns) * (cardHeight + gap);
		const position = `${round(x)}-${round(y)}`;
		return (
			<g key={position}>
				<rect
					x={round(x)}
					y={round(y)}
					width={round(cardWidth)}
					height={round(cardHeight)}
					rx={12}
					className="fill-pf-paper"
				/>
				<rect
					x={round(x + 16)}
					y={round(y + 16)}
					width={round(cardWidth - 32)}
					height={round(cardHeight * 0.55)}
					rx={8}
					className={rand.chance(0.3) ? "fill-pf-accent" : "fill-pf-stone"}
					opacity={0.5}
				/>
				<rect
					x={round(x + 16)}
					y={round(y + cardHeight * 0.72)}
					width={round(cardWidth * rand.between(0.3, 0.7))}
					height={12}
					rx={6}
					className="fill-pf-ink"
					opacity={0.7}
				/>
			</g>
		);
	});
}

const LAYOUTS = [table, chart, cards] as const;

type ScreenArtProps = {
	seed: string;
	/** Which screen of the project (picks the layout and the details). */
	screen: number;
	className?: string | undefined;
};

export function ScreenArt({ seed, screen, className }: ScreenArtProps) {
	const rand = seededRandom(`${seed}:screen:${screen}`);
	const layout = LAYOUTS[screen % LAYOUTS.length] ?? table;
	const content: Area = { x: SIDEBAR + 40, y: BAR + 110, w: WIDTH - SIDEBAR - 80, h: HEIGHT - BAR - 150 };
	const navRows = Array.from({ length: rand.int(4, 7) }, (_, row) => ({ row, y: BAR + 40 + row * 44 }));
	return (
		<svg
			viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
			className={cn("block h-auto w-full", className)}
			aria-hidden="true"
			focusable="false"
		>
			<rect width={WIDTH} height={HEIGHT} rx={20} className="fill-pf-paper-2 stroke-pf-line" strokeWidth={3} />
			<line x1={0} x2={WIDTH} y1={BAR} y2={BAR} className="stroke-pf-line" strokeWidth={3} />
			{[0, 1, 2].map((dot) => (
				<circle
					key={dot}
					cx={32 + dot * 26}
					cy={BAR / 2}
					r={8}
					className={dot === 0 ? "fill-pf-accent" : "fill-pf-stone"}
					opacity={dot === 0 ? 1 : 0.5}
				/>
			))}
			<rect x={WIDTH / 2 - 180} y={BAR / 2 - 13} width={360} height={26} rx={13} className="fill-pf-paper" />
			<line x1={SIDEBAR} x2={SIDEBAR} y1={BAR} y2={HEIGHT} className="stroke-pf-line" strokeWidth={3} />
			{navRows.map(({ row, y }) => (
				<rect
					key={y}
					x={32}
					y={y}
					width={round(SIDEBAR * rand.between(0.4, 0.7))}
					height={14}
					rx={7}
					className={row === 1 ? "fill-pf-ink" : "fill-pf-stone"}
					opacity={row === 1 ? 0.85 : 0.4}
				/>
			))}
			<rect
				x={content.x}
				y={BAR + 40}
				width={round(content.w * rand.between(0.25, 0.4))}
				height={28}
				rx={8}
				className="fill-pf-ink"
				opacity={0.85}
			/>
			{layout(rand, content)}
		</svg>
	);
}
