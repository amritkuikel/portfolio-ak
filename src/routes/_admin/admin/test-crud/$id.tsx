import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Page, PageHeader } from "@/components/page/page";
import { assertRoutePermission } from "@/features/rbac/route-guard";
import { TestCrudForm } from "@/features/test-crud/components/test-crud-form";
import { testCrudDetailQueryOptions } from "@/features/test-crud/queries";
import { testCrudIdParamSchema } from "@/features/test-crud/schema";
import { loaderTitleCrumb } from "@/lib/breadcrumbs";
import { isAppError } from "@/lib/errors";
import { setErrorStatus } from "@/lib/http-status";
import { parseParams } from "@/lib/search";
import { pageTitle } from "@/lib/seo";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_admin/admin/test-crud/$id")({
	// Only UUIDs match this route; anything else falls through to the localized 404
	// without a server round trip ("new" is its own route and matches first).
	params: { parse: (raw) => parseParams(testCrudIdParamSchema, raw) },
	beforeLoad: ({ context }) => assertRoutePermission(context.session, "test-crud:update"),
	loader: async ({ context, params }) => {
		try {
			const item = await context.queryClient.ensureQueryData(testCrudDetailQueryOptions(params.id));
			// Only what the breadcrumb needs; the item itself travels in the Query cache.
			return { title: item.title };
		} catch (error) {
			if (isAppError(error) && error.code === "NOT_FOUND") throw notFound();
			await setErrorStatus(error);
			throw error;
		}
	},
	staticData: { breadcrumb: loaderTitleCrumb },
	head: () => ({ meta: [{ title: pageTitle(m.test_crud_edit_title()) }] }),
	component: EditTestCrudPage,
});

function EditTestCrudPage() {
	const { id } = Route.useParams();
	const { data: item } = useSuspenseQuery(testCrudDetailQueryOptions(id));
	return (
		<Page width="admin">
			<PageHeader title={m.test_crud_edit_title()} />
			{/* Keyed by id: switching items resets the form's defaults. */}
			<TestCrudForm key={item.id} item={item} />
		</Page>
	);
}
