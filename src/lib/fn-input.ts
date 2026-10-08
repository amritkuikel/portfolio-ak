import type { z } from "zod";
import { AppError, type FieldErrors } from "./errors";

/** Groups Zod issues by dotted field path ("_" for form-level issues). */
export const zodFieldErrors = (error: z.ZodError): FieldErrors => {
	const fields: Record<string, string[]> = {};
	for (const issue of error.issues) {
		const key = issue.path.map(String).join(".") || "_";
		const list = fields[key] ?? [];
		list.push(issue.message);
		fields[key] = list;
	}
	return fields;
};

/**
 * Wraps a Zod schema for createServerFn().validator().
 *
 * Start runs Standard Schema validators itself and throws a plain Error with a
 * JSON dump of the issues. This wrapper exposes `parse` instead, so invalid
 * input becomes AppError("BAD_REQUEST") with per-field errors, while callers
 * keep the schema's input type.
 */
export const zodInput = <TSchema extends z.ZodType>(schema: TSchema) => ({
	parse: (input: z.input<TSchema>): z.output<TSchema> => {
		const result = schema.safeParse(input);
		if (!result.success) {
			throw new AppError("BAD_REQUEST", "Invalid input", { fieldErrors: zodFieldErrors(result.error) });
		}
		return result.data;
	},
});
