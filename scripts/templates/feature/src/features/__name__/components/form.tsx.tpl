import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
	clearServerErrorOnChange,
	formValidators,
	handleSaveError,
	StaleVersionAlert,
	UnsavedChangesGuard,
	useAppForm,
} from "@/components/forms";
import { Button } from "@/components/ui/button";
import { create__Pascal__, update__Pascal__ } from "@/functions/__name__";
import { m } from "@/paraglide/messages";
import { __camel__DetailQueryOptions, __camel__Keys, invalidate__Pascal__Lists } from "../queries";
import { type __Pascal__Detail, type __Pascal__FormValues, __camel__InputSchema } from "../schema";

const toFormValues = (row: __Pascal__Detail | undefined): __Pascal__FormValues => ({
	title: row?.title ?? "",
	notes: row?.notes ?? "",
});

/** The form's React key: another row, or a newer version of the same one, gets fresh defaults. */
export const __camel__FormKey = (row: __Pascal__Detail) => `${row.id}@${row.updatedAt}`;

/**
 * Create and edit form. The same Zod schema validates here and on the server.
 * Edits send the row's `updatedAt`: if someone changed it since, the save is
 * refused and StaleVersionAlert offers a reload (render it keyed by __camel__FormKey).
 */
export function __Pascal__Form({ row }: { row?: __Pascal__Detail }) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const saved = useRef(false);
	const [stale, setStale] = useState(false);
	const reload = () =>
		row ? queryClient.fetchQuery({ ...__camel__DetailQueryOptions(row.id), staleTime: 0 }) : Promise.resolve();

	const form = useAppForm({
		defaultValues: toFormValues(row),
		validators: formValidators(__camel__InputSchema),
		listeners: { onChange: clearServerErrorOnChange },
		onSubmit: async ({ value, formApi }) => {
			try {
				const input = __camel__InputSchema.parse(value);
				const result = row
					? await update__Pascal__({ data: { ...input, id: row.id, updatedAt: row.updatedAt } })
					: await create__Pascal__({ data: input });
				saved.current = true;
				queryClient.setQueryData(__camel__Keys.detail(result.id), result);
				await invalidate__Pascal__Lists(queryClient);
				toast.success(row ? m.__snake___toast_saved() : m.__snake___toast_created());
				await navigate({ to: "/admin/__name__" });
			} catch (error) {
				handleSaveError(formApi, error, () => setStale(true));
			}
		},
	});

	return (
		<form.AppForm>
			<UnsavedChangesGuard when={() => !saved.current && !form.state.isDefaultValue} />
			<form.Form className="flex max-w-3xl flex-col gap-6" data-testid="__name__-form">
				{stale ? <StaleVersionAlert onReload={reload} /> : null}
				<form.FormErrorSummary />
				<form.AppField name="title">
					{(field) => <field.TextField label={m.__snake___field_title()} maxLength={120} />}
				</form.AppField>
				<form.AppField name="notes">
					{(field) => (
						<field.TextareaField label={m.__snake___field_notes()} optional rows={4} maxLength={2000} showCount />
					)}
				</form.AppField>
				<div className="flex flex-wrap items-center gap-3">
					<form.SubmitButton pendingLabel={m.__snake___saving()}>
						{row ? m.__snake___save() : m.__snake___create()}
					</form.SubmitButton>
					<Button variant="ghost" asChild>
						<Link to="/admin/__name__">{m.__snake___back()}</Link>
					</Button>
				</div>
			</form.Form>
		</form.AppForm>
	);
}
