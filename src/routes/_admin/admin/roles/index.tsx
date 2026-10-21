import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRoundIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { errorMessage } from "@/components/errors/error-page";
import { Page, PageHeader } from "@/components/page/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Can, useCan } from "@/features/rbac/can";
import { RoleDialog } from "@/features/rbac/components/role-dialog";
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

/** Which dialog is open: create, rename a role, or confirm deleting one. */
type Dialog = { kind: "create" } | { kind: "rename"; role: RoleSummary } | { kind: "delete"; role: RoleSummary };

function RolesPage() {
	const { data: roles } = useSuspenseQuery(rolesQueryOptions());
	const queryClient = useQueryClient();
	const canManage = useCan("roles:manage");
	const [dialog, setDialog] = useState<Dialog | null>(null);
	const remove = useMutation({
		mutationFn: (role: RoleSummary) => deleteRole({ data: { id: role.id } }),
		onSuccess: () => toast.success(m.roles_toast_deleted()),
		onError: (failure) => toast.error(m.users_toast_failed(), { description: errorMessage(failure) }),
		onSettled: () => refreshRbac(queryClient),
	});

	return (
		<Page width="admin">
			<PageHeader
				title={m.roles_title()}
				description={m.roles_description()}
				actions={
					<>
						<Button variant="outline" asChild>
							<Link to="/admin/roles/permissions">
								<KeyRoundIcon aria-hidden />
								{m.admin_nav_permissions()}
							</Link>
						</Button>
						<Can permission="roles:manage">
							<Button onClick={() => setDialog({ kind: "create" })}>
								<PlusIcon aria-hidden />
								{m.roles_new()}
							</Button>
						</Can>
					</>
				}
			/>
			<DataTable
				tableId="admin-roles"
				rows={roles}
				columns={ROLE_COLUMNS}
				getRowId={(role) => role.id}
				getRowLabel={roleLabel}
				data-testid="roles-table"
				rowActions={
					canManage
						? (role) =>
								role.system ? null : (
									<>
										<DropdownMenuItem onSelect={() => setDialog({ kind: "rename", role })}>
											{m.roles_rename()}
										</DropdownMenuItem>
										<DropdownMenuItem variant="destructive" onSelect={() => setDialog({ kind: "delete", role })}>
											{m.roles_delete()}
										</DropdownMenuItem>
									</>
								)
						: undefined
				}
			/>
			{dialog?.kind === "create" ? <RoleDialog onClose={() => setDialog(null)} /> : null}
			{dialog?.kind === "rename" ? <RoleDialog role={dialog.role} onClose={() => setDialog(null)} /> : null}
			<ConfirmDialog
				open={dialog?.kind === "delete"}
				destructive
				title={m.roles_delete_title({ name: dialog?.kind === "delete" ? roleLabel(dialog.role) : "" })}
				description={m.roles_delete_body()}
				confirmLabel={m.roles_delete()}
				onConfirm={() => {
					if (dialog?.kind === "delete") remove.mutate(dialog.role);
					setDialog(null);
				}}
				onCancel={() => setDialog(null)}
			/>
		</Page>
	);
}
