import { createStore } from "@tanstack/react-store";
import { z } from "zod";

/**
 * UI preferences (theme, admin sidebar, table settings) in one TanStack Store.
 *
 * Persistence is cookies, not localStorage: the server reads them on every
 * request, so SSR renders the user's real theme / sidebar / page size and the
 * first client render matches it (no flash, no hydration mismatch). One store is
 * created per router (per request on the server, once in the browser) from the
 * cookies, see src/router.tsx. Cookie values are untrusted input and are parsed
 * with Zod; anything invalid falls back to the defaults.
 */

export const THEMES = ["light", "dark", "system"] as const;
export type ThemePreference = (typeof THEMES)[number];

export const PREFERENCE_COOKIES = {
	theme: "theme",
	sidebar: "sidebar",
	tables: "table-prefs",
} as const;

export const PAGE_SIZES = [10, 20, 50, 100] as const;

const tablePreferencesSchema = z.object({
	pageSize: z
		.number()
		.refine((value) => (PAGE_SIZES as ReadonlyArray<number>).includes(value))
		.optional(),
	hiddenColumns: z.array(z.string().max(64)).max(50).optional(),
});
export type TablePreferences = z.infer<typeof tablePreferencesSchema>;

const tablesSchema = z.record(z.string().regex(/^[\w-]{1,64}$/), tablePreferencesSchema);

export type Preferences = {
	theme: ThemePreference;
	sidebarCollapsed: boolean;
	tables: Record<string, TablePreferences>;
};

export const DEFAULT_PREFERENCES: Preferences = { theme: "system", sidebarCollapsed: false, tables: {} };

const parseJson = (text: string | undefined): unknown => {
	if (!text) return undefined;
	try {
		return JSON.parse(text);
	} catch {
		return undefined;
	}
};

/** Preferences from decoded cookie values (server: getCookies(); browser: parseCookieHeader(document.cookie)). */
export const parsePreferences = (cookies: Readonly<Record<string, string | undefined>>): Preferences => {
	const theme = z.enum(THEMES).safeParse(cookies[PREFERENCE_COOKIES.theme]);
	const tables = tablesSchema.safeParse(parseJson(cookies[PREFERENCE_COOKIES.tables]));
	return {
		theme: theme.success ? theme.data : DEFAULT_PREFERENCES.theme,
		sidebarCollapsed: cookies[PREFERENCE_COOKIES.sidebar] === "collapsed",
		tables: tables.success ? tables.data : DEFAULT_PREFERENCES.tables,
	};
};

/** "a=1; b=x%20y" -> { a: "1", b: "x y" }. Malformed encodings are kept raw. */
export const parseCookieHeader = (header: string): Record<string, string> => {
	const cookies: Record<string, string> = {};
	for (const part of header.split(";")) {
		const index = part.indexOf("=");
		if (index < 0) continue;
		const name = part.slice(0, index).trim();
		const raw = part.slice(index + 1).trim();
		if (!name || name in cookies) continue;
		try {
			cookies[name] = decodeURIComponent(raw);
		} catch {
			cookies[name] = raw;
		}
	}
	return cookies;
};

const ONE_YEAR = 60 * 60 * 24 * 365;

/** Writes a preference cookie (browser only; readable by the server on the next request). */
export const writePreferenceCookie = (name: string, value: string) => {
	if (typeof document === "undefined") return;
	const secure = window.location.protocol === "https:" ? "; Secure" : "";
	// biome-ignore lint/suspicious/noDocumentCookie: the Cookie Store API is not available in Firefox/Safari; these are non-sensitive UI preferences.
	document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax${secure}`;
};

const withTable = (
	tables: Preferences["tables"],
	tableId: string,
	update: (current: TablePreferences) => TablePreferences,
) => ({ ...tables, [tableId]: update(tables[tableId] ?? {}) });

/** A preferences store; its actions update state and persist the matching cookie. */
export const createPreferencesStore = (initial: Preferences) =>
	createStore(initial, ({ setState, get }) => {
		const persistTables = () => writePreferenceCookie(PREFERENCE_COOKIES.tables, JSON.stringify(get().tables));
		return {
			setTheme: (theme: ThemePreference) => {
				setState((state) => ({ ...state, theme }));
				writePreferenceCookie(PREFERENCE_COOKIES.theme, theme);
			},
			setSidebarCollapsed: (sidebarCollapsed: boolean) => {
				setState((state) => ({ ...state, sidebarCollapsed }));
				writePreferenceCookie(PREFERENCE_COOKIES.sidebar, sidebarCollapsed ? "collapsed" : "open");
			},
			setTablePageSize: (tableId: string, pageSize: number) => {
				setState((state) => ({ ...state, tables: withTable(state.tables, tableId, (t) => ({ ...t, pageSize })) }));
				persistTables();
			},
			setColumnVisible: (tableId: string, column: string, visible: boolean) => {
				setState((state) => ({
					...state,
					tables: withTable(state.tables, tableId, (t) => {
						const hidden = new Set(t.hiddenColumns ?? []);
						if (visible) hidden.delete(column);
						else hidden.add(column);
						return { ...t, hiddenColumns: [...hidden] };
					}),
				}));
				persistTables();
			},
		};
	});

export type PreferencesStore = ReturnType<typeof createPreferencesStore>;
