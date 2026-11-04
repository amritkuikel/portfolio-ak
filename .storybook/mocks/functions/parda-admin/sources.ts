import { fn } from "storybook/test";
import type { AdminSource } from "../../../../src/features/parda/admin/schema";

// Stand-ins for src/functions/parda-admin/sources.ts: the seeded servers, one pinned, one disabled.
const server = (n: number, extra: Partial<AdminSource> = {}): AdminSource => ({
	id: `00000000-0000-4000-8000-00000000000${n}`,
	name: { en: `Server ${n}`, ne: `सर्भर ${n}` },
	movieTemplate: `/parda/api/${n}/movie/{id}?start={start}&lang={lang}`,
	tvTemplate: `/parda/api/${n}/tv/{id}/{season}/{episode}?start={start}&lang={lang}`,
	origins: [],
	adapter: "parda",
	sandbox: "none",
	adaptive: n % 2 === 0,
	needsClick: false,
	cdnGroup: n <= 2 ? "placeholder-a" : "placeholder-b",
	autoFallback: true,
	enabled: true,
	pinned: false,
	position: n - 1,
	updatedAt: "1",
	openReports: 0,
	adsReports: 0,
	...extra,
});

export const PARDA_STORY_SOURCES: AdminSource[] = [
	server(1, { pinned: true, openReports: 3, adsReports: 1 }),
	server(2),
	server(3, { sandbox: "popups" }),
	server(4, { enabled: false }),
];

export const listPardaSources = fn(async (): Promise<AdminSource[]> => PARDA_STORY_SOURCES).mockName(
	"listPardaSources",
);
export const getPardaSource = fn(async (): Promise<AdminSource> => server(1)).mockName("getPardaSource");
export const createPardaSource = fn(async (): Promise<AdminSource> => server(5)).mockName("createPardaSource");
export const updatePardaSource = fn(async (): Promise<AdminSource> => server(1)).mockName("updatePardaSource");
export const setPardaSourceState = fn(async (): Promise<AdminSource> => server(1)).mockName("setPardaSourceState");
export const reorderPardaSources = fn(async (): Promise<{ moved: number }> => ({ moved: 0 })).mockName(
	"reorderPardaSources",
);
export const deletePardaSources = fn(async (): Promise<{ deleted: number }> => ({ deleted: 1 })).mockName(
	"deletePardaSources",
);
