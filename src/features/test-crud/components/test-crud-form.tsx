import { useStore } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useRef } from "react";
import { toast } from "sonner";
import { errorMessage } from "@/components/errors/error-page";
import {
	applyServerFieldErrors,
	clearServerErrorOnChange,
	formValidators,
	UnsavedChangesGuard,
	useAppForm,
} from "@/components/forms";
import { Button } from "@/components/ui/button";
import { createTestCrud, updateTestCrud } from "@/functions/test-crud";
import { m } from "@/paraglide/messages";
import { testCrudKeys } from "../queries";
import {
	imageRules,
	slugify,
	TEST_CRUD_STATUSES,
	type TestCrudDetail,
	type TestCrudFormValues,
	type TestCrudInput,
	testCrudFormSchema,
} from "../schema";
import { STATUS_LABELS } from "./test-crud-table";

const toFormValues = (item: TestCrudDetail | undefined): TestCrudFormValues => ({
	title: item?.title ?? "",
	slug: item?.slug ?? "",
	summary: item?.summary ?? "",
	body: item?.body ?? "",
	status: item?.status ?? "draft",
	price: item?.price ?? 0,
	phone: item?.phone ?? "",
	tags: item?.tags ?? [],
	image: [],
	removeImage: false,
});

/** FormData for createTestCrud / updateTestCrud: shared-schema JSON + optional file. */
const toFormData = (value: TestCrudFormValues, id: string | undefined) => {
	const { image, removeImage, ...fields } = value;
	const data = new FormData();
	data.set("data", JSON.stringify(fields satisfies Record<keyof TestCrudInput, unknown>));
	const [file] = image;
	if (file) data.set("image", file);
	if (removeImage) data.set("removeImage", "1");
	if (id) data.set("id", id);
	return data;
};

/**
 * Create and edit form, built only from the reusable fields. The same Zod schema
 * validates here and on the server; server-only failures (slug taken, image
 * rejected) come back as field errors on the matching fields.
 */
export function TestCrudForm({ item }: { item?: TestCrudDetail }) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const saved = useRef(false);
	// New items: the slug follows the title until the user edits it themselves.
	const slugEdited = useRef(Boolean(item));

	const form = useAppForm({
		defaultValues: toFormValues(item),
		validators: formValidators(testCrudFormSchema),
		listeners: { onChange: clearServerErrorOnChange },
		onSubmit: async ({ value, formApi }) => {
			try {
				const data = toFormData(value, item?.id);
				const result = item ? await updateTestCrud({ data }) : await createTestCrud({ data });
				saved.current = true;
				queryClient.setQueryData(testCrudKeys.detail(result.id), result);
				await queryClient.invalidateQueries({ queryKey: testCrudKeys.lists() });
				toast.success(item ? m.test_crud_toast_saved() : m.test_crud_toast_created());
				await navigate({ to: "/admin/test-crud" });
			} catch (error) {
				if (!applyServerFieldErrors(formApi, error)) toast.error(errorMessage(error));
			}
		},
	});
	const removeImage = useStore(form.store, (state) => state.values.removeImage);
	const statusOptions = TEST_CRUD_STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status]() }));

	return (
		<form.AppForm>
			<UnsavedChangesGuard when={() => !saved.current && !form.state.isDefaultValue} />
			<form.Form className="flex max-w-3xl flex-col gap-6" data-testid="test-crud-form">
				<form.FormErrorSummary />
				<form.AppField
					name="title"
					listeners={{
						onChange: ({ value }) => {
							if (!slugEdited.current) form.setFieldValue("slug", slugify(value));
						},
					}}
				>
					{(field) => <field.TextField label={m.test_crud_field_title()} maxLength={120} />}
				</form.AppField>
				<form.AppField
					name="slug"
					listeners={{
						onChange: ({ value }) => {
							slugEdited.current = value !== slugify(form.getFieldValue("title"));
						},
					}}
				>
					{(field) => (
						<field.TextField
							label={m.test_crud_field_slug()}
							description={m.test_crud_field_slug_description()}
							autoComplete="off"
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
				<form.AppField name="image">
					{(field) => (
						<field.ImageField
							label={m.test_crud_field_image()}
							optional
							maxBytes={imageRules.maxBytes}
							accept={imageRules.accept}
							current={
								item?.imageUrl
									? {
											url: item.imageUrl,
											removed: removeImage,
											onRemove: () => form.setFieldValue("removeImage", true),
											onKeep: () => form.setFieldValue("removeImage", false),
										}
									: undefined
							}
						/>
					)}
				</form.AppField>
				<div className="flex flex-wrap items-center gap-3">
					<form.SubmitButton pendingLabel={m.test_crud_saving()}>
						{item ? m.test_crud_save() : m.test_crud_create()}
					</form.SubmitButton>
					<Button variant="ghost" asChild>
						<Link to="/admin/test-crud">{m.test_crud_back()}</Link>
					</Button>
				</div>
			</form.Form>
		</form.AppForm>
	);
}
