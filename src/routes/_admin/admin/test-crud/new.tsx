import { createFileRoute } from "@tanstack/react-router";
import { Page, PageHeader } from "@/components/page/page";
import { assertRoutePermission } from "@/features/rbac/route-guard";
import { TestCrudForm } from "@/features/test-crud/components/test-crud-form";
import { staticCrumb } from "@/lib/breadcrumbs";
import { pageTitle } from "@/lib/seo";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_admin/admin/test-crud/new")({
	beforeLoad: ({ context }) => assertRoutePermission(context.session, "test-crud:create"),
	staticData: { breadcrumb: staticCrumb(m.test_crud_new_title) },
	head: () => ({ meta: [{ title: pageTitle(m.test_crud_new_title()) }] }),
	component: NewTestCrudPage,
});

function NewTestCrudPage() {
	return (
		<Page width="admin">
			<PageHeader title={m.test_crud_new_title()} />
			<TestCrudForm />
		</Page>
	);
}
