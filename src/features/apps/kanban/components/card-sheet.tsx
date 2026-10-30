import { formOptions } from "@tanstack/react-form";
import { PlusIcon, Trash2Icon, XIcon } from "lucide-react";
import { useId } from "react";
import { z } from "zod";
import { useConfirm } from "@/components/dialogs/confirm";
import { FormSheet } from "@/components/dialogs/form-dialog";
import { formValidators, handleSaveError, useAppForm } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/i18n/intl";
import { isoDate, optionalText } from "@/lib/validation";
import { m } from "@/paraglide/messages";
import { CARD_DESCRIPTION_MAX, CARD_TITLE_MAX, CHECKLIST_MAX, cardTitle } from "../schema";
import { type ChecklistItem, KANBAN_LABELS, type KanbanCard, type KanbanLabel } from "../types";
import { labelName } from "./board";

const cardFormSchema = z.object({
	title: cardTitle(),
	description: optionalText({ max: CARD_DESCRIPTION_MAX }),
	labels: z.array(z.enum(KANBAN_LABELS)),
	dueOn: z.union([z.literal(""), isoDate()]),
	checklist: z.array(z.object({ id: z.string(), text: z.string().max(CARD_TITLE_MAX), done: z.boolean() })),
});

type CardFormValues = z.infer<typeof cardFormSchema>;

/** What a save changes on the card: empty checklist items are dropped, an empty date clears it. */
export const cardFormChanges = (values: CardFormValues) => ({
	title: values.title.trim(),
	description: values.description.trim(),
	labels: values.labels,
	dueOn: values.dueOn || null,
	checklist: values.checklist
		.map((item) => ({ ...item, text: item.text.trim() }))
		.filter((item) => item.text.length > 0),
});

export type CardFormChanges = ReturnType<typeof cardFormChanges>;

/**
 * Editing a card (decision 0188): title, description, labels, due date and checklist,
 * in a sheet. `onSave` applies the change optimistically and resolves once the server
 * has it (or rejects, and the form shows why); `onDelete` asks first.
 */
export default function CardSheet({
	card,
	onSave,
	onDelete,
	onClose,
}: {
	card: KanbanCard;
	onSave: (changes: CardFormChanges) => Promise<void>;
	onDelete: () => void;
	onClose: () => void;
}) {
	const confirm = useConfirm();
	const form = useAppForm({
		...formOptions({
			defaultValues: {
				title: card.title,
				description: card.description,
				labels: card.labels,
				dueOn: card.dueOn ?? "",
				checklist: card.checklist,
			} as CardFormValues,
			validators: formValidators(cardFormSchema),
		}),
		onSubmit: async ({ value, formApi }) => {
			try {
				await onSave(cardFormChanges(value));
				formApi.reset(value);
				onClose();
			} catch (error) {
				handleSaveError(formApi, error);
			}
		},
	});

	const remove = async () => {
		const confirmed = await confirm({
			title: m.crud_delete_title({ label: card.title }),
			description: m.crud_delete_body(),
			confirmLabel: m.crud_delete(),
			destructive: true,
		});
		if (confirmed) onDelete();
	};

	return (
		<form.AppForm>
			<FormSheet
				title={m.kanban_edit_card()}
				submitLabel={m.crud_save()}
				onClose={onClose}
				data-testid="kanban-card-sheet"
			>
				<form.AppField name="title">
					{(field) => <field.TextField label={m.kanban_card_title()} maxLength={CARD_TITLE_MAX} autoComplete="off" />}
				</form.AppField>
				<form.AppField name="description">
					{(field) => (
						<field.TextareaField
							label={m.kanban_card_description()}
							optional
							maxLength={CARD_DESCRIPTION_MAX}
							rows={4}
						/>
					)}
				</form.AppField>
				<form.AppField name="labels">
					{(field) => (
						<field.CheckboxGroupField
							label={m.kanban_card_labels()}
							optional
							options={KANBAN_LABELS.map((label: KanbanLabel) => ({ value: label, label: labelName(label) }))}
						/>
					)}
				</form.AppField>
				<form.AppField name="dueOn">
					{(field) => <field.DateField label={m.kanban_card_due()} optional />}
				</form.AppField>
				<form.Field name="checklist">
					{(field) => <ChecklistEditor items={field.state.value} onChange={(items) => field.handleChange(items)} />}
				</form.Field>
				<div className="border-t pt-4">
					<Button type="button" variant="outline" className="text-danger" onClick={() => void remove()}>
						<Trash2Icon aria-hidden />
						{m.kanban_delete_card()}
					</Button>
				</div>
			</FormSheet>
		</form.AppForm>
	);
}

/** The checklist: tick, rename or remove an item; add one (empty items are dropped on save). */
function ChecklistEditor({ items, onChange }: { items: ChecklistItem[]; onChange: (items: ChecklistItem[]) => void }) {
	const legendId = useId();
	const update = (id: string, change: Partial<ChecklistItem>) =>
		onChange(items.map((item) => (item.id === id ? { ...item, ...change } : item)));
	return (
		<fieldset aria-labelledby={legendId} className="flex flex-col gap-2">
			<legend id={legendId} className="font-medium text-body">
				{m.kanban_checklist()}
			</legend>
			<ul className="flex flex-col gap-2">
				{items.map((item, index) => (
					<li key={item.id} className="flex items-center gap-2">
						<Checkbox
							checked={item.done}
							onCheckedChange={(checked) => update(item.id, { done: checked === true })}
							aria-label={m.kanban_checklist_done({ item: item.text || formatIndex(index) })}
						/>
						<Input
							value={item.text}
							onChange={(event) => update(item.id, { text: event.target.value })}
							maxLength={CARD_TITLE_MAX}
							aria-label={m.kanban_checklist_item({ position: formatIndex(index) })}
							autoComplete="off"
						/>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={() => onChange(items.filter((each) => each.id !== item.id))}
						>
							<XIcon aria-hidden />
							<span className="sr-only">{m.kanban_checklist_remove({ item: item.text || formatIndex(index) })}</span>
						</Button>
					</li>
				))}
			</ul>
			{items.length < CHECKLIST_MAX ? (
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="self-start"
					onClick={() => onChange([...items, { id: crypto.randomUUID(), text: "", done: false }])}
				>
					<PlusIcon aria-hidden />
					{m.kanban_checklist_add()}
				</Button>
			) : null}
		</fieldset>
	);
}

const formatIndex = (index: number) => formatNumber(index + 1);
