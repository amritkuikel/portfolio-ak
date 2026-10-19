import { type QueryClient, queryOptions } from "@tanstack/react-query";
import { get__Pascal__, list__Pascal__ } from "@/functions/__name__";
import type { __Pascal__ListInput } from "./schema";

/** Query keys: lists under ["__name__", "list", input], so one invalidation refreshes every page. */
export const __camel__Keys = {
	all: ["__name__"] as const,
	lists: () => [...__camel__Keys.all, "list"] as const,
	list: (input: __Pascal__ListInput) => [...__camel__Keys.lists(), input] as const,
	detail: (id: string) => [...__camel__Keys.all, "detail", id] as const,
};

/** After a write: every list page (totals and page membership change). */
export const invalidate__Pascal__Lists = (queryClient: QueryClient) =>
	queryClient.invalidateQueries({ queryKey: __camel__Keys.lists() });

export const __camel__ListQueryOptions = (input: __Pascal__ListInput) =>
	queryOptions({
		queryKey: __camel__Keys.list(input),
		queryFn: () => list__Pascal__({ data: input }),
	});

export const __camel__DetailQueryOptions = (id: string) =>
	queryOptions({
		queryKey: __camel__Keys.detail(id),
		queryFn: () => get__Pascal__({ data: { id } }),
		// The edit form's defaults must not change under the user while editing.
		staleTime: Number.POSITIVE_INFINITY,
	});
