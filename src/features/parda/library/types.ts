/**
 * What the library functions return (decision 0236): lean, like the catalogue's answers.
 */

export type LibraryMedia = "movie" | "tv";

/** The title page's main action, from the profile's progress. */
export type TitleCta =
	| { kind: "resume"; season: number | null; episode: number | null; left: number | null; share: number }
	| { kind: "next"; season: number; episode: number }
	/** Every aired episode watched; the next one airs later (`season`, `episode`). */
	| { kind: "caughtUp"; season: number; episode: number }
	| { kind: "rewatch" };

export type EpisodeProgress = { season: number; episode: number; share: number; finished: boolean };

export type TitleProgressData = {
	cta: TitleCta | null;
	/** The movie's own bar (a series has none). */
	share: number | null;
	episodes: EpisodeProgress[];
};

export type ContinueItem = {
	media: LibraryMedia;
	id: number;
	slug: string;
	title: string;
	backdrop: string | null;
	poster: string | null;
	/** What its card's action does. */
	cta: Extract<TitleCta, { kind: "resume" | "next" }>;
	/** The bar under the picture: the share of the movie or episode watched. */
	share: number;
};

export type ContinueRailData = { imageBase: string; items: ContinueItem[] };

/** Who's watching, for the frame: the profile, and when a guest's data is deleted. */
export type PardaViewerData = {
	profile: { id: string; name: string; autoplay: boolean };
	isGuest: boolean;
	/** ISO time; null for an account. */
	guestDeletesAt: string | null;
};
