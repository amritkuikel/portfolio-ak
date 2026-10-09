import { m } from "@/paraglide/messages";
import type { TestCrudStatus, TestCrudStatusFilter } from "./schema";

/** Localized names of enum values, shared by the table, filters and form. Called at render time. */
export const STATUS_LABELS: Record<TestCrudStatus, () => string> = {
	draft: m.test_crud_status_draft,
	published: m.test_crud_status_published,
};

export const STATUS_FILTER_LABELS: Record<TestCrudStatusFilter, () => string> = {
	all: m.test_crud_status_all,
	...STATUS_LABELS,
};
