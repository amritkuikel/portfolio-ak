import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { TestCrudAdminList, TestCrudAdminPending } from "@/features/test-crud/components/admin-list";
import { testCrudListQueryOptions, testCrudTagsQueryOptions } from "@/features/test-crud/queries";
import { TEST_CRUD_TABLE_ID } from "@/features/test-crud/schema";
import { TEST_CRUD_SEARCH_DEFAULTS, testCrudAdminRouteSearchSchema } from "@/features/test-crud/search";
import { tableListInput } from "@/hooks/use-list-page";
import { ensureQuery, loadList } from "@/lib/query";
import { pageTitle } from "@/lib/seo";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_admin/admin/test-crud/")({
	validateSearch: testCrudAdminRouteSearchSchema,
	// Default values stay out of generated links, so URLs stay short.
	search: { middlewares: [stripSearchParams(TEST_CRUD_SEARCH_DEFAULTS)] },
	// `edit` only opens a dialog: changing it must not reload the list.
	loaderDeps: ({ search: { edit: _edit, ...list } }) => list,
	loader: async ({ context, deps, cause }) => {
		// SSR / entering: awaited, so the rows are in the HTML and hydrate the Query cache
		// (also the TanStack DB collection's initial state). Filter changes: see loadList.
		await Promise.all([
			loadList(
				context.queryClient,
				testCrudListQueryOptions(tableListInput(deps, context.preferences.state, TEST_CRUD_TABLE_ID)),
				cause,
			),
			ensureQuery(context.queryClient, testCrudTagsQueryOptions()),
		]);
	},
	head: () => ({ meta: [{ title: pageTitle(m.test_crud_title()) }] }),
	pendingComponent: TestCrudAdminPending,
	component: TestCrudAdminPage,
});

function TestCrudAdminPage() {
	return <TestCrudAdminList search={Route.useSearch()} />;
}
