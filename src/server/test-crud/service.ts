import "@tanstack/react-start/server-only";
import type { SaveInput, UpdateInput } from "@/features/test-crud/form-data";
import type {
	PublicTestCrudDetail,
	TestCrudDetail,
	TestCrudListItem,
	TestCrudStatus,
} from "@/features/test-crud/schema";
import { AppError } from "@/lib/errors";
import { captureServerEvent } from "@/server/analytics/posthog";
import { validateImage } from "./image";
import {
	createTestCrud,
	type Db,
	deleteTestCrud,
	getPublishedTestCrud,
	getTestCrud,
	type ImageChange,
	setTestCrudStatus,
	updateTestCrud,
} from "./repository";

/**
 * What the Test CRUD server functions do once auth and input validation have
 * passed (src/functions/test-crud*.ts are thin wrappers around these). Kept as
 * plain functions over an injected db so they're tested directly.
 */

const notFound = () => new AppError("NOT_FOUND", "Test CRUD item not found");

export async function getItemOrThrow(db: Db, id: string): Promise<TestCrudDetail> {
	const row = await getTestCrud(db, id);
	if (!row) throw notFound();
	return row;
}

export async function createItem(db: Db, data: SaveInput, userId: string): Promise<TestCrudDetail> {
	const image = data.image ? await validateImage(data.image) : null;
	const created = await createTestCrud(db, data.input, { image, userId });
	await captureServerEvent("test_crud_created", userId, { item_id: created.id, status: created.status });
	return created;
}

/** A new file replaces the image; otherwise "removeImage" removes it; otherwise it's kept. */
export const imageChangeFor = async (data: SaveInput): Promise<ImageChange> => {
	if (data.image) return { kind: "replace", image: await validateImage(data.image) };
	return data.removeImage ? { kind: "remove" } : { kind: "keep" };
};

export async function updateItem(db: Db, data: UpdateInput, userId: string): Promise<TestCrudDetail> {
	const updated = await updateTestCrud(db, data.id, data.input, { image: await imageChangeFor(data) });
	await captureServerEvent("test_crud_updated", userId, { item_id: updated.id, change: "edit" });
	return updated;
}

export async function setItemStatus(
	db: Db,
	data: { id: string; status: TestCrudStatus },
	userId: string,
): Promise<TestCrudListItem> {
	const updated = await setTestCrudStatus(db, data.id, data.status);
	await captureServerEvent("test_crud_updated", userId, {
		item_id: updated.id,
		change: "status",
		status: updated.status,
	});
	return updated;
}

/** Deletes one or many; missing ids are ignored. The event fires only if something was deleted. */
export async function deleteItems(db: Db, ids: ReadonlyArray<string>, userId: string): Promise<{ deleted: number }> {
	const deleted = await deleteTestCrud(db, ids);
	if (deleted > 0) await captureServerEvent("test_crud_deleted", userId, { count: deleted });
	return { deleted };
}

/** Public read: missing and draft slugs are both NOT_FOUND. */
export async function getPublishedOrThrow(db: Db, slug: string): Promise<PublicTestCrudDetail> {
	const item = await getPublishedTestCrud(db, slug);
	if (!item) throw notFound();
	return item;
}
