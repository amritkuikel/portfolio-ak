import { createServerFn } from "@tanstack/react-start";
import {
	type TestCrudDetail,
	type TestCrudListItem,
	type TestCrudPage,
	testCrudIdSchema,
	testCrudIdsSchema,
	testCrudInputSchema,
	testCrudStatusUpdateSchema,
	testCrudUpdateSchema,
} from "@/features/test-crud/schema";
import { testCrudListInputSchema } from "@/features/test-crud/search";
import { zodInput } from "@/functions/_lib/validator";
import { requirePermission } from "@/middleware/auth";
import { imageStore } from "@/server/attachments/store";
import { auditActorFrom } from "@/server/audit/actor";
import { db } from "@/server/db/client";
import { listTestCrud as listRows, listTestCrudTags as listTags } from "@/server/test-crud/repository";
import { createItem, deleteItems, getItemOrThrow, setItemStatus, updateItem } from "@/server/test-crud/service";

/**
 * Test CRUD admin server functions. EVERY one runs requirePermission first, so
 * anonymous calls get UNAUTHORIZED and users without that permission FORBIDDEN on
 * the server, whatever the UI shows. Input is validated with the shared Zod schemas before
 * the handler runs. The work itself lives in src/server/test-crud/service.ts
 * (tested directly); these are thin wrappers.
 */

export const listTestCrud = createServerFn({ method: "GET" })
	.middleware([requirePermission("test-crud:read")])
	.validator(zodInput(testCrudListInputSchema))
	.handler(({ data }): Promise<TestCrudPage> => listRows(db, data, imageStore));

/** Tags in use, for the list's tag filter. */
export const listTestCrudTags = createServerFn({ method: "GET" })
	.middleware([requirePermission("test-crud:read")])
	.handler((): Promise<string[]> => listTags(db));

export const getTestCrud = createServerFn({ method: "GET" })
	.middleware([requirePermission("test-crud:read")])
	.validator(zodInput(testCrudIdSchema))
	.handler(({ data }): Promise<TestCrudDetail> => getItemOrThrow(db, imageStore, data.id));

/** Images are attachment ids (uploaded beforehand, straight to Cloudinary; see functions/attachments.ts). */
export const createTestCrud = createServerFn({ method: "POST" })
	.middleware([requirePermission("test-crud:create")])
	.validator(zodInput(testCrudInputSchema))
	.handler(({ data, context }): Promise<TestCrudDetail> => createItem(db, imageStore, data, context.user.id));

export const updateTestCrud = createServerFn({ method: "POST" })
	.middleware([requirePermission("test-crud:update")])
	.validator(zodInput(testCrudUpdateSchema))
	.handler(({ data, context }): Promise<TestCrudDetail> => updateItem(db, imageStore, data, context.user.id));

export const setTestCrudStatusFn = createServerFn({ method: "POST" })
	.middleware([requirePermission("test-crud:publish")])
	.validator(zodInput(testCrudStatusUpdateSchema))
	.handler(
		({ data, context }): Promise<TestCrudListItem> => setItemStatus(db, imageStore, data, auditActorFrom(context)),
	);

/** Deletes one or many (bulk delete). Missing ids are ignored; returns how many were deleted. */
export const deleteTestCrudFn = createServerFn({ method: "POST" })
	.middleware([requirePermission("test-crud:delete")])
	.validator(zodInput(testCrudIdsSchema))
	.handler(
		({ data, context }): Promise<{ deleted: number }> => deleteItems(db, imageStore, data.ids, auditActorFrom(context)),
	);
