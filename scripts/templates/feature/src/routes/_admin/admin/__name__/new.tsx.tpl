import { createFileRoute } from "@tanstack/react-router";
import { Page, PageHeader } from "@/components/page/page";
import { __Pascal__Form } from "@/features/__name__/components/form";
import { assertRoutePermission } from "@/features/rbac/route-guard";
import { staticCrumb } from "@/lib/breadcrumbs";
import { pageTitle } from "@/lib/seo";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_admin/admin/__name__/new")({
	beforeLoad: ({ context }) => assertRoutePermission(context.session, "__name__:create"),
	staticData: { breadcrumb: staticCrumb(m.__snake___new_title) },
	head: () => ({ meta: [{ title: pageTitle(m.__snake___new_title()) }] }),
	component: New__Pascal__Page,
});

function New__Pascal__Page() {
	return (
		<Page width="admin">
			<PageHeader title={m.__snake___new_title()} />
			<__Pascal__Form />
		</Page>
	);
}
