import { fn } from "storybook/test";
import type { HubPageData, HubRailData } from "../../../../src/features/parda/home/types";
import type {
	CollectionPageData,
	CreditsPageData,
	PersonPageData,
	SeasonData,
	SurpriseTarget,
	TitlePageData,
} from "../../../../src/features/parda/title/types";

// Stand-ins for src/functions/parda/catalog.ts: the catalogue isn't configured in the workshop.
export const getPardaHub = fn(async (): Promise<HubPageData> => ({ configured: false })).mockName("getPardaHub");
export const getPardaRail = fn(async (): Promise<HubRailData> => ({ imageBase: "", titles: null })).mockName(
	"getPardaRail",
);
export const getPardaTitle = fn(async (): Promise<TitlePageData> => ({ configured: false })).mockName("getPardaTitle");
export const getPardaSeason = fn(async (): Promise<SeasonData> => ({ configured: false })).mockName("getPardaSeason");
export const getPardaCredits = fn(async (): Promise<CreditsPageData> => ({ configured: false })).mockName(
	"getPardaCredits",
);
export const getPardaPerson = fn(async (): Promise<PersonPageData> => ({ configured: false })).mockName(
	"getPardaPerson",
);
export const getPardaCollection = fn(async (): Promise<CollectionPageData> => ({ configured: false })).mockName(
	"getPardaCollection",
);
export const getPardaSurprise = fn(async (): Promise<SurpriseTarget> => null).mockName("getPardaSurprise");
