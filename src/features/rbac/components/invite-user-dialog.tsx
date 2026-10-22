import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FormDialog } from "@/components/dialogs/form-dialog";
import { clearServerErrorOnChange, formValidators, handleSaveError, useAppForm } from "@/components/forms";
import { inviteUser } from "@/functions/rbac";
import { m } from "@/paraglide/messages";
import { getLocale, type Locale } from "@/paraglide/runtime";
import { refreshRbac } from "../queries";
import { type UserInviteValues, userInviteSchema } from "../schema";

const LANGUAGE_LABELS: Record<Locale, () => string> = { en: m.language_en, ne: m.language_ne };

/**
 * Invite someone by email (decisions.md 0133). Their account is created at once
 * (the baseline role); the email, in the language picked here, links to choosing
 * a password. Roles are given afterwards, from the list.
 */
export function InviteUserDialog({ onClose }: { onClose: () => void }) {
	const queryClient = useQueryClient();
	const form = useAppForm({
		defaultValues: { name: "", email: "", locale: getLocale() } satisfies UserInviteValues,
		validators: formValidators(userInviteSchema),
		listeners: { onChange: clearServerErrorOnChange },
		onSubmit: async ({ value, formApi }) => {
			try {
				await inviteUser({ data: value });
				await refreshRbac(queryClient);
				toast.success(m.users_toast_invited({ email: value.email.trim() }));
				onClose();
			} catch (error) {
				handleSaveError(formApi, error);
			}
		},
	});
	return (
		<form.AppForm>
			<FormDialog
				title={m.users_invite_title()}
				description={m.users_invite_description()}
				submitLabel={m.users_invite_send()}
				onClose={onClose}
				data-testid="invite-user-dialog"
			>
				<form.AppField name="name">
					{(field) => <field.TextField label={m.users_invite_name()} maxLength={80} autoComplete="off" />}
				</form.AppField>
				<form.AppField name="email">
					{(field) => <field.EmailField label={m.users_invite_email()} autoComplete="off" />}
				</form.AppField>
				<form.AppField name="locale">
					{(field) => (
						<field.SelectField
							label={m.users_invite_language()}
							options={(Object.keys(LANGUAGE_LABELS) as Locale[]).map((locale) => ({
								value: locale,
								label: LANGUAGE_LABELS[locale](),
							}))}
						/>
					)}
				</form.AppField>
			</FormDialog>
		</form.AppForm>
	);
}
