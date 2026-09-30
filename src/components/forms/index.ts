/**
 * The app's form system (TanStack Form composition API).
 *
 *   const form = useAppForm({ defaultValues, validators: formValidators(schema), onSubmit })
 *   <form.AppForm>
 *     <form.Form>
 *       <form.FormErrorSummary />
 *       <form.AppField name="email">{(field) => <field.EmailField label={m.auth_email_label()} />}</form.AppField>
 *       <form.SubmitButton>{m.account_save()}</form.SubmitButton>
 *     </form.Form>
 *   </form.AppForm>
 *
 * Validate with schemas built from src/lib/validation.ts so messages are localized.
 */
import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "./contexts";
import {
	CheckboxField,
	CheckboxGroupField,
	ComboboxField,
	MultiSelectField,
	RadioGroupField,
	SelectField,
	SwitchField,
} from "./fields/choice-fields";
import { CurrencyField, NumberField } from "./fields/number-fields";
import { EmailField, PasswordField, TextareaField, TextField, UrlField } from "./fields/text-fields";
import { Form, FormErrorSummary, SubmitButton } from "./form-components";

export const { useAppForm, withForm } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {
		TextField,
		TextareaField,
		EmailField,
		PasswordField,
		NumberField,
		CurrencyField,
		SelectField,
		ComboboxField,
		MultiSelectField,
		RadioGroupField,
		CheckboxField,
		CheckboxGroupField,
		SwitchField,
		UrlField,
	},
	formComponents: { Form, SubmitButton, FormErrorSummary },
});

/**
 * Runs one schema on change, on blur and on submit. Blur catches fields the user
 * tabbed through without typing; submit catches fields never touched. Errors are
 * only shown once a field was blurred or a submit was attempted (see useFieldA11y).
 */
export const formValidators = <TSchema>(schema: TSchema) => ({ onChange: schema, onBlur: schema, onSubmit: schema });

export type { FieldOption } from "./fields/choice-fields";
