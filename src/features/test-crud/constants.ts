// No imports on purpose: the Drizzle schema (loaded by drizzle-kit, which knows
// neither path aliases nor Paraglide) shares these values with the app.

export const TEST_CRUD_STATUSES = ["draft", "published"] as const;
export type TestCrudStatus = (typeof TEST_CRUD_STATUSES)[number];

/** Uploaded image limits, enforced in the form schema and again on the server. */
export const TEST_CRUD_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const TEST_CRUD_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

/** preferences table id (useTablePreferences) for the admin list. */
export const TEST_CRUD_TABLE_ID = "test-crud";
