import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { toast } from "sonner";
import { DataTable, type DataTableColumn, type RowAction } from "@/components/data-table";
import { useConfirm } from "@/components/dialogs/confirm";
import { errorMessage } from "@/components/errors/error-page";
import { Page, PageHeader } from "@/components/page/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Can } from "@/features/rbac/can";
import { RoleTabs } from "@/features/rbac/components/role-tabs";
import { roleDescription, roleLabel } from "@/features/rbac/labels";
import { ALL_PERMISSIONS } from "@/features/rbac/permissions";
import { refreshRbac, rolesQueryOptions } from "@/features/rbac/queries";
import type { RoleSummary } from "@/features/rbac/schema";
import { deleteRole } from "@/functions/rbac";
import { formatNumber } from "@/lib/i18n/intl";
import { ensureQuery } from "@/lib/query";
import { pageTitle } from "@/lib/seo";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_admin/admin/roles/")({
	loader: ({ context }) => ensureQuery(context.queryClient, rolesQueryOptions()),
	head: () => ({ meta: [{ title: pageTitle(m.roles_title()) }] }),
	component: RolesPage,
});

// Opened on click: the form loads then, not with the page.
const RoleDialog = lazy(() =>
	import("@/features/rbac/components/role-dialog").then((module) => ({ default: module.RoleDialog })),
);

const ROLE_COLUMNS: ReadonlyArray<DataTableColumn<RoleSummary>> = [
	{
		id: "role",
		header: m.roles_col_role,
		cellClassName: "max-w-96",
		cell: (role) => (
			<div className="flex min-w-0 flex-col gap-0.5">
				<span className="flex items-center gap-2 font-medium">
					{roleLabel(role)}
					{role.system ? <Badge variant="outline">{m.roles_system()}</Badge> : null}
				</span>
				{roleDescription(role) ? <span className="text-muted-foreground text-xs">{roleDescription(role)}</span> : null}
			</div>
		),
	},
	{
		id: "users",
		header: m.roles_col_users,
		cellClassName: "tabular-nums",
		cell: (role) => formatNumber(role.userCount),
		csv: (role) => role.userCount,
	},
	{
		id: "permissions",
		header: m.roles_col_permissions,
		cellClassName: "tabular-nums whitespace-nowrap",
		cell: (role) =>
			m.roles_permission_count({
				count: formatNumber(role.permissions.length),
				total: formatNumber(ALL_PERMISSIONS.length),
			}),
	},
];

/** Which form is open: a new role, or renaming one. */
type Editing = { kind: "create" } | { kind: "rename"; role: RoleSummary };

function RolesPage() {
	const { data: roles } = useSuspenseQuery(rolesQueryOptions());
	const queryClient = useQueryClient();
	const confirm = useConfirm();
	const [editing, setEditing] = useState<Editing | null>(null);
	const remove = useMutation({
		mutationFn: (role: RoleSummary) => deleteRole({ data: { id: role.id } }),
		onSuccess: () => toast.success(m.roles_toast_deleted()),
		onError: (failure) => toast.error(m.roles_toast_failed(), { description: errorMessage(failure) }),
		onSettled: () => refreshRbac(queryClient),
	});

	const askDelete = async (role: RoleSummary) => {
		const confirmed = await confirm({
			destructive: true,
			title: m.roles_delete_title({ name: roleLabel(role) }),
			description: m.roles_delete_body(),
			confirmLabel: m.roles_delete(),
		});
		if (confirmed) remove.mutate(role);
	};
	// System roles (Admin, the baseline) can't be renamed or deleted.
	const rowActions = (role: RoleSummary): RowAction[] =>
		role.system
			? []
			: [
					{
						id: "rename",
						label: m.roles_rename(),
						permission: "roles:manage",
						onSelect: () => setEditing({ kind: "rename", role }),
					},
					{
						id: "delete",
						label: m.roles_delete(),
						permission: "roles:manage",
						destructive: true,
						onSelect: () => void askDelete(role),
					},
				];

	return (
		<Page width="admin">
			<PageHeader
				title={m.roles_title()}
				description={m.roles_description()}
				tabs={<RoleTabs />}
				actions={
					<Can permission="roles:manage">
						<Button onClick={() => setEditing({ kind: "create" })}>
							<PlusIcon aria-hidden />
							{m.roles_new()}
						</Button>
					</Can>
				}
			/>
			<DataTable
				tableId="admin-roles"
				rows={roles}
				columns={ROLE_COLUMNS}
				getRowId={(role) => role.id}
				getRowLabel={roleLabel}
				data-testid="roles-table"
				rowActions={rowActions}
				exportName="roles"
			/>
			<Suspense>
				{editing ? (
					<RoleDialog role={editing.kind === "rename" ? editing.role : undefined} onClose={() => setEditing(null)} />
				) : null}
			</Suspense>
		</Page>
	);
}
