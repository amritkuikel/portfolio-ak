import { createServerFn } from "@tanstack/react-start";
import {
	type PublicTestCrudDetail,
	type PublicTestCrudPage,
	TEST_CRUD_PUBLIC_PAGE_SIZE,
	testCrudPublicSearchSchema,
	testCrudSlugParamSchema,
} from "@/features/test-crud/schema";
import { zodInput } from "@/lib/fn-input";
import { imageStore } from "@/server/attachments/store";
import { db } from "@/server/db/client";
import { listPublishedTestCrud } from "@/server/test-crud/repository";
import { getPublishedOrThrow } from "@/server/test-crud/service";

/**
 * Public Test CRUD reads. No auth: the repository functions only ever return
 * published rows, and a draft looks exactly like a missing slug (NOT_FOUND).
 */
export const listPublicTestCrud = createServerFn({ method: "GET" })
	.validator(zodInput(testCrudPublicSearchSchema))
	.handler(
		({ data }): Promise<PublicTestCrudPage> => listPublishedTestCrud(db, data, TEST_CRUD_PUBLIC_PAGE_SIZE, imageStore),
	);

export const getPublicTestCrud = createServerFn({ method: "GET" })
	.validator(zodInput(testCrudSlugParamSchema))
	.handler(({ data }): Promise<PublicTestCrudDetail> => getPublishedOrThrow(db, imageStore, data.slug));
