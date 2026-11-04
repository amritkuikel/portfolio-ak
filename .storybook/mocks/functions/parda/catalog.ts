import { fn } from "storybook/test";
import type { HubPageData, HubRailData } from "../../../../src/features/parda/home/types";
import type { TitlePageData } from "../../../../src/features/parda/title/types";

// Stand-ins for src/functions/parda/catalog.ts: the catalogue isn't configured in the workshop.
export const getPardaHub = fn(async (): Promise<HubPageData> => ({ configured: false })).mockName("getPardaHub");
export const getPardaRail = fn(async (): Promise<HubRailData> => ({ imageBase: "", titles: null })).mockName(
	"getPardaRail",
);
export const getPardaTitle = fn(async (): Promise<TitlePageData> => ({ configured: false })).mockName("getPardaTitle");
