import { type DbClient, DbClient as TanStackDbClient } from "@tanstack/react-db";
import type { QueryClient } from "@tanstack/react-query";

/**
 * TanStack DB wiring (see docs/decisions.md 0064 for when to use DB vs Query vs Store).
 *
 * One DbClient per router (so per request on the server), created next to the
 * per-request QueryClient and given it as a dependency. Feature collections are
 * module-level *descriptors* that the DbClient materializes, so server requests
 * never share rows:
 *
 *   export const itemsCollection = collectionOptions("items", (client) =>
 *     queryCollectionOptions({
 *       id: "items",
 *       queryKey: itemKeys.all,
 *       queryFn: () => listItems(),          // a server function
 *       queryClient: queryClientOf(client),
 *       getKey: (item) => item.id,
 *       onUpdate: async ({ transaction }) => { await updateItems(...) },  // throw => rollback
 *     }),
 *   );
 */
const QUERY_CLIENT = "queryClient";

export const createDbClient = (queryClient: QueryClient): DbClient =>
	new TanStackDbClient({ [QUERY_CLIENT]: queryClient });

/** The request's QueryClient, for queryCollectionOptions({ queryClient }). */
export const queryClientOf = (client: DbClient) => client.requireDependency<QueryClient>(QUERY_CLIENT);
