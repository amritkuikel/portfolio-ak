import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { Page, PageHeader } from "@/components/page/page";
import { TestCrudForm } from "@/features/test-crud/components/test-crud-form";
import { testCrudDetailQueryOptions } from "@/features/test-crud/queries";
import { loaderTitleCrumb } from "@/lib/breadcrumbs";
import { isAppError } from "@/lib/errors";
import { setErrorStatus } from "@/lib/http-status";
import { pageTitle } from "@/lib/seo";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_admin/admin/test-crud/$id")({
	loader: async ({ context, params }) => {
		// A malformed id can't exist: answer 404 without a server round trip.
		if (!z.uuid().safeParse(params.id).success) throw notFound();
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
