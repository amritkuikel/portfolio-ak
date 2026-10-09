# Forms

TanStack Form with the app's field library: one Zod schema for the browser and the server, localized messages, accessible fields and server errors on the right field. Examples: `/dev/examples/forms`, and every field at `/dev/forms` (`pnpm dev`).

## A form

```tsx
const schema = z.object({ name: required({ max: 80 }), price: currency({ max: 10_000_000 }) }); // src/lib/validation.ts

function ThingForm() {
	const form = useAppForm({
		defaultValues: { name: "", price: undefined as number | undefined },
		validators: formValidators(schema),          // on change, blur and submit
		listeners: { onChange: clearServerErrorOnChange },
		onSubmit: async ({ value, formApi }) => {
			try {
				await saveThing({ data: value });
				toast.success(m.things_saved());
			} catch (error) {
				if (!applyServerFieldErrors(formApi, error)) toast.error(errorMessage(error));
			}
		},
	});
	return (
		<form.AppForm>
			<form.Form>
				<form.FormErrorSummary />
				<form.AppField name="name">{(field) => <field.TextField label={m.things_name()} />}</form.AppField>
				<form.AppField name="price">{(field) => <field.CurrencyField label={m.things_price()} />}</form.AppField>
				<form.SubmitButton pendingLabel={m.things_saving()}>{m.things_save()}</form.SubmitButton>
			</form.Form>
		</form.AppForm>
	);
}
```

- **One schema:** the server function validates with the same schema (`validator(zodInput(schema))`), so the rules can't drift. Build schemas from `src/lib/validation.ts`: its helpers return localized messages and parse what the fields store.
- **When errors show:** after a field is left or a submit is tried. A failed submit shows `FormErrorSummary`, which takes focus and links to each field.
- **Server errors:** a refusal with `fieldErrors` (e.g. `CONFLICT` on `slug`) appears on that field. Editing the field clears it. Other errors go to a toast.
- **Unsaved changes:** `<UnsavedChangesGuard when={() => !saved.current && !form.state.isDefaultValue} />` blocks navigation and asks first.
- **Form arrays updated from async work** (uploads): use the field's atomic helpers (`field.pushValue`), never a value read earlier (0099).
- **`method="post"`:** `form.Form` sets it, and every hand-written `<form>` must too (a test checks). A submit before hydration then posts the values instead of putting them in the URL (0104).

## Fields

`TextField`, `TextareaField`, `EmailField`, `PasswordField`, `UrlField`, `NumberField`, `CurrencyField`, `SelectField`, `ComboboxField`, `MultiSelectField`, `RadioGroupField`, `CheckboxField`, `CheckboxGroupField`, `SwitchField`, `PhoneField`, `OtpField`, `DateField`, `DateRangeField`, `TimeField`, `SliderField`, `TagsInputField`, `ColorField`, `FileField`, `ImageField`, `RichTextField`. Each takes `label`, an optional `description` and `optional`, and wires `aria-invalid`, `aria-describedby` and the error text.

| Field | Stores | Validate with |
| --- | --- | --- |
| `NumberField`, `CurrencyField` | `number` (Devanagari digits and separators accepted) | `numberRange()`, `currency()` |
| `PhoneField` | E.164 string (Nepal by default) | `phone()` |
| `DateField`, `DateRangeField`, `TimeField` | `"YYYY-MM-DD"`, `{ from, to }`, `"HH:mm"` | `isoDate()`, `dateRange()`, `time()` |
| `TagsInputField` | `string[]` | `tags()` |
| `FileField`, `ImageField` | `File[]` | `files({ maxBytes, accept })` |
| `RichTextField` | HTML (untrusted) | `richText()`; sanitize on the server |

- **Images for a record** are not `ImageField`: use `AttachmentsField` (Cloudinary uploads, [attachments.md](attachments.md)).
- **Rich text:** the editor loads only in the browser, and the server renders a same-size placeholder. On the server, pass its HTML through `sanitizeRichText()` before storing it and again before sending it to a page, then render it with `<RichTextContent html={safe} />`. That component only accepts the `SafeHtml` the sanitizer returns.

## Adding a field type

Put it in `src/components/forms/fields/`, render it inside `FieldShell` (label, description, errors, ids), register it in `src/components/forms/index.ts`, add a story wrapped in `FieldStory` with a `play` function, and add a jsdom test next to the others in `tests/components/forms/`.
