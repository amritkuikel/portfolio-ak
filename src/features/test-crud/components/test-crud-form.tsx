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
import { SlugField, slugValidators } from "@/components/forms/fields/slug-field";
import { StickyFormBar } from "@/components/page/form-layout";
import { Button } from "@/components/ui/button";
import { ImageGalleryField } from "@/features/attachments/components/image-gallery-field";
import { TEST_CRUD_MAX_IMAGES } from "@/features/attachments/constants";
import { createTestCrud, isTestCrudSlugFree, updateTestCrud } from "@/functions/test-crud";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import { STATUS_LABELS } from "../labels";
import { invalidateTestCrudLists, testCrudDetailQueryOptions, testCrudKeys } from "../queries";
import {
	TEST_CRUD_STATUSES,
	type TestCrudDetail,
	type TestCrudFormValues,
	testCrudFormSchema,
	toTestCrudInput,
} from "../schema";

const toFormValues = (item: TestCrudDetail | undefined): TestCrudFormValues => ({
	title: item?.title ?? "",
	slug: item?.slug ?? "",
	summary: item?.summary ?? "",
	body: item?.body ?? "",
	status: item?.status ?? "draft",
	price: item?.price ?? 0,
	phone: item?.phone ?? "",
	tags: item?.tags ?? [],
	images: (item?.images ?? []).map((preview) => ({ id: preview.id, alt: preview.alt, preview })),
});

/** The form's React key: a new item, or a newer version of the same one, gets fresh defaults. */
export const testCrudFormKey = (item: TestCrudDetail) => `${item.id}@${item.updatedAt}`;

/**
 * Create and edit form, built only from the reusable fields. The same Zod schema
 * validates here and on the server; server-only failures (slug taken, image
 * rejected) come back as field errors on the matching fields.
 *
 * Edits send the item's `updatedAt`: if someone changed it since, the save is
 * refused and StaleVersionAlert offers a reload. Render it keyed by
 * `testCrudFormKey(item)` so the reloaded item remounts it with fresh defaults.
 */
export function TestCrudForm({
	item,
	onSaved,
	onCancel,
	className,
}: {
	item?: TestCrudDetail;
	/** After a successful save (default: go to the list). The edit dialog closes itself instead. */
	onSaved?: (saved: TestCrudDetail) => void;
	/** Replaces the "Back to list" link with a button (the edit dialog's close). */
	onCancel?: () => void;
	className?: string;
}) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const saved = useRef(false);
	/** Image uploads in progress (submitting waits for them). */
	const uploading = useRef(false);
	const [stale, setStale] = useState(false);
	// The newer item replaces this one in the cache; the parent's key remounts the form with it.
	const reload = () =>
		item ? queryClient.fetchQuery({ ...testCrudDetailQueryOptions(item.id), staleTime: 0 }) : Promise.resolve();

	const form = useAppForm({
		defaultValues: toFormValues(item),
		validators: formValidators(testCrudFormSchema),
		listeners: { onChange: clearServerErrorOnChange },
		onSubmit: async ({ value, formApi }) => {
			try {
				const input = toTestCrudInput(testCrudFormSchema.parse(value));
				const result = item
					? await updateTestCrud({ data: { ...input, id: item.id, updatedAt: item.updatedAt } })
					: await createTestCrud({ data: input });
				saved.current = true;
				queryClient.setQueryData(testCrudKeys.detail(result.id), result);
				await invalidateTestCrudLists(queryClient);
				toast.success(item ? m.test_crud_toast_saved() : m.test_crud_toast_created());
				if (onSaved) onSaved(result);
				else await navigate({ to: "/admin/test-crud" });
			} catch (error) {
				handleSaveError(formApi, error, () => setStale(true));
			}
		},
	});
	const statusOptions = TEST_CRUD_STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status]() }));

	return (
		<form.AppForm>
			<UnsavedChangesGuard when={() => !saved.current && !form.state.isDefaultValue} />
			<form.Form className={cn("flex max-w-3xl flex-col gap-6", className)} data-testid="test-crud-form">
				{stale ? <StaleVersionAlert onReload={reload} /> : null}
				<form.FormErrorSummary />
				<form.AppField name="title">
					{(field) => <field.TextField label={m.test_crud_field_title()} maxLength={120} />}
				</form.AppField>
				{/* New items: the slug follows the title until the user edits it; a taken slug shows as you type. */}
				<form.AppField
					name="slug"
					validators={slugValidators({
						from: "title",
						isAvailable: (slug) => isTestCrudSlugFree({ data: { slug, ...(item ? { id: item.id } : {}) } }),
					})}
				>
					{() => (
						<SlugField
							label={m.test_crud_field_slug()}
							description={m.test_crud_field_slug_description()}
							from="title"
							fromLabel={m.test_crud_field_title()}
							linked={!item}
						/>
					)}
				</form.AppField>
				<form.AppField name="summary">
					{(field) => (
						<field.TextareaField label={m.test_crud_field_summary()} optional rows={3} maxLength={280} showCount />
					)}
				</form.AppField>
				<form.AppField name="body">
					{(field) => <field.RichTextField label={m.test_crud_field_body()} optional />}
				</form.AppField>
				<div className="grid gap-6 sm:grid-cols-2">
					<form.AppField name="status">
						{(field) => <field.RadioGroupField label={m.test_crud_field_status()} options={statusOptions} />}
					</form.AppField>
					<form.AppField name="price">
						{(field) => <field.CurrencyField label={m.test_crud_field_price()} />}
					</form.AppField>
				</div>
				<form.AppField name="phone">
					{(field) => <field.PhoneField label={m.test_crud_field_phone()} optional />}
				</form.AppField>
				<form.AppField name="tags">
					{(field) => <field.TagsInputField label={m.test_crud_field_tags()} optional />}
				</form.AppField>
				<form.AppField
					name="images"
					validators={{ onSubmit: () => (uploading.current ? m.attachments_field_wait() : undefined) }}
				>
					{() => (
						<ImageGalleryField
							label={m.test_crud_field_image()}
							scope="test-crud"
							max={TEST_CRUD_MAX_IMAGES}
							onBusyChange={(busy) => {
								uploading.current = busy;
							}}
						/>
					)}
				</form.AppField>
				<StickyFormBar
					submitLabel={item ? m.test_crud_save() : m.test_crud_create()}
					pendingLabel={m.test_crud_saving()}
					cancel={
						onCancel ? (
							<Button type="button" variant="ghost" onClick={onCancel}>
								{m.common_cancel()}
							</Button>
						) : (
							<Button variant="ghost" asChild>
								<Link to="/admin/test-crud">{m.test_crud_back()}</Link>
							</Button>
						)
					}
				/>
			</form.Form>
		</form.AppForm>
	);
}
