import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { InfoIcon } from "lucide-react";
import { Page, PageHeader } from "@/components/page/page";
import { useActor, useCan } from "@/features/rbac/can";
import { PermissionMatrix } from "@/features/rbac/components/permission-matrix";
import { rolesQueryOptions } from "@/features/rbac/queries";
import { staticCrumb } from "@/lib/breadcrumbs";
import { ensureQuery } from "@/lib/query";
import { pageTitle } from "@/lib/seo";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_admin/admin/roles/permissions")({
	// Awaited: the whole matrix is in the SSR HTML.
	loader: ({ context }) => ensureQuery(context.queryClient, rolesQueryOptions()),
	staticData: { breadcrumb: staticCrumb(m.admin_nav_permissions) },
	head: () => ({ meta: [{ title: pageTitle(m.matrix_title()) }] }),
	component: PermissionsPage,
});

function PermissionsPage() {
	const { data: roles } = useSuspenseQuery(rolesQueryOptions());
	const actor = useActor();
	const canEdit = useCan("roles:manage");
	return (
		<Page width="admin">
			<PageHeader title={m.matrix_title()} description={m.matrix_description()} />
			{canEdit ? null : (
				<p className="flex items-center gap-2 text-muted-foreground text-sm" role="note">
					<InfoIcon className="size-4" aria-hidden />
					{m.matrix_read_only()}
				</p>
			)}
			<PermissionMatrix roles={roles} actor={actor ?? { isAdmin: false, permissions: [] }} canEdit={canEdit} />
		</Page>
	);
}
