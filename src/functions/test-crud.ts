import { createServerFn } from "@tanstack/react-start";
import {
	type TestCrudDetail,
	type TestCrudInput,
	type TestCrudListItem,
	type TestCrudPage,
	testCrudIdSchema,
	testCrudIdsSchema,
	testCrudInputSchema,
	testCrudListInputSchema,
	testCrudStatusUpdateSchema,
} from "@/features/test-crud/schema";
import { AppError } from "@/lib/errors";
import { zodInput } from "@/lib/fn-input";
import { requireAdminMiddleware } from "@/middleware/auth";
import { db } from "@/server/db/client";
import { validateImage } from "@/server/test-crud/image";
import {
	createTestCrud as createRow,
	deleteTestCrud,
	getTestCrud as getRow,
	type ImageChange,
	listTestCrud as listRows,
	setTestCrudStatus,
	updateTestCrud as updateRow,
} from "@/server/test-crud/repository";

/**
 * Test CRUD admin server functions. EVERY one runs requireAdminMiddleware first,
 * so anonymous calls get UNAUTHORIZED and non-admins FORBIDDEN on the server,
 * whatever the UI shows. Input is validated with the shared Zod schemas
 * (src/features/test-crud/schema.ts) before the handler runs.
 */

export const listTestCrud = createServerFn({ method: "GET" })
	.middleware([requireAdminMiddleware])
	.validator(zodInput(testCrudListInputSchema))
	.handler(({ data }): Promise<TestCrudPage> => listRows(db, data));

export const getTestCrud = createServerFn({ method: "GET" })
	.middleware([requireAdminMiddleware])
	.validator(zodInput(testCrudIdSchema))
	.handler(async ({ data }): Promise<TestCrudDetail> => {
		const row = await getRow(db, data.id);
		if (!row) throw new AppError("NOT_FOUND", "Test CRUD item not found");
		return row;
	});

type SaveInput = { input: TestCrudInput; image: File | null; removeImage: boolean };

/**
 * Create/update take FormData: "data" (JSON of the shared input schema), an
 * optional "image" file and "removeImage". One request carries fields and file,
 * so a failed save never leaves an orphaned upload behind.
 */
const parseSaveForm = (form: FormData): SaveInput => {
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

const expectFormData = (data: unknown): FormData => {
	if (!(data instanceof FormData)) throw new AppError("BAD_REQUEST", "Expected FormData");
	return data;
};

export const createTestCrud = createServerFn({ method: "POST" })
	.middleware([requireAdminMiddleware])
	.validator((data: FormData) => parseSaveForm(expectFormData(data)))
	.handler(async ({ data, context }): Promise<TestCrudDetail> => {
		const image = data.image ? await validateImage(data.image) : null;
		return createRow(db, data.input, { image, userId: context.user.id });
	});

export const updateTestCrud = createServerFn({ method: "POST" })
	.middleware([requireAdminMiddleware])
	.validator((data: FormData) => {
		const form = expectFormData(data);
		return { ...parseSaveForm(form), id: zodInput(testCrudIdSchema).parse({ id: String(form.get("id")) }).id };
	})
	.handler(async ({ data }): Promise<TestCrudDetail> => {
		let image: ImageChange = { kind: "keep" };
		if (data.image) image = { kind: "replace", image: await validateImage(data.image) };
		else if (data.removeImage) image = { kind: "remove" };
		return updateRow(db, data.id, data.input, { image });
	});

export const setTestCrudStatusFn = createServerFn({ method: "POST" })
	.middleware([requireAdminMiddleware])
	.validator(zodInput(testCrudStatusUpdateSchema))
	.handler(({ data }): Promise<TestCrudListItem> => setTestCrudStatus(db, data.id, data.status));

/** Deletes one or many (bulk delete). Missing ids are ignored; returns how many were deleted. */
export const deleteTestCrudFn = createServerFn({ method: "POST" })
	.middleware([requireAdminMiddleware])
	.validator(zodInput(testCrudIdsSchema))
	.handler(async ({ data }): Promise<{ deleted: number }> => ({ deleted: await deleteTestCrud(db, data.ids) }));
