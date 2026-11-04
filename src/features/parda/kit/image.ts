/**
 * A TMDB image as the server builds it (src/server/parda/tmdb/images.ts): a default
 * `src`, a width-described `srcSet`, and the aspect as `width`/`height` (2:3 or 16:9),
 * so the box is sized before the file arrives and nothing shifts.
 */
export type PardaImage = { src: string; srcSet: string; width: number; height: number };
