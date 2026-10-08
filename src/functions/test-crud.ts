import { createServerFn } from "@tanstack/react-start";
import { parseSaveForm, parseUpdateForm } from "@/features/test-crud/form-data";
import {
	type TestCrudDetail,
	type TestCrudListItem,
	type TestCrudPage,
	testCrudIdSchema,
	testCrudIdsSchema,
	testCrudListInputSchema,
	testCrudStatusUpdateSchema,
} from "@/features/test-crud/schema";
import { zodInput } from "@/lib/fn-input";
import { requireAdminMiddleware } from "@/middleware/auth";
import { db } from "@/server/db/client";
import { listTestCrud as listRows } from "@/server/test-crud/repository";
import { createItem, deleteItems, getItemOrThrow, setItemStatus, updateItem } from "@/server/test-crud/service";

/**
 * Test CRUD admin server functions. EVERY one runs requireAdminMiddleware first,
 * so anonymous calls get UNAUTHORIZED and non-admins FORBIDDEN on the server,
 * whatever the UI shows. Input is validated with the shared Zod schemas before
 * the handler runs. The work itself lives in src/server/test-crud/service.ts
 * (tested directly); these are thin wrappers.
 */

export const listTestCrud = createServerFn({ method: "GET" })
	.middleware([requireAdminMiddleware])
	.validator(zodInput(testCrudListInputSchema))
	.handler(({ data }): Promise<TestCrudPage> => listRows(db, data));

export const getTestCrud = createServerFn({ method: "GET" })
	.middleware([requireAdminMiddleware])
	.validator(zodInput(testCrudIdSchema))
	.handler(({ data }): Promise<TestCrudDetail> => getItemOrThrow(db, data.id));

/** FormData: fields as JSON + optional image (see features/test-crud/form-data.ts). */
export const createTestCrud = createServerFn({ method: "POST" })
	.middleware([requireAdminMiddleware])
	.validator((data: FormData) => parseSaveForm(data))
	.handler(({ data, context }): Promise<TestCrudDetail> => createItem(db, data, context.user.id));

export const updateTestCrud = createServerFn({ method: "POST" })
	.middleware([requireAdminMiddleware])
	.validator((data: FormData) => parseUpdateForm(data))
	.handler(({ data, context }): Promise<TestCrudDetail> => updateItem(db, data, context.user.id));

export const setTestCrudStatusFn = createServerFn({ method: "POST" })
	.middleware([requireAdminMiddleware])
	.validator(zodInput(testCrudStatusUpdateSchema))
	.handler(({ data, context }): Promise<TestCrudListItem> => setItemStatus(db, data, context.user.id));

/** Deletes one or many (bulk delete). Missing ids are ignored; returns how many were deleted. */
export const deleteTestCrudFn = createServerFn({ method: "POST" })
	.middleware([requireAdminMiddleware])
	.validator(zodInput(testCrudIdsSchema))
	.handler(({ data, context }): Promise<{ deleted: number }> => deleteItems(db, data.ids, context.user.id));
