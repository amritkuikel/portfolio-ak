import "@tanstack/react-start/server-only";

/** A TMDB image the page renders with fixed dimensions, so nothing shifts (posters 2:3, backdrops 16:9). */
export type TmdbImageData = { src: string; srcSet: string; width: number; height: number };

const SIZES = {
	poster: { widths: [154, 342, 500, 780], src: 342, width: 2, height: 3 },
	backdrop: { widths: [300, 780, 1280], src: 780, width: 16, height: 9 },
} as const;

export function tmdbImage(imageBase: string, path: string | null, kind: keyof typeof SIZES): TmdbImageData | null {
	if (!path) return null;
	const { widths, src, width, height } = SIZES[kind];
	const base = imageBase.replace(/\/$/, "");
	return {
		src: `${base}/w${src}${path}`,
		srcSet: widths.map((size) => `${base}/w${size}${path} ${size}w`).join(", "),
		width,
		height,
	};
}
