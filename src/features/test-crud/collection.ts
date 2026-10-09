import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { collectionOptions } from "@tanstack/react-db";
import { deleteTestCrudFn, listTestCrud, setTestCrudStatusFn } from "@/functions/test-crud";
import { queryClientOf } from "@/lib/db";
import { testCrudKeys } from "./queries";
import type { TestCrudListInput, TestCrudListItem } from "./schema";

/**
 * TanStack DB collection over ONE admin list page (the reference pattern).
 *
 * - Same query key as testCrudListQueryOptions, so the rows the route loader put
 *   in the Query cache (and SSR'd) are the collection's initial state.
 * - collection.update(id, d => { d.status = … }) and collection.delete(ids) show
 *   instantly. The handlers call the admin server functions; if they throw, TanStack
 *   DB rolls the change back and the caller's `isPersisted.promise` rejects
 *   (the table turns that into a localized toast).
 * - After a successful write every list page is invalidated (totals and page
 *   membership change), which also refetches this one.
 */
const descriptors = new Map<string, ReturnType<typeof createPageCollection>>();

const createPageCollection = (input: TestCrudListInput, id: string) =>
	collectionOptions(id, (client) => {
		const queryClient = queryClientOf(client);
		const refreshLists = async () => {
			await queryClient.invalidateQueries({ queryKey: testCrudKeys.lists() });
			// Public pages cached in this tab may now show stale (un)published items.
			void queryClient.invalidateQueries({ queryKey: testCrudKeys.public() });
			// Deleting rows can retire tags from the tag filter.
			void queryClient.invalidateQueries({ queryKey: testCrudKeys.tags() });
			// The invalidation above already refetched this page.
			return { refetch: false };
		};
		return queryCollectionOptions({
			id,
			queryKey: testCrudKeys.list(input),
			queryFn: () => listTestCrud({ data: input }),
			select: (page) => page.items,
			queryClient,
			getKey: (item: TestCrudListItem) => item.id,
			onUpdate: async ({ transaction }) => {
				for (const mutation of transaction.mutations) {
					if (mutation.changes.status) {
						await setTestCrudStatusFn({ data: { id: String(mutation.key), status: mutation.changes.status } });
					}
				}
				return refreshLists();
			},
			onDelete: async ({ transaction }) => {
				await deleteTestCrudFn({ data: { ids: transaction.mutations.map((mutation) => String(mutation.key)) } });
				return refreshLists();
			},
		});
	});

/** The collection descriptor for a list page (memoized, so each page has one collection per DbClient). */
export const testCrudPageCollection = (input: TestCrudListInput) => {
	const id = `test-crud:${JSON.stringify(testCrudKeys.list(input))}`;
	let descriptor = descriptors.get(id);
	if (!descriptor) {
		descriptor = createPageCollection(input, id);
		descriptors.set(id, descriptor);
	}
	return descriptor;
};
