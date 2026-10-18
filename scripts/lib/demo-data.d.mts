/** Types for ./demo-data.mjs (used by tests/server/seed-demo.test.ts). */
export type DemoQuery = (
	sql: string,
	params?: unknown[],
) => Promise<{ rows: Array<Record<string, unknown>>; rowCount: number | null }>;

export declare const DEMO_ROLES: ReadonlyArray<{
	key: string;
	name: string;
	description: string;
	permissions: string[];
}>;
export declare const DEMO_USERS: ReadonlyArray<{ email: string; name: string; role: string | null }>;
export declare const DEMO_ITEM_COUNT: number;

export declare function seedDemo(
	query: DemoQuery,
	options: { passwordHash: string; now?: Date },
): Promise<{ created: number }>;
