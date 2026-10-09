import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { errorMessage } from "@/components/errors/error-page";
import { applyServerFieldErrors, clearServerErrorOnChange, formValidators, useAppForm } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createRole, updateRole } from "@/functions/rbac";
import { m } from "@/paraglide/messages";
import { refreshRbac } from "../queries";
import { ROLE_NAME_MAX, type RoleFormValues, type RoleSummary, roleInputSchema } from "../schema";

/** Create a custom role, or rename one (`role` given). Permissions are set in the matrix. */
export function RoleDialog({ role, onClose }: { role?: RoleSummary; onClose: () => void }) {
	const queryClient = useQueryClient();
	const form = useAppForm({
		defaultValues: { name: role?.name ?? "", description: role?.description ?? "" } satisfies RoleFormValues,
		validators: formValidators(roleInputSchema),
		listeners: { onChange: clearServerErrorOnChange },
		onSubmit: async ({ value, formApi }) => {
			try {
				if (role) await updateRole({ data: { id: role.id, ...value } });
				else await createRole({ data: value });
				await refreshRbac(queryClient);
				toast.success(role ? m.roles_toast_saved() : m.roles_toast_created());
				onClose();
			} catch (error) {
				if (!applyServerFieldErrors(formApi, error)) toast.error(errorMessage(error));
			}
		},
	});
	return (
		<Dialog open onOpenChange={(open) => !open && onClose()}>
			<DialogContent data-testid="role-dialog">
				<DialogHeader>
					<DialogTitle>{role ? m.roles_dialog_edit_title() : m.roles_dialog_new_title()}</DialogTitle>
					<DialogDescription>{m.roles_dialog_description()}</DialogDescription>
				</DialogHeader>
				<form.AppForm>
					<form.Form className="flex flex-col gap-6">
						<form.FormErrorSummary />
						<form.AppField name="name">
							{(field) => <field.TextField label={m.roles_field_name()} maxLength={ROLE_NAME_MAX} />}
						</form.AppField>
						<form.AppField name="description">
							{(field) => <field.TextareaField label={m.roles_field_description()} optional rows={3} />}
						</form.AppField>
						<div className="flex flex-wrap gap-3">
							<form.SubmitButton>{role ? m.roles_save() : m.roles_create()}</form.SubmitButton>
							<Button type="button" variant="ghost" onClick={onClose}>
								{m.common_cancel()}
							</Button>
						</div>
					</form.Form>
				</form.AppForm>
			</DialogContent>
		</Dialog>
	);
}
