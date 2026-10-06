import type { AnyFieldApi, AnyFormApi } from "@tanstack/react-form";
import { isAppError } from "@/lib/errors";

/**
 * Shows an AppError's per-field errors (e.g. CONFLICT on `slug`, BAD_REQUEST on
 * `image`) on the matching fields, under the `onServer` validation key. They
 * appear in the field and in FormErrorSummary like client errors. Returns false
 * when the error has no field errors (show a toast instead).
 */
export function applyServerFieldErrors(form: AnyFormApi, error: unknown): boolean {
	if (!isAppError(error) || !error.fieldErrors) return false;
	const entries = Object.entries(error.fieldErrors).filter(([field]) => field !== "_");
	for (const [field, messages] of entries) {
		form.setFieldMeta(field, (meta) => ({
			...meta,
			isBlurred: true,
			errorMap: { ...meta.errorMap, onServer: messages.join(" ") },
		}));
	}
	return entries.length > 0;
}

/** Form `listeners.onChange`: editing a field clears the server error shown on it. */
export const clearServerErrorOnChange = ({ fieldApi }: { fieldApi: AnyFieldApi }) => {
	if (fieldApi.state.meta.errorMap.onServer === undefined) return;
	fieldApi.setMeta((meta) => ({ ...meta, errorMap: { ...meta.errorMap, onServer: undefined } }));
};
