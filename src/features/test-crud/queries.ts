import { type QueryClient, queryOptions } from "@tanstack/react-query";
import { getTestCrud, listTestCrud, listTestCrudTags } from "@/functions/test-crud";
import { getPublicTestCrud, listPublicTestCrud } from "@/functions/test-crud-public";
import type { TestCrudListInput, TestCrudPublicSearch } from "./schema";

/**
 * Query keys. Lists live under ["test-crud", "list", input] so one
 * invalidateQueries({ queryKey: testCrudKeys.lists() }) refreshes every page.
 * Admin data isn't translated, so keys don't include the locale.
 */
export const testCrudKeys = {
	all: ["test-crud"] as const,
	lists: () => [...testCrudKeys.all, "list"] as const,
	list: (input: TestCrudListInput) => [...testCrudKeys.lists(), input] as const,
	tags: () => [...testCrudKeys.all, "tags"] as const,
	details: () => [...testCrudKeys.all, "detail"] as const,
	detail: (id: string) => [...testCrudKeys.details(), id] as const,
	/** Public reads are separate from admin ones: they only ever contain published rows. */
	public: () => [...testCrudKeys.all, "public"] as const,
	publicList: (search: TestCrudPublicSearch) => [...testCrudKeys.public(), "list", search] as const,
	publicDetail: (slug: string) => [...testCrudKeys.public(), "detail", slug] as const,
};

/**
 * After any write (create, edit, publish, delete): every admin list page (totals
 * and page membership change), the tag filter (tags can appear or retire) and the
 * public pages cached in this tab. Resolves once the admin lists have refetched.
 */
export async function invalidateTestCrudLists(queryClient: QueryClient) {
	void queryClient.invalidateQueries({ queryKey: testCrudKeys.public() });
	void queryClient.invalidateQueries({ queryKey: testCrudKeys.tags() });
	await queryClient.invalidateQueries({ queryKey: testCrudKeys.lists() });
}

export const testCrudListQueryOptions = (input: TestCrudListInput) =>
	queryOptions({
		queryKey: testCrudKeys.list(input),
		queryFn: () => listTestCrud({ data: input }),
	});

/** Tag filter options; refreshed with the lists (saving an item can add tags). */
export const testCrudTagsQueryOptions = () =>
	queryOptions({
		queryKey: testCrudKeys.tags(),
		queryFn: () => listTestCrudTags(),
	});

export const testCrudDetailQueryOptions = (id: string) =>
	queryOptions({
		queryKey: testCrudKeys.detail(id),
		queryFn: () => getTestCrud({ data: { id } }),
		// The edit form's defaults must not change under the user while editing.
		staleTime: Number.POSITIVE_INFINITY,
	});

export const publicTestCrudListQueryOptions = (search: TestCrudPublicSearch) =>
	queryOptions({
		queryKey: testCrudKeys.publicList(search),
		queryFn: () => listPublicTestCrud({ data: search }),
	});

export const publicTestCrudDetailQueryOptions = (slug: string) =>
	queryOptions({
		queryKey: testCrudKeys.publicDetail(slug),
		queryFn: () => getPublicTestCrud({ data: { slug } }),
	});
