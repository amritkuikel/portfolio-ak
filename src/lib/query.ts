import { type FetchQueryOptions, QueryClient, type QueryKey } from "@tanstack/react-query";
import { isAppError } from "./errors";

/**
 * One QueryClient per request on the server (created in getRouter), one per tab
 * in the browser. The SSR integration dehydrates it into the HTML and hydrates it
 * on the client.
 *
 * staleTime > 0 is what stops a refetch right after hydration: data that just
 * arrived from the server is treated as fresh for a minute.
 */
export const createQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60_000,
				// Don't retry 4xx-style app errors; they won't succeed on retry.
				retry: (failureCount, error) => !isAppError(error) && failureCount < 2,
			},
		},
	});

/**
 * Loader body for a list driven by URL search (filters, sort, page).
 *
 * - Entering the route and SSR (`cause` "enter"/"preload"): await the data, so the
 *   page renders complete on the server and on first client navigation.
 * - Changing the search on the same route (`cause` "stay"): only prefetch. The
 *   navigation commits at once, so the URL and the filter controls update without
 *   a pending screen (and without stealing focus from a filter being typed in).
 *   The page keeps showing the previous results, marked busy, until the new ones
 *   arrive: read the data with `useListQuery`.
 */
export function loadList<TData, TKey extends QueryKey>(
	queryClient: QueryClient,
	options: FetchQueryOptions<TData, Error, TData, TKey>,
	cause: "enter" | "stay" | "preload",
): Promise<unknown> | undefined {
	if (cause === "stay") {
		void queryClient.prefetchQuery(options);
		return undefined;
	}
	return queryClient.ensureQueryData(options);
}
