import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { FormDialog } from "@/components/dialogs/form-dialog";
import { formValidators, handleSaveError, useAppForm } from "@/components/forms";
import { setUserRoles } from "@/functions/rbac";
import { m } from "@/paraglide/messages";
import { roleDescription, roleLabel } from "../labels";
import { hasAll, type Permission } from "../permissions";
import { refreshRbac } from "../queries";
import type { RoleSummary, UserListItem } from "../schema";

const formSchema = z.object({ admin: z.boolean(), roleIds: z.array(z.string()) });

export type Actor = { id: string; isAdmin: boolean; permissions: ReadonlyArray<Permission> };

/**
 * A user's roles: the Admin flag and custom roles. Options the actor may not
 * hand out are shown disabled (the same rules the server enforces: only admins
 * make admins; others only hand out roles within their own permissions).
 */
export function UserRolesDialog({
	user,
	roles,
	actor,
	onClose,
}: {
	user: UserListItem;
	roles: ReadonlyArray<RoleSummary>;
	actor: Actor;
	onClose: () => void;
}) {
	const queryClient = useQueryClient();
	const self = user.id === actor.id;
	const custom = roles.filter((role) => !role.system);
	const form = useAppForm({
		defaultValues: { admin: user.isAdmin, roleIds: user.roles.map((role) => role.id) },
		validators: formValidators(formSchema),
		onSubmit: async ({ value, formApi }) => {
			try {
				await setUserRoles({ data: { userId: user.id, admin: value.admin, roleIds: value.roleIds } });
				await refreshRbac(queryClient);
				toast.success(m.users_toast_roles_saved());
				onClose();
			} catch (error) {
				handleSaveError(formApi, error);
			}
		},
	});
	const locked = self || (user.isAdmin && !actor.isAdmin);
	return (
		<form.AppForm>
			<FormDialog
				title={m.users_roles_dialog_title({ name: user.name })}
				description={self ? m.users_roles_self() : m.users_roles_dialog_description()}
				submitLabel={m.users_roles_save()}
				readOnly={locked}
				onClose={onClose}
				data-testid="user-roles-dialog"
			>
				<form.AppField name="admin">
					{(field) => (
						<field.CheckboxField
							label={m.role_admin_name()}
							description={m.role_admin_description()}
							disabled={locked || !actor.isAdmin}
						/>
					)}
				</form.AppField>
				{custom.length > 0 ? (
					<form.AppField name="roleIds">
						{(field) => (
							<field.CheckboxGroupField
								label={m.users_col_roles()}
								optional
								options={custom.map((role) => ({
									value: role.id,
									label: roleLabel(role),
									description: roleDescription(role) || undefined,
									disabled: locked || (!actor.isAdmin && !hasAll(actor.permissions, role.permissions)),
								}))}
							/>
						)}
					</form.AppField>
				) : null}
			</FormDialog>
		</form.AppForm>
	);
}
