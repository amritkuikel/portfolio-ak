import { seededRandom } from "./seeded-random";

/**
 * Dhaka weaving in code: the stepped, symmetric patterns of Palpa's handloom
 * cloth, generated on a grid of cells (decision 0110).
 *
 * The cloth is a stack of horizontal bands, like the weft rows of a loom:
 * solid stripes, zigzags, stepped diamonds, triangles and checks. Each band is
 * a pure function of its cell (column, row), centred so the cloth mirrors
 * left to right. A seed picks the bands and their threads, so the same seed
 * draws the same cloth on the server and in the browser. Adjacent cells of one
 * thread merge into runs, which keeps the SVG small.
 */

export const THREADS = ["crimson", "marigold", "jade", "cotton"] as const;
export type Thread = (typeof THREADS)[number];

/** A horizontal run of cells in one thread, in cell units. */
export type WeaveRun = { x: number; y: number; width: number; thread: Thread };

type BandKind = "stripe" | "zigzag" | "diamonds" | "triangles" | "checks";

/** A cell's thread, or null for the ground. */
type Pattern = (column: number, row: number) => Thread | null;

type Band = { height: number; pattern: Pattern };

const mod = (value: number, period: number) => ((value % period) + period) % period;

type Rand = ReturnType<typeof seededRandom>;

const pick = <T>(rand: Rand, items: ReadonlyArray<T>): T => items[rand.int(0, items.length - 1)] as T;

/** Two or three different threads, in a seeded order. */
const threads = (rand: Rand, count: 2 | 3): Thread[] => {
	const pool = [...THREADS];
	const chosen: Thread[] = [];
	for (let index = 0; index < count; index++) {
		chosen.push(pool.splice(rand.int(0, pool.length - 1), 1)[0] as Thread);
	}
	return chosen;
};

function band(kind: BandKind, rand: Rand): Band {
	switch (kind) {
		case "stripe": {
			// Never a cotton stripe: a full row of cotton reads as a hole in the cloth.
			const thread = pick(rand, ["crimson", "marigold", "jade"] as const);
			return { height: rand.int(1, 2), pattern: () => thread };
		}
		case "checks": {
			const [a, b] = threads(rand, 2);
			return { height: 2, pattern: (x, y) => (mod(x + y, 2) === 0 ? (a as Thread) : (b as Thread)) };
		}
		case "zigzag": {
			const [a, b] = threads(rand, 2);
			const reach = rand.int(2, 4);
			// A two-row line bouncing between the band's top and bottom.
			return {
				height: reach + 2,
				pattern: (x, y) => {
					const phase = mod(x, reach * 2);
					const top = phase <= reach ? phase : reach * 2 - phase;
					if (y === top) return a as Thread;
					if (y === top + 1) return b as Thread;
					return null;
				},
			};
		}
		case "triangles": {
			const [a, b] = threads(rand, 2);
			const size = rand.int(3, 5);
			// Stepped triangles pointing up, alternating threads.
			return {
				height: size,
				pattern: (x, y) => {
					const phase = mod(x + size, size * 2);
					const reach = Math.abs(phase - size + 0.5);
					if (reach > y + 0.5) return null;
					return Math.floor((x + size) / (size * 2)) % 2 === 0 ? (a as Thread) : (b as Thread);
				},
			};
		}
		case "diamonds": {
			const [outline, fill, heart] = threads(rand, 3);
			const radius = rand.int(3, 6);
			const period = radius * 2 + 2;
			// Stepped lozenges: an outline, a filled core and a heart; the gap between them shows the ground.
			return {
				height: radius * 2 + 1,
				pattern: (x, y) => {
					const dx = Math.abs(mod(x + radius, period) - radius);
					const distance = dx + Math.abs(y - radius);
					if (distance === radius) return outline as Thread;
					if (distance === 0) return heart as Thread;
					if (distance <= radius - 2) return fill as Thread;
					return null;
				},
			};
		}
	}
}

/** A cloth's rhythm: a feature band, framed by stripes and smaller borders. */
const FEATURES: ReadonlyArray<BandKind> = ["diamonds", "diamonds", "zigzag", "triangles"];
const BORDERS: ReadonlyArray<BandKind> = ["stripe", "checks", "zigzag", "stripe"];

/**
 * Weaves `columns` × `rows` cells from a seed and returns the runs of thread.
 * Cells not covered by a run are the ground (draw it behind the runs).
 */
export function weave({ seed, columns, rows }: { seed: string; columns: number; rows: number }): WeaveRun[] {
	const rand = seededRandom(`weave:${seed}`);
	const centre = Math.floor(columns / 2);
	const runs: WeaveRun[] = [];
	let row = 0;
	let step = 0;
	while (row < rows) {
		// Borders and features alternate, with a row of ground between bands.
		const kind = pick(rand, step % 2 === 0 ? BORDERS : FEATURES);
		const { height, pattern } = band(kind, rand);
		for (let y = 0; y < height && row + y < rows; y++) {
			let start = 0;
			let current: Thread | null = null;
			for (let x = 0; x <= columns; x++) {
				const thread = x < columns ? pattern(x - centre, y) : null;
				if (thread === current) continue;
				if (current) runs.push({ x: start, y: row + y, width: x - start, thread: current });
				current = thread;
				start = x;
			}
		}
		row += height + 1;
		step++;
	}
	return runs;
}
