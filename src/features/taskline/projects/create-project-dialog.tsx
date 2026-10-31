import { formOptions } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { FormDialog } from "@/components/dialogs/form-dialog";
import { formValidators, handleSaveError, useAppForm } from "@/components/forms";
import { required } from "@/lib/validation";
import { m } from "@/paraglide/messages";
import { TASKLINE_COLOR_LABELS } from "../colors";
import { tasklineLinks } from "../links";
import { createProjectMutation } from "../queries";
import { PROJECT_NAME_MAX, projectKey, suggestKey } from "../schema";
import {
	PROJECT_VISIBILITIES,
	type ProjectVisibility,
	SANDBOX_SEGMENT,
	TASKLINE_COLORS,
	type TasklineColor,
} from "../types";

const formSchema = z.object({
	name: required({ max: PROJECT_NAME_MAX }),
	key: projectKey(),
	visibility: z.enum(PROJECT_VISIBILITIES),
	color: z.enum(TASKLINE_COLORS),
});

/**
 * "New project" (loaded on click, decision 0168): a name, the key its tasks are
 * numbered with (suggested from the name until typed), who sees it (team workspaces
 * only) and a colour. It opens with the workspace's default statuses, its creator as
 * lead; then the new project opens.
 */
export default function CreateProjectDialog({
	ws,
	userId,
	onClose,
}: {
	ws: string;
	userId: string;
	onClose: () => void;
}) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const create = useMutation(createProjectMutation(queryClient, userId));
	const team = ws !== SANDBOX_SEGMENT;
	const form = useAppForm({
		...formOptions({
			defaultValues: {
				name: "",
				key: "",
				visibility: "team" as ProjectVisibility,
				color: "teal" as TasklineColor,
			},
			validators: formValidators(formSchema),
		}),
		onSubmit: async ({ value, formApi }) => {
			try {
				const project = await create.mutateAsync({
					ws,
					name: value.name.trim(),
					key: value.key.trim().toUpperCase(),
					color: value.color,
					...(team ? { visibility: value.visibility } : {}),
				});
				formApi.reset(value);
				onClose();
				await navigate(tasklineLinks.project(ws, project.key));
			} catch (error) {
				handleSaveError(formApi, error);
			}
		},
	});
	return (
		<form.AppForm>
			<FormDialog
				title={m.taskline_project_new()}
				description={m.taskline_project_new_description()}
				submitLabel={m.taskline_project_create()}
				onClose={onClose}
				data-testid="create-project-dialog"
			>
				<form.AppField
					name="name"
					listeners={{
						// Suggest a key while the key field is still untouched.
						onChange: ({ value, fieldApi }) => {
							if (!fieldApi.form.getFieldMeta("key")?.isDirty)
								fieldApi.form.setFieldValue("key", suggestKey(value), { dontUpdateMeta: true });
						},
					}}
				>
					{(field) => (
						<field.TextField label={m.taskline_project_name()} maxLength={PROJECT_NAME_MAX} autoComplete="off" />
					)}
				</form.AppField>
				<form.AppField name="key">
					{(field) => (
						<field.TextField
							label={m.taskline_project_key()}
							description={m.taskline_project_key_hint()}
							maxLength={6}
							autoComplete="off"
						/>
					)}
				</form.AppField>
				{team ? (
					<form.AppField name="visibility">
						{(field) => (
							<field.SelectField
								label={m.taskline_project_visibility()}
								options={[
									{ value: "team", label: m.taskline_visibility_team_long() },
									{ value: "private", label: m.taskline_visibility_private_long() },
								]}
							/>
						)}
					</form.AppField>
				) : null}
				<form.AppField name="color">
					{(field) => (
						<field.SelectField
							label={m.taskline_project_color()}
							options={TASKLINE_COLORS.map((color) => ({ value: color, label: TASKLINE_COLOR_LABELS[color]() }))}
						/>
					)}
				</form.AppField>
			</FormDialog>
		</form.AppForm>
	);
}
