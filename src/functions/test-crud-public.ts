import { createServerFn } from "@tanstack/react-start";
import {
	type PublicTestCrudDetail,
	type PublicTestCrudPage,
	TEST_CRUD_PUBLIC_PAGE_SIZE,
	testCrudPublicSearchSchema,
	testCrudSlugParamSchema,
} from "@/features/test-crud/schema";
import { AppError } from "@/lib/errors";
import { zodInput } from "@/lib/fn-input";
import { db } from "@/server/db/client";
import { getPublishedTestCrud, listPublishedTestCrud } from "@/server/test-crud/repository";

/**
 * Public Test CRUD reads. No auth: the repository functions only ever return
 * published rows, and a draft looks exactly like a missing slug (NOT_FOUND).
 */
export const listPublicTestCrud = createServerFn({ method: "GET" })
	.validator(zodInput(testCrudPublicSearchSchema))
	.handler(({ data }): Promise<PublicTestCrudPage> => listPublishedTestCrud(db, data, TEST_CRUD_PUBLIC_PAGE_SIZE));

export const getPublicTestCrud = createServerFn({ method: "GET" })
	.validator(zodInput(testCrudSlugParamSchema))
	.handler(async ({ data }): Promise<PublicTestCrudDetail> => {
		const item = await getPublishedTestCrud(db, data.slug);
		if (!item) throw new AppError("NOT_FOUND", "Test CRUD item not found");
		return item;
	});
