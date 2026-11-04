import "@tanstack/react-start/server-only";
import type { PardaImage } from "@/features/parda/kit/image";

/** A TMDB image the page renders with fixed dimensions, so nothing shifts (posters and profiles 2:3, backdrops and stills 16:9). */
export type TmdbImageData = PardaImage;

/** TMDB's own sizes per kind (its configuration endpoint lists them; they've been stable for years). */
const SIZES = {
	poster: { widths: [154, 342, 500, 780], src: 342, width: 2, height: 3 },
	backdrop: { widths: [300, 780, 1280], src: 780, width: 16, height: 9 },
	still: { widths: [185, 300], src: 300, width: 16, height: 9 },
	profile: { widths: [185], src: 185, width: 2, height: 3 },
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
