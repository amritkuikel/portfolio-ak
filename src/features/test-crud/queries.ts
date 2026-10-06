import { queryOptions } from "@tanstack/react-query";
import { getTestCrud, listTestCrud } from "@/functions/test-crud";
import type { TestCrudListInput } from "./schema";

/**
 * Query keys. Lists live under ["test-crud", "list", input] so one
 * invalidateQueries({ queryKey: testCrudKeys.lists() }) refreshes every page.
 * Admin data isn't translated, so keys don't include the locale.
 */
export const testCrudKeys = {
	all: ["test-crud"] as const,
	lists: () => [...testCrudKeys.all, "list"] as const,
	list: (input: TestCrudListInput) => [...testCrudKeys.lists(), input] as const,
	details: () => [...testCrudKeys.all, "detail"] as const,
	detail: (id: string) => [...testCrudKeys.details(), id] as const,
};

export const testCrudListQueryOptions = (input: TestCrudListInput) =>
	queryOptions({
		queryKey: testCrudKeys.list(input),
		queryFn: () => listTestCrud({ data: input }),
	});

export const testCrudDetailQueryOptions = (id: string) =>
	queryOptions({
		queryKey: testCrudKeys.detail(id),
		queryFn: () => getTestCrud({ data: { id } }),
		// The edit form's defaults must not change under the user while editing.
		staleTime: Number.POSITIVE_INFINITY,
	});
