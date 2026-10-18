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
import { type AuditActor, recordAudit } from "@/server/audit/record";
import {
	createTestCrud,
	type Db,
	deleteTestCrud,
	getPublishedTestCrud,
	getTestCrud,
	lockTestCrudStatus,
	setTestCrudStatus,
	updateTestCrud,
} from "./repository";

/**
 * What the Test CRUD server functions do once auth and input validation have
 * passed (src/functions/test-crud*.ts are thin wrappers around these). Kept as
 * plain functions over an injected db and image store so they're tested directly.
 * Publishing, unpublishing and deleting write an audit row in the same
 * transaction (src/server/audit, decisions.md 0132).
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
 * Saves the item and its images, if nobody changed it since `updatedAt` (else a
 * stale CONFLICT). Images it no longer uses are deleted from Cloudinary right
 * away; if that fails, the scheduled cleanup retries.
 */
export async function updateItem(
	db: Db,
	store: ImageStore | null,
	data: TestCrudInput & { id: string; updatedAt: string },
	userId: string,
): Promise<TestCrudDetail> {
	const { id, updatedAt, ...input } = data;
	const { item, removed } = await updateTestCrud(db, id, input, { userId, store, version: updatedAt });
	await purge(db, store, removed);
	await captureServerEvent("test_crud_updated", userId, { item_id: item.id, change: "edit" });
	return item;
}

export async function setItemStatus(
	db: Db,
	store: ImageStore | null,
	data: { id: string; status: TestCrudStatus },
	actor: AuditActor,
): Promise<TestCrudListItem> {
	const updated = await db.transaction(async (tx) => {
		const before = await lockTestCrudStatus(tx, data.id);
		if (!before) throw notFound();
		const item = await setTestCrudStatus(tx, data.id, data.status, store);
		// Setting the status it already has changes nothing, so it isn't recorded.
		if (before.status !== data.status) {
			await recordAudit(tx, actor, {
				action: data.status === "published" ? "test-crud.publish" : "test-crud.unpublish",
				target: { type: "test-crud", id: item.id, label: item.title },
				before: { status: before.status },
				after: { status: item.status },
			});
		}
		return item;
	});
	await captureServerEvent("test_crud_updated", actor.id, {
		item_id: updated.id,
		change: "status",
		status: updated.status,
	});
	return updated;
}

/** Deletes one or many (and their images), one audit row each; missing ids are ignored. */
export async function deleteItems(
	db: Db,
	store: ImageStore | null,
	ids: ReadonlyArray<string>,
	actor: AuditActor,
): Promise<{ deleted: number }> {
	const { deleted, removed } = await db.transaction(async (tx) => {
		const result = await deleteTestCrud(tx, ids);
		await recordAudit(
			tx,
			actor,
			result.items.map((item) => ({
				action: "test-crud.delete" as const,
				target: { type: "test-crud" as const, id: item.id, label: item.title },
				before: { title: item.title, status: item.status },
			})),
		);
		return result;
	});
	await purge(db, store, removed);
	if (deleted > 0) await captureServerEvent("test_crud_deleted", actor.id, { count: deleted });
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
