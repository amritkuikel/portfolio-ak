import { fn } from "storybook/test";
import type { TestCrudDetail, TestCrudListItem, TestCrudPage } from "../../../src/features/test-crud/schema";
import { sampleDetail, sampleItems } from "../data";

// Stand-ins for src/functions/test-crud.ts (the admin server functions).
export const listTestCrud = fn(
	async (): Promise<TestCrudPage> => ({ items: sampleItems, total: sampleItems.length, page: 1, pageCount: 1 }),
).mockName("listTestCrud");
export const listTestCrudTags = fn(async (): Promise<string[]> => ["drink", "food", "nepal"]).mockName(
	"listTestCrudTags",
);
export const getTestCrud = fn(async (): Promise<TestCrudDetail> => sampleDetail).mockName("getTestCrud");
export const createTestCrud = fn(
	async (_options: { data: FormData }): Promise<TestCrudDetail> => sampleDetail,
).mockName("createTestCrud");
export const updateTestCrud = fn(
	async (_options: { data: FormData }): Promise<TestCrudDetail> => sampleDetail,
).mockName("updateTestCrud");
export const setTestCrudStatusFn = fn(
	async (): Promise<TestCrudListItem> => sampleItems[0] as TestCrudListItem,
).mockName("setTestCrudStatusFn");
export const deleteTestCrudFn = fn(async () => ({ deleted: 1 })).mockName("deleteTestCrudFn");
