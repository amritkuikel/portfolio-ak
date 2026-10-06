import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { TestCrudForm } from "@/features/test-crud/components/test-crud-form";
import { pageTitle } from "@/lib/seo";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_admin/admin/test-crud/new")({
	head: () => ({ meta: [{ title: pageTitle(m.test_crud_new_title()) }] }),
	component: NewTestCrudPage,
});

function NewTestCrudPage() {
	return (
		<main className="flex flex-col gap-6 px-4 py-8 sm:px-6">
			<Link
				to="/admin/test-crud"
				className="inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
			>
				<ArrowLeftIcon className="size-4" aria-hidden />
				{m.test_crud_back()}
			</Link>
			<h1 className="font-semibold text-2xl tracking-tight">{m.test_crud_new_title()}</h1>
			<TestCrudForm />
		</main>
	);
}
