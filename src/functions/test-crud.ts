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
import { captureServerEvent } from "@/server/analytics/posthog";
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
		const created = await createRow(db, data.input, { image, userId: context.user.id });
		await captureServerEvent("test_crud_created", context.user.id, { item_id: created.id, status: created.status });
		return created;
	});

export const updateTestCrud = createServerFn({ method: "POST" })
	.middleware([requireAdminMiddleware])
	.validator((data: FormData) => {
		const form = expectFormData(data);
		return { ...parseSaveForm(form), id: zodInput(testCrudIdSchema).parse({ id: String(form.get("id")) }).id };
	})
	.handler(async ({ data, context }): Promise<TestCrudDetail> => {
		let image: ImageChange = { kind: "keep" };
		if (data.image) image = { kind: "replace", image: await validateImage(data.image) };
		else if (data.removeImage) image = { kind: "remove" };
		const updated = await updateRow(db, data.id, data.input, { image });
		await captureServerEvent("test_crud_updated", context.user.id, { item_id: updated.id, change: "edit" });
		return updated;
	});

export const setTestCrudStatusFn = createServerFn({ method: "POST" })
	.middleware([requireAdminMiddleware])
	.validator(zodInput(testCrudStatusUpdateSchema))
	.handler(async ({ data, context }): Promise<TestCrudListItem> => {
		const updated = await setTestCrudStatus(db, data.id, data.status);
		await captureServerEvent("test_crud_updated", context.user.id, {
			item_id: updated.id,
			change: "status",
			status: updated.status,
		});
		return updated;
	});

/** Deletes one or many (bulk delete). Missing ids are ignored; returns how many were deleted. */
export const deleteTestCrudFn = createServerFn({ method: "POST" })
	.middleware([requireAdminMiddleware])
	.validator(zodInput(testCrudIdsSchema))
	.handler(async ({ data, context }): Promise<{ deleted: number }> => {
		const deleted = await deleteTestCrud(db, data.ids);
		if (deleted > 0) await captureServerEvent("test_crud_deleted", context.user.id, { count: deleted });
		return { deleted };
	});
