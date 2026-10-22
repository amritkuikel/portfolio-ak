import { StatusBadge } from "@/components/data-display/status-badge";
import { UserCell } from "@/components/data-display/user-avatar";
import type { DataTableColumn } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/i18n/intl";
import { m } from "@/paraglide/messages";
import type { UserListItem } from "../schema";

/** Columns of /admin/users. `currentUserId` marks the signed-in user's own row. */
export const userColumns = (currentUserId: string | undefined): ReadonlyArray<DataTableColumn<UserListItem>> => [
	{
		id: "user",
		header: m.users_col_user,
		sort: "name",
		cellClassName: "max-w-72",
		csv: (row) => `${row.name} <${row.email}>`,
		cell: (row) => (
			<UserCell name={row.name} email={row.email} note={row.id === currentUserId ? `(${m.users_you()})` : undefined} />
		),
	},
	{
		id: "roles",
		header: m.users_col_roles,
		cell: (row) => (
			<div className="flex max-w-64 flex-wrap gap-1">
				{row.isAdmin ? <Badge>{m.role_admin_name()}</Badge> : null}
				{row.roles.map((role) => (
					<Badge key={role.id} variant="secondary">
						{role.name}
					</Badge>
				))}
				{!row.isAdmin && row.roles.length === 0 ? (
					<span className="text-muted-foreground text-sm">{m.users_role_baseline()}</span>
				) : null}
			</div>
		),
	},
	{
		id: "status",
		header: m.users_col_status,
		hideable: true,
		csv: (row) => (row.banned ? m.users_status_banned() : m.users_status_active()),
		cell: (row) =>
			row.banned ? (
				<StatusBadge tone="danger">{m.users_status_banned()}</StatusBadge>
			) : (
				<StatusBadge tone="success">{m.users_status_active()}</StatusBadge>
			),
	},
	{
		id: "joined",
		header: m.users_col_joined,
		sort: "created",
		hideable: true,
		cellClassName: "whitespace-nowrap text-muted-foreground text-sm",
		cell: (row) => formatDate(row.createdAt, { dateStyle: "medium" }),
		csv: (row) => row.createdAt,
	},
];
