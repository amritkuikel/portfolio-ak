import { AppError } from "@/lib/errors";
import { zodInput } from "@/lib/fn-input";
import { type TestCrudFormValues, type TestCrudInput, testCrudIdSchema, testCrudInputSchema } from "./schema";

/**
 * The wire format of create/update: ONE multipart request carrying the fields
 * as JSON ("data"), an optional "image" file and a "removeImage" flag (plus
 * "id" for updates), so a failed save never leaves an orphaned upload. The form
 * encodes with toFormData; the server functions decode with parse*Form.
 */
export type SaveInput = { input: TestCrudInput; image: File | null; removeImage: boolean };
export type UpdateInput = SaveInput & { id: string };

export const toFormData = (value: TestCrudFormValues, id?: string): FormData => {
	const { image, removeImage, ...fields } = value;
	const data = new FormData();
	data.set("data", JSON.stringify(fields satisfies Record<keyof TestCrudInput, unknown>));
	const [file] = image;
	if (file) data.set("image", file);
	if (removeImage) data.set("removeImage", "1");
	if (id) data.set("id", id);
	return data;
};

const expectFormData = (data: unknown): FormData => {
	if (!(data instanceof FormData)) throw new AppError("BAD_REQUEST", "Expected FormData");
	return data;
};

/** Validates "data" with the shared schema (BAD_REQUEST with field errors when invalid). */
export const parseSaveForm = (data: unknown): SaveInput => {
	const form = expectFormData(data);
	let json: unknown;
	try {
		json = JSON.parse(String(form.get("data") ?? ""));
	} catch {
		throw new AppError("BAD_REQUEST", "Malformed data field");
	}
	const image = form.get("image");
	return {
		input: zodInput(testCrudInputSchema).parse(json as TestCrudInput),
		image: image instanceof File && image.size > 0 ? image : null,
		removeImage: form.get("removeImage") === "1",
	};
};

export const parseUpdateForm = (data: unknown): UpdateInput => {
	const parsed = parseSaveForm(data);
	const form = data as FormData;
	return { ...parsed, id: zodInput(testCrudIdSchema).parse({ id: String(form.get("id") ?? "") }).id };
};
