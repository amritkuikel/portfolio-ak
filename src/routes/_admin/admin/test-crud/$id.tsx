import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { z } from "zod";
import { TestCrudForm } from "@/features/test-crud/components/test-crud-form";
import { testCrudDetailQueryOptions } from "@/features/test-crud/queries";
import { isAppError } from "@/lib/errors";
import { setErrorStatus } from "@/lib/http-status";
import { pageTitle } from "@/lib/seo";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_admin/admin/test-crud/$id")({
	loader: async ({ context, params }) => {
		// A malformed id can't exist: answer 404 without a server round trip.
		if (!z.uuid().safeParse(params.id).success) throw notFound();
		try {
			await context.queryClient.ensureQueryData(testCrudDetailQueryOptions(params.id));
		} catch (error) {
			if (isAppError(error) && error.code === "NOT_FOUND") throw notFound();
			await setErrorStatus(error);
			throw error;
		}
	},
	head: () => ({ meta: [{ title: pageTitle(m.test_crud_edit_title()) }] }),
	component: EditTestCrudPage,
});

function EditTestCrudPage() {
	const { id } = Route.useParams();
	const { data: item } = useSuspenseQuery(testCrudDetailQueryOptions(id));
	return (
		<main className="flex flex-col gap-6 px-4 py-8 sm:px-6">
			<Link
				to="/admin/test-crud"
				className="inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
			>
				<ArrowLeftIcon className="size-4" aria-hidden />
				{m.test_crud_back()}
			</Link>
			<h1 className="font-semibold text-2xl tracking-tight">{m.test_crud_edit_title()}</h1>
			{/* Keyed by id: switching items resets the form's defaults. */}
			<TestCrudForm key={item.id} item={item} />
		</main>
	);
}
