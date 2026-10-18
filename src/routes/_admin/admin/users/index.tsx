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
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useActor } from "@/features/rbac/can";
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
import { setUserBanned } from "@/functions/rbac";
import { ensureQuery, loadList } from "@/lib/query";
import { pageTitle } from "@/lib/seo";
import { tableListInput, useListPage } from "@/lib/use-list-page";
import { useListQuery } from "@/lib/use-list-query";
import { m } from "@/paraglide/messages";

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

/** What's being confirmed: a ban or an unban of one user. */
type BanRequest = { user: UserListItem; banned: boolean };

function UsersPage() {
	const search = Route.useSearch();
	const queryClient = useQueryClient();
	const actor = useActor();
	const { page, busy, pagination } = useListPage({ tableId: USERS_TABLE_ID, search, query: usersListQueryOptions });
	const { data: roles = [] } = useListQuery(roleOptionsQueryOptions());

	const [editing, setEditing] = useState<UserListItem | null>(null);
	const [banRequest, setBanRequest] = useState<BanRequest | null>(null);
	const ban = useMutation({
		mutationFn: ({ user, banned }: BanRequest) => setUserBanned({ data: { userId: user.id, banned } }),
		onSuccess: (_, { user, banned }) =>
			toast.success(banned ? m.users_toast_banned({ name: user.name }) : m.users_toast_unbanned({ name: user.name })),
		onError: (failure) => toast.error(m.users_toast_failed(), { description: errorMessage(failure) }),
		onSettled: () => refreshRbac(queryClient),
	});

	const canAssign = actor !== null && hasAll(actor.permissions, ["users:update"]);
	const canBan = actor !== null && hasAll(actor.permissions, ["users:ban"]);
	const columns = userColumns(actor?.id);
	const filtered = userFilterChips(search, roles).length > 0;

	return (
		<Page width="admin">
			<PageHeader title={m.users_title()} description={m.users_description()} />
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
												{canBan ? (
													<DropdownMenuItem
														variant={row.banned ? "default" : "destructive"}
														onSelect={() => setBanRequest({ user: row, banned: !row.banned })}
													>
														{row.banned ? m.users_unban() : m.users_ban()}
													</DropdownMenuItem>
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
			<ConfirmDialog
				open={banRequest !== null}
				destructive={banRequest?.banned ?? false}
				title={
					banRequest?.banned
						? m.users_ban_title({ name: banRequest.user.name })
						: m.users_unban_title({ name: banRequest?.user.name ?? "" })
				}
				description={banRequest?.banned ? m.users_ban_body() : m.users_unban_body()}
				confirmLabel={banRequest?.banned ? m.users_ban() : m.users_unban()}
				onConfirm={() => {
					if (banRequest) ban.mutate(banRequest);
					setBanRequest(null);
				}}
				onCancel={() => setBanRequest(null)}
			/>
		</Page>
	);
}
