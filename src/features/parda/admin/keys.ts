import type { PardaReportListInput, PardaTakedownListInput } from "./search";

/** Parda's admin reads, under one root so a write can refresh what it touched. */
const all = ["parda-admin"] as const;

export const pardaAdminKeys = {
	all,
	labSources: () => [...all, "lab-sources"] as const,
	sources: () => [...all, "sources", "list"] as const,
	source: (id: string) => [...all, "source", id] as const,
	takedowns: () => [...all, "takedowns"] as const,
	takedownList: (input: PardaTakedownListInput) => [...all, "takedowns", input] as const,
	reports: () => [...all, "reports"] as const,
	reportList: (input: PardaReportListInput) => [...all, "reports", input] as const,
	settings: () => [...all, "settings"] as const,
};
