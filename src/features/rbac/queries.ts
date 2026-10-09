import { type QueryClient, queryOptions } from "@tanstack/react-query";
import { listRoleOptions, listRoles, listUsers } from "@/functions/rbac";
import { authKeys } from "../auth/queries";
import type { UserListInput } from "./schema";

/** Query keys: everything under ["rbac"], so one invalidation refreshes roles and users. */
export const rbacKeys = {
	all: ["rbac"] as const,
	roles: () => [...rbacKeys.all, "roles"] as const,
	roleOptions: () => [...rbacKeys.all, "role-options"] as const,
	users: () => [...rbacKeys.all, "users"] as const,
	userList: (input: UserListInput) => [...rbacKeys.users(), input] as const,
};

export const rolesQueryOptions = () => queryOptions({ queryKey: rbacKeys.roles(), queryFn: () => listRoles() });

/** The same roles for the users page (needs users:read instead of roles:read). */
export const roleOptionsQueryOptions = () =>
	queryOptions({ queryKey: rbacKeys.roleOptions(), queryFn: () => listRoleOptions() });

export const usersListQueryOptions = (input: UserListInput) =>
	queryOptions({ queryKey: rbacKeys.userList(input), queryFn: () => listUsers({ data: input }) });

/**
 * After a role or permission change: refetch roles and users, and the signed-in
 * user's own session (their permissions may have changed too).
 */
export const refreshRbac = (queryClient: QueryClient) =>
	Promise.all([
		queryClient.invalidateQueries({ queryKey: rbacKeys.all }),
		queryClient.invalidateQueries({ queryKey: authKeys.session }),
	]);
