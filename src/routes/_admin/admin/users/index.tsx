import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { toast } from "sonner";
import { DataTable, DataTableSkeleton, type RowAction } from "@/components/data-table";
import { useConfirm } from "@/components/dialogs/confirm";
import { errorMessage } from "@/components/errors/error-page";
import { ClearFiltersButton } from "@/components/filters/active-filters";
import { FilterBar } from "@/components/filters/filter-bar";
import { Pagination } from "@/components/navigation/pagination";
import { EmptyState } from "@/components/page/empty-state";
import { Page, PageHeader } from "@/components/page/page";
import { Button } from "@/components/ui/button";
import { useActor, useCan } from "@/features/rbac/can";
import { userColumns } from "@/features/rbac/components/user-columns";
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

// Opened on click: their forms (and every field they use) load then, not with the page.
const InviteUserDialog = lazy(() =>
	import("@/features/rbac/components/invite-user-dialog").then((module) => ({ default: module.InviteUserDialog })),
);
const UserRolesDialog = lazy(() =>
	import("@/features/rbac/components/user-roles-dialog").then((module) => ({ default: module.UserRolesDialog })),
);

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
	const confirm = useConfirm();
	const act = useMutation({
		mutationFn: async (request: Confirming) => {
			const userId = request.user.id;
			if (request.kind === "ban") await setUserBanned({ data: { userId, banned: request.banned } });
			else if (request.kind === "revoke") await revokeUserSessions({ data: { userId } });
			else await impersonateUser({ data: { userId } });
		},
		onSuccess: (_, request) => {
			const name = request.user.name;
			// A new session (as the user): load the app again from the server, on their account page
			// (the home page is the portfolio, which doesn't read the session, so it shows no banner).
			if (request.kind === "impersonate") window.location.assign(localizeHref("/account"));
			else if (request.kind === "revoke") toast.success(m.users_toast_revoked({ name }));
			else toast.success(request.banned ? m.users_toast_banned({ name }) : m.users_toast_unbanned({ name }));
		},
		onError: (failure) => toast.error(m.users_toast_failed(), { description: errorMessage(failure) }),
		onSettled: (_, __, request) => (request.kind === "impersonate" ? undefined : refreshRbac(queryClient)),
	});

	const canInvite = useCan("users:invite");
	// Impersonation is for admins only, never of another admin (the server refuses the rest too).
	const canImpersonate = (row: UserListItem) => actor?.isAdmin === true && !row.isAdmin && !row.banned;
	const ask = async (request: Confirming) => {
		const copy = confirmCopy(request);
		const confirmed = await confirm({
			title: copy.title,
			description: copy.body,
			confirmLabel: copy.label,
			destructive: request.kind === "ban" && request.banned,
		});
		if (confirmed) act.mutate(request);
	};
	// No actions on your own row: roles, bans and sessions of the signed-in user are changed elsewhere.
	const rowActions = (row: UserListItem): RowAction[] =>
		row.id === actor?.id
			? []
			: [
					{ id: "roles", label: m.users_edit_roles(), permission: "users:update", onSelect: () => setEditing(row) },
					{
						id: "impersonate",
						label: m.users_impersonate(),
						hidden: !canImpersonate(row),
						onSelect: () => void ask({ kind: "impersonate", user: row }),
					},
					{
						id: "revoke",
						label: m.users_revoke_sessions(),
						permission: "users:ban",
						onSelect: () => void ask({ kind: "revoke", user: row }),
					},
					{
						id: "ban",
						label: row.banned ? m.users_unban() : m.users_ban(),
						permission: "users:ban",
						destructive: !row.banned,
						onSelect: () => void ask({ kind: "ban", user: row, banned: !row.banned }),
					},
				];
	const columns = userColumns(actor?.id);
	const filtered = userFilterChips(search, roles).length > 0;

	return (
		<Page width="admin">
			<PageHeader
				title={m.users_title()}
				description={m.users_description()}
				actions={canInvite ? <Button onClick={() => setInviting(true)}>{m.users_invite()}</Button> : undefined}
			/>
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
						toolbar={
							<FilterBar values={search} preserve={["sort", "pageSize"]}>
								<UserFilterControls search={search} roles={roles} />
							</FilterBar>
						}
						activeFilters={<UserActiveFilters search={search} roles={roles} />}
						exportName="users"
						rowActions={rowActions}
						empty={
							<EmptyState
								variant={filtered ? "no-matches" : "empty"}
								description={m.users_empty()}
								primaryAction={filtered ? <ClearFiltersButton clearAll={CLEAR_USER_FILTERS} /> : null}
							/>
						}
					/>
					<Pagination {...pagination} />
				</>
			) : (
				<DataTableSkeleton columns={4} rows={8} />
			)}

			<Suspense>
				{editing && actor ? (
					<UserRolesDialog user={editing} roles={roles} actor={actor} onClose={() => setEditing(null)} />
				) : null}
				{inviting ? <InviteUserDialog onClose={() => setInviting(false)} /> : null}
			</Suspense>
		</Page>
	);
}
