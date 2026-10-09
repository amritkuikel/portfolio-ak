import "@tanstack/react-start/server-only";
import type {
	PublicTestCrudDetail,
	TestCrudDetail,
	TestCrudInput,
	TestCrudListItem,
	TestCrudStatus,
} from "@/features/test-crud/schema";
import { AppError } from "@/lib/errors";
import { captureServerEvent } from "@/server/analytics/posthog";
import type { ImageStore } from "@/server/attachments/cloudinary";
import { purge } from "@/server/attachments/service";
import {
	createTestCrud,
	type Db,
	deleteTestCrud,
	getPublishedTestCrud,
	getTestCrud,
	setTestCrudStatus,
	updateTestCrud,
} from "./repository";

/**
 * What the Test CRUD server functions do once auth and input validation have
 * passed (src/functions/test-crud*.ts are thin wrappers around these). Kept as
 * plain functions over an injected db and image store so they're tested directly.
 */

const notFound = () => new AppError("NOT_FOUND", "Test CRUD item not found");

export async function getItemOrThrow(db: Db, store: ImageStore | null, id: string): Promise<TestCrudDetail> {
	const row = await getTestCrud(db, id, store);
	if (!row) throw notFound();
	return row;
}

export async function createItem(
	db: Db,
	store: ImageStore | null,
	input: TestCrudInput,
	userId: string,
): Promise<TestCrudDetail> {
	const created = await createTestCrud(db, input, { userId, store });
	await captureServerEvent("test_crud_created", userId, { item_id: created.id, status: created.status });
	return created;
}

/**
 * Saves the item and its images. Images it no longer uses are deleted from
 * Cloudinary right away; if that fails, the scheduled cleanup retries.
 */
export async function updateItem(
	db: Db,
	store: ImageStore | null,
	data: TestCrudInput & { id: string },
	userId: string,
): Promise<TestCrudDetail> {
	const { id, ...input } = data;
	const { item, removed } = await updateTestCrud(db, id, input, { userId, store });
	await purge(db, store, removed);
	await captureServerEvent("test_crud_updated", userId, { item_id: item.id, change: "edit" });
	return item;
}

export async function setItemStatus(
	db: Db,
	store: ImageStore | null,
	data: { id: string; status: TestCrudStatus },
	userId: string,
): Promise<TestCrudListItem> {
	const updated = await setTestCrudStatus(db, data.id, data.status, store);
	await captureServerEvent("test_crud_updated", userId, {
		item_id: updated.id,
		change: "status",
		status: updated.status,
	});
	return updated;
}

/** Deletes one or many (and their images); missing ids are ignored. */
export async function deleteItems(
	db: Db,
	store: ImageStore | null,
	ids: ReadonlyArray<string>,
	userId: string,
): Promise<{ deleted: number }> {
	const { deleted, removed } = await deleteTestCrud(db, ids);
	await purge(db, store, removed);
	if (deleted > 0) await captureServerEvent("test_crud_deleted", userId, { count: deleted });
	return { deleted };
}

/** Public read: missing and draft slugs are both NOT_FOUND. */
export async function getPublishedOrThrow(
	db: Db,
	store: ImageStore | null,
	slug: string,
): Promise<PublicTestCrudDetail> {
	const item = await getPublishedTestCrud(db, slug, store);
	if (!item) throw notFound();
	return item;
}
