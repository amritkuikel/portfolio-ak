import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { listPardaLabSources, openPardaLabPlayer } from "@/functions/parda-admin/player-lab";
import type { LabPlayerInput } from "./schema";

export const pardaLabSourcesQueryOptions = () =>
	queryOptions({ queryKey: ["parda-admin", "lab-sources"], queryFn: () => listPardaLabSources() });

export const openLabPlayerMutationOptions = () =>
	mutationOptions({ mutationFn: (data: LabPlayerInput) => openPardaLabPlayer({ data }) });
