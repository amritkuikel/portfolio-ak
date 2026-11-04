import { fn } from "storybook/test";
import type {
	ContinueRailData,
	PardaViewerData,
	TitleProgressData,
} from "../../../../src/features/parda/library/types";

// Stand-ins for src/functions/parda/library.ts: nobody is signed in to the workshop, so nothing is saved.
export const getPardaViewer = fn(
	async (): Promise<PardaViewerData> => ({
		profile: { id: "00000000-0000-4000-8000-000000000000", name: "Me", autoplay: true },
		isGuest: false,
		guestDeletesAt: null,
	}),
).mockName("getPardaViewer");
export const getPardaContinue = fn(async (): Promise<ContinueRailData> => ({ imageBase: "", items: [] })).mockName(
	"getPardaContinue",
);
export const getPardaTitleProgress = fn(
	async (): Promise<TitleProgressData> => ({ cta: null, share: null, episodes: [] }),
).mockName("getPardaTitleProgress");
export const savePardaProgress = fn(async () => ({ saved: true })).mockName("savePardaProgress");
export const markPardaWatched = fn(async () => ({ ok: true as const })).mockName("markPardaWatched");
export const removePardaContinue = fn(async () => ({ ok: true as const })).mockName("removePardaContinue");
export const rewatchPardaTitle = fn(async () => ({ ok: true as const })).mockName("rewatchPardaTitle");
export const importPardaProgress = fn(async () => ({ imported: 0 })).mockName("importPardaProgress");
