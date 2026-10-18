import type { AnyFieldApi, AnyFormApi } from "@tanstack/react-form";
import { toast } from "sonner";
import { errorMessage } from "@/components/errors/error-page";
import { isStaleError } from "@/lib/concurrency";
import { isAppError } from "@/lib/errors";

/**
 * Shows an AppError's per-field errors (e.g. CONFLICT on `slug`, BAD_REQUEST on
 * `image`) on the matching fields, under the `onServer` validation key. They
 * appear in the field and in FormErrorSummary like client errors. Returns false
 * when the error has no field errors (show a toast instead). Keys starting with
 * "_" aren't fields (`_form` is the message for the whole action, see errorMessage).
 */
export function applyServerFieldErrors(form: AnyFormApi, error: unknown): boolean {
	if (!isAppError(error) || !error.fieldErrors) return false;
	const entries = Object.entries(error.fieldErrors).filter(([field]) => !field.startsWith("_"));
	for (const [field, messages] of entries) {
		form.setFieldMeta(field, (meta) => ({
			...meta,
			isBlurred: true,
			errorMap: { ...meta.errorMap, onServer: messages.join(" ") },
		}));
	}
	return entries.length > 0;
}

/**
 * A form's failed save: a stale CONFLICT calls `onStale` (show StaleVersionAlert),
 * field errors go on their fields, anything else is a toast.
 */
export function handleSaveError(form: AnyFormApi, error: unknown, onStale?: () => void) {
	if (onStale && isStaleError(error)) onStale();
	else if (!applyServerFieldErrors(form, error)) toast.error(errorMessage(error));
}

/** Form `listeners.onChange`: editing a field clears the server error shown on it. */
export const clearServerErrorOnChange = ({ fieldApi }: { fieldApi: AnyFieldApi }) => {
	if (fieldApi.state.meta.errorMap.onServer === undefined) return;
	fieldApi.setMeta((meta) => ({ ...meta, errorMap: { ...meta.errorMap, onServer: undefined } }));
};
