import { QueryClient } from "@tanstack/react-query";
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
