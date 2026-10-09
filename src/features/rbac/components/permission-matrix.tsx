import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Fragment } from "react";
import { toast } from "sonner";
import { errorMessage } from "@/components/errors/error-page";
import { Checkbox } from "@/components/ui/checkbox";
import { updateRolePermissions } from "@/functions/rbac";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import { PERMISSION_LABELS, RESOURCE_LABELS, roleLabel } from "../labels";
import { type Permission, permissionsOf, RESOURCES } from "../permissions";
import { rbacKeys, refreshRbac } from "../queries";
import type { RolePermissionsUpdate, RoleSummary } from "../schema";

type Actor = { isAdmin: boolean; permissions: ReadonlyArray<Permission> };

/** Applies a grant/revoke to the cached roles (the optimistic update). */
const applyChange = (roles: RoleSummary[], change: RolePermissionsUpdate): RoleSummary[] =>
	roles.map((role) =>
		role.id !== change.roleId
			? role
			: {
					...role,
					permissions: [...new Set([...role.permissions, ...change.grant])].filter(
						(permission) => !change.revoke.includes(permission),
					),
				},
	);

/**
 * Roles as columns, permissions grouped by resource as rows. Each change saves
 * at once: the box flips immediately (optimistic), and if the server refuses
 * (a rule, a lost connection) it flips back with a message. "All" boxes set a
 * whole resource for one role. Admin is always everything and can't be changed;
 * boxes the actor may not change (permissions they don't hold) are disabled.
 */
export function PermissionMatrix({
	roles,
	actor,
	canEdit,
}: {
	roles: ReadonlyArray<RoleSummary>;
	actor: Actor;
	canEdit: boolean;
}) {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: (change: RolePermissionsUpdate) => updateRolePermissions({ data: change }),
		onMutate: async (change) => {
			await queryClient.cancelQueries({ queryKey: rbacKeys.roles() });
			const previous = queryClient.getQueryData<RoleSummary[]>(rbacKeys.roles());
			if (previous) queryClient.setQueryData(rbacKeys.roles(), applyChange(previous, change));
			return { previous };
		},
		onError: (failure, _change, context) => {
			if (context?.previous) queryClient.setQueryData(rbacKeys.roles(), context.previous);
			toast.error(m.matrix_toast_failed(), { description: errorMessage(failure) });
		},
		onSettled: () => refreshRbac(queryClient),
	});

	const editable = (role: RoleSummary, permission: Permission) =>
		canEdit && role.key !== "admin" && (actor.isAdmin || actor.permissions.includes(permission));
	const set = (role: RoleSummary, permissions: Permission[], on: boolean) => {
		const changeable = permissions.filter((permission) => editable(role, permission));
		const grant = on ? changeable.filter((permission) => !role.permissions.includes(permission)) : [];
		const revoke = on ? [] : changeable.filter((permission) => role.permissions.includes(permission));
		if (grant.length + revoke.length > 0) mutation.mutate({ roleId: role.id, grant, revoke });
	};

	return (
		<div className="overflow-x-auto rounded-md border" data-testid="permission-matrix">
			<table className="w-full border-collapse text-sm">
				<caption className="sr-only">{m.matrix_title()}</caption>
				<thead>
					<tr className="border-b bg-muted/40">
						<th scope="col" className="sticky start-0 z-10 bg-muted px-3 py-2 text-start font-medium">
							{m.matrix_permission()}
						</th>
						{roles.map((role) => (
							<th key={role.id} scope="col" className="min-w-28 px-3 py-2 text-center font-medium">
								{roleLabel(role)}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{RESOURCES.map((resource) => {
						const permissions = permissionsOf(resource);
						return (
							<Fragment key={resource}>
								<tr className="border-b bg-muted/20">
									<th scope="rowgroup" className="sticky start-0 z-10 bg-muted px-3 py-2 text-start font-semibold">
										{RESOURCE_LABELS[resource]()}
									</th>
									{roles.map((role) => {
										const held = permissions.filter((permission) => role.permissions.includes(permission)).length;
										const anyEditable = permissions.some((permission) => editable(role, permission));
										return (
											<td key={role.id} className="px-3 py-2 text-center">
												<Checkbox
													aria-label={m.matrix_all_of({ resource: RESOURCE_LABELS[resource](), role: roleLabel(role) })}
													checked={held === permissions.length ? true : held > 0 ? "indeterminate" : false}
													disabled={!anyEditable}
													onCheckedChange={(checked) => set(role, permissions, checked === true)}
												/>
											</td>
										);
									})}
								</tr>
								{permissions.map((permission) => (
									<tr key={permission} className="border-b last:border-b-0">
										<th scope="row" className="sticky start-0 z-10 bg-background px-3 py-2 ps-6 text-start font-normal">
											{PERMISSION_LABELS[permission]()}
										</th>
										{roles.map((role) => (
											<td key={role.id} className={cn("px-3 py-2 text-center", role.key === "admin" && "bg-muted/20")}>
												<Checkbox
													aria-label={m.matrix_toggle({
														role: roleLabel(role),
														permission: PERMISSION_LABELS[permission](),
													})}
													checked={role.permissions.includes(permission)}
													disabled={!editable(role, permission)}
													onCheckedChange={(checked) => set(role, [permission], checked === true)}
													data-permission={permission}
													data-role={role.key}
												/>
											</td>
										))}
									</tr>
								))}
							</Fragment>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
