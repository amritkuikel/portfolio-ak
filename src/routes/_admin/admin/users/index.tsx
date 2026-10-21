import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DataTable, DataTableColumnsMenu, DataTableSkeleton } from "@/components/data-table";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { errorMessage } from "@/components/errors/error-page";
import { ClearFiltersButton } from "@/components/filters/active-filters";
import { FilterBar } from "@/components/filters/filter-bar";
import { Pagination } from "@/components/navigation/pagination";
import { EmptyState } from "@/components/page/empty-state";
import { Page, PageHeader } from "@/components/page/page";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useActor } from "@/features/rbac/can";
import { InviteUserDialog } from "@/features/rbac/components/invite-user-dialog";
import { userColumns } from "@/features/rbac/components/user-columns";
import { UserRolesDialog } from "@/features/rbac/components/user-roles-dialog";
import { hasAll } from "@/features/rbac/permissions";
import { refreshRbac, roleOptionsQueryOptions, usersListQueryOptions } from "@/features/rbac/queries";
import { USER_SEARCH_DEFAULTS, USERS_TABLE_ID, type UserListItem, userSearchSchema } from "@/features/rbac/schema";
import {
	CLEAR_USER_FILTERS,
	UserActiveFilters,
	UserFilterControls,
	userFilterChips,
} from "@/features/rbac/user-filters";
import { impersonateUser, revokeUserSessions, setUserBanned } from "@/functions/rbac";
import { tableListInput, useListPage } from "@/hooks/use-list-page";
import { useListQuery } from "@/hooks/use-list-query";
import { ensureQuery, loadList } from "@/lib/query";
import { pageTitle } from "@/lib/seo";
import { m } from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

export const Route = createFileRoute("/_admin/admin/users/")({
	validateSearch: userSearchSchema,
	search: { middlewares: [stripSearchParams(USER_SEARCH_DEFAULTS)] },
	loaderDeps: ({ search }) => search,
	loader: async ({ context, deps, cause }) => {
		await Promise.all([
			loadList(
				context.queryClient,
				usersListQueryOptions(tableListInput(deps, context.preferences.state, USERS_TABLE_ID)),
				cause,
			),
			ensureQuery(context.queryClient, roleOptionsQueryOptions()),
		]);
	},
	head: () => ({ meta: [{ title: pageTitle(m.users_title()) }] }),
	component: UsersPage,
});

/** What's being confirmed for one user: a ban or unban, signing them out everywhere, or viewing as them. */
type Confirming =
	| { kind: "ban"; user: UserListItem; banned: boolean }
	| { kind: "revoke"; user: UserListItem }
	| { kind: "impersonate"; user: UserListItem };

/** The confirm dialog's texts for each action. */
const confirmCopy = (request: Confirming) => {
	const name = request.user.name;
	if (request.kind === "revoke") {
		return { title: m.users_revoke_title({ name }), body: m.users_revoke_body(), label: m.users_revoke_sessions() };
	}
	if (request.kind === "impersonate") {
		return {
			title: m.users_impersonate_title({ name }),
			body: m.users_impersonate_body(),
			label: m.users_impersonate(),
		};
	}
	return request.banned
		? { title: m.users_ban_title({ name }), body: m.users_ban_body(), label: m.users_ban() }
		: { title: m.users_unban_title({ name }), body: m.users_unban_body(), label: m.users_unban() };
};

function UsersPage() {
	const search = Route.useSearch();
	const queryClient = useQueryClient();
	const actor = useActor();
	const { page, busy, pagination } = useListPage({ tableId: USERS_TABLE_ID, search, query: usersListQueryOptions });
	const { data: roles = [] } = useListQuery(roleOptionsQueryOptions());

	const [editing, setEditing] = useState<UserListItem | null>(null);
	const [inviting, setInviting] = useState(false);
	const [confirming, setConfirming] = useState<Confirming | null>(null);
	const act = useMutation({
		mutationFn: async (request: Confirming) => {
			const userId = request.user.id;
			if (request.kind === "ban") await setUserBanned({ data: { userId, banned: request.banned } });
			else if (request.kind === "revoke") await revokeUserSessions({ data: { userId } });
			else await impersonateUser({ data: { userId } });
		},
		onSuccess: (_, request) => {
			const name = request.user.name;
			// A new session (as the user): load the app again from the server, starting at home.
			if (request.kind === "impersonate") window.location.assign(localizeHref("/"));
			else if (request.kind === "revoke") toast.success(m.users_toast_revoked({ name }));
			else toast.success(request.banned ? m.users_toast_banned({ name }) : m.users_toast_unbanned({ name }));
		},
		onError: (failure) => toast.error(m.users_toast_failed(), { description: errorMessage(failure) }),
		onSettled: (_, __, request) => (request.kind === "impersonate" ? undefined : refreshRbac(queryClient)),
	});

	const canAssign = actor !== null && hasAll(actor.permissions, ["users:update"]);
	const canBan = actor !== null && hasAll(actor.permissions, ["users:ban"]);
	const canInvite = actor !== null && hasAll(actor.permissions, ["users:invite"]);
	// Impersonation is for admins only, never of another admin (the server refuses the rest too).
	const canImpersonate = (row: UserListItem) => actor?.isAdmin === true && !row.isAdmin && !row.banned;
	const copy = confirming ? confirmCopy(confirming) : null;
	const columns = userColumns(actor?.id);
	const filtered = userFilterChips(search, roles).length > 0;

	return (
		<Page width="admin">
			<PageHeader
				title={m.users_title()}
				description={m.users_description()}
				actions={canInvite ? <Button onClick={() => setInviting(true)}>{m.users_invite()}</Button> : undefined}
			/>
			<div className="flex flex-col gap-3">
				<div className="flex flex-wrap items-end justify-between gap-3">
					<FilterBar values={search} preserve={["sort", "pageSize"]}>
						<UserFilterControls search={search} roles={roles} />
					</FilterBar>
					<DataTableColumnsMenu tableId={USERS_TABLE_ID} columns={columns} />
				</div>
				<UserActiveFilters search={search} roles={roles} />
			</div>

			{page && pagination ? (
				<>
					<DataTable
						tableId={USERS_TABLE_ID}
						rows={page.items}
						columns={columns}
						getRowId={(row) => row.id}
						getRowLabel={(row) => row.name}
						sort={search.sort}
						busy={busy}
						data-testid="users-table"
						rowActions={
							canAssign || canBan
								? (row) =>
										row.id === actor?.id ? null : (
											<>
												{canAssign ? (
													<DropdownMenuItem onSelect={() => setEditing(row)}>{m.users_edit_roles()}</DropdownMenuItem>
												) : null}
												{canImpersonate(row) ? (
													<DropdownMenuItem onSelect={() => setConfirming({ kind: "impersonate", user: row })}>
														{m.users_impersonate()}
													</DropdownMenuItem>
												) : null}
												{canBan ? (
													<>
														<DropdownMenuItem onSelect={() => setConfirming({ kind: "revoke", user: row })}>
															{m.users_revoke_sessions()}
														</DropdownMenuItem>
														<DropdownMenuItem
															variant={row.banned ? "default" : "destructive"}
															onSelect={() => setConfirming({ kind: "ban", user: row, banned: !row.banned })}
														>
															{row.banned ? m.users_unban() : m.users_ban()}
														</DropdownMenuItem>
													</>
												) : null}
											</>
										)
								: undefined
						}
						empty={
							<EmptyState
								description={m.users_empty()}
								action={filtered ? <ClearFiltersButton clearAll={CLEAR_USER_FILTERS} /> : null}
							/>
						}
					/>
					<Pagination {...pagination} />
				</>
			) : (
				<DataTableSkeleton columns={4} rows={8} />
			)}

			{editing && actor ? (
				<UserRolesDialog user={editing} roles={roles} actor={actor} onClose={() => setEditing(null)} />
			) : null}
			{inviting ? <InviteUserDialog onClose={() => setInviting(false)} /> : null}
			<ConfirmDialog
				open={confirming !== null}
				destructive={confirming?.kind === "ban" && confirming.banned}
				title={copy?.title ?? ""}
				description={copy?.body ?? ""}
				confirmLabel={copy?.label ?? ""}
				onConfirm={() => {
					if (confirming) act.mutate(confirming);
					setConfirming(null);
				}}
				onCancel={() => setConfirming(null)}
			/>
		</Page>
	);
}
