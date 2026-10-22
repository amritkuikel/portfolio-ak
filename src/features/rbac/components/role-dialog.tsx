import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { FormDialog } from "@/components/dialogs/form-dialog";
import { clearServerErrorOnChange, formValidators, handleSaveError, useAppForm } from "@/components/forms";
import { createRole, updateRole } from "@/functions/rbac";
import { m } from "@/paraglide/messages";
import { refreshRbac, rolesQueryOptions } from "../queries";
import { ROLE_NAME_MAX, type RoleFormValues, type RoleSummary, roleInputSchema } from "../schema";

/**
 * Create a custom role, or rename one (`role` given). Permissions are set in the
 * matrix. A rename sends the role's `updatedAt`; if someone renamed it since,
 * StaleVersionAlert offers to reload it into the form.
 */
export function RoleDialog({ role: opened, onClose }: { role?: RoleSummary; onClose: () => void }) {
	const queryClient = useQueryClient();
	const [role, setRole] = useState(opened);
	const [stale, setStale] = useState(false);
	const reload = async () => {
		if (!role) return;
		const roles = await queryClient.fetchQuery({ ...rolesQueryOptions(), staleTime: 0 });
		const latest = roles.find((each) => each.id === role.id);
		if (!latest) {
			toast.error(m.error_not_found());
			onClose();
			return;
		}
		setRole(latest);
		setStale(false);
		form.reset({ name: latest.name, description: latest.description });
	};
	const form = useAppForm({
		defaultValues: { name: role?.name ?? "", description: role?.description ?? "" } satisfies RoleFormValues,
		validators: formValidators(roleInputSchema),
		listeners: { onChange: clearServerErrorOnChange },
		onSubmit: async ({ value, formApi }) => {
			try {
				if (role) await updateRole({ data: { id: role.id, updatedAt: role.updatedAt, ...value } });
				else await createRole({ data: value });
				await refreshRbac(queryClient);
				toast.success(role ? m.roles_toast_saved() : m.roles_toast_created());
				onClose();
			} catch (error) {
				handleSaveError(formApi, error, () => setStale(true));
			}
		},
	});
	return (
		<form.AppForm>
			<FormDialog
				title={role ? m.roles_dialog_edit_title() : m.roles_dialog_new_title()}
				description={m.roles_dialog_description()}
				submitLabel={role ? m.roles_save() : m.roles_create()}
				onClose={onClose}
				stale={stale ? reload : undefined}
				data-testid="role-dialog"
			>
				<form.AppField name="name">
					{(field) => <field.TextField label={m.roles_field_name()} maxLength={ROLE_NAME_MAX} />}
				</form.AppField>
				<form.AppField name="description">
					{(field) => <field.TextareaField label={m.roles_field_description()} optional rows={3} />}
				</form.AppField>
			</FormDialog>
		</form.AppForm>
	);
}
