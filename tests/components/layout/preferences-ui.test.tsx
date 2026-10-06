// @vitest-environment jsdom
import {
	createMemoryHistory,
	createRootRouteWithContext,
	createRoute,
	createRouter,
	Outlet,
	RouterProvider,
} from "@tanstack/react-router";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { ThemeSync, ThemeToggle } from "@/components/layout/theme";
import { useTablePreferences } from "@/lib/stores/hooks";
import { createPreferencesStore, DEFAULT_PREFERENCES, type Preferences } from "@/lib/stores/preferences";
import type { RouterContext } from "@/router";

/** Renders `ui` inside a memory router whose context carries a preferences store. */
async function renderWithPreferences(ui: ReactNode, initial: Partial<Preferences> = {}) {
	const preferences = createPreferencesStore({ ...DEFAULT_PREFERENCES, ...initial });
	const rootRoute = createRootRouteWithContext<Pick<RouterContext, "preferences">>()({ component: Outlet });
	const page = () => <>{ui}</>;
	const routeTree = rootRoute.addChildren([
		createRoute({ getParentRoute: () => rootRoute, path: "/", component: page }),
		createRoute({ getParentRoute: () => rootRoute, path: "/admin", component: page }),
	]);
	const router = createRouter({
		routeTree,
		history: createMemoryHistory({ initialEntries: ["/admin"] }),
		context: { preferences },
	});
	await act(() => router.load());
	render(<RouterProvider router={router} />);
	return { preferences, user: userEvent.setup() };
}

// jsdom has no matchMedia; ThemeSync listens to the OS colour scheme.
let osDark = false;
const listeners = new Set<() => void>();
beforeEach(() => {
	osDark = false;
	vi.stubGlobal(
		"matchMedia",
		vi.fn(() => ({
			get matches() {
				return osDark;
			},
			addEventListener: (_: string, listener: () => void) => listeners.add(listener),
			removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
		})),
	);
});
afterEach(() => {
	vi.unstubAllGlobals();
	listeners.clear();
	document.documentElement.className = "";
	for (const name of ["theme", "sidebar", "table-prefs"]) {
		// biome-ignore lint/suspicious/noDocumentCookie: test cleanup of the cookies the store writes.
		document.cookie = `${name}=; Path=/; Max-Age=0`;
	}
});

describe("ThemeToggle + ThemeSync", () => {
	it("offers light/dark/system, applies the choice to <html> and persists it", async () => {
		const { user, preferences } = await renderWithPreferences(
			<>
				<ThemeToggle />
				<ThemeSync />
			</>,
		);
		const trigger = await screen.findByRole("button", { name: "Theme: System" });
		await user.click(trigger);
		expect(screen.getAllByRole("menuitemradio").map((item) => item.textContent)).toEqual(["Light", "Dark", "System"]);
		expect(screen.getByRole("menuitemradio", { name: "System" })).toHaveAttribute("aria-checked", "true");
		await user.click(screen.getByRole("menuitemradio", { name: "Dark" }));
		expect(preferences.state.theme).toBe("dark");
		expect(document.documentElement).toHaveClass("dark");
		expect(document.cookie).toContain("theme=dark");
		expect(screen.getByRole("button", { name: "Theme: Dark" })).toBeInTheDocument();
	});

	it("follows the OS setting while on system", async () => {
		osDark = true;
		await renderWithPreferences(<ThemeSync />);
		expect(document.documentElement).toHaveClass("dark");
		osDark = false;
		act(() => {
			for (const listener of listeners) listener();
		});
		expect(document.documentElement).not.toHaveClass("dark");
	});
});

describe("AdminSidebar", () => {
	it("collapses and expands, announcing state, and remembers it", async () => {
		const { user, preferences } = await renderWithPreferences(<AdminSidebar />);
		const toggle = await screen.findByRole("button", { name: "Collapse sidebar" });
		expect(toggle).toHaveAttribute("aria-expanded", "true");
		expect(screen.getByRole("navigation", { name: "Admin navigation" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("data-status", "active");

		await user.click(toggle);
		expect(preferences.state.sidebarCollapsed).toBe(true);
		expect(document.cookie).toContain("sidebar=collapsed");
		const expand = screen.getByRole("button", { name: "Expand sidebar" });
		expect(expand).toHaveAttribute("aria-expanded", "false");
		// Collapsed: the link keeps its accessible name (sr-only text) and gains a tooltip.
		expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("title", "Dashboard");
	});

	it("renders collapsed when the stored preference says so", async () => {
		await renderWithPreferences(<AdminSidebar />, { sidebarCollapsed: true });
		expect(await screen.findByTestId("admin-sidebar")).toHaveAttribute("data-collapsed", "true");
	});
});

function TablePrefsProbe() {
	const table = useTablePreferences("test-crud", { pageSize: 20 });
	return (
		<div>
			<output data-testid="size">{table.pageSize}</output>
			<output data-testid="price">{String(table.isColumnVisible("price"))}</output>
			<button type="button" onClick={() => table.setPageSize(50)}>
				size
			</button>
			<button type="button" onClick={() => table.setColumnVisible("price", false)}>
				hide
			</button>
		</div>
	);
}

describe("useTablePreferences", () => {
	it("uses defaults until changed, then persists page size and hidden columns", async () => {
		const { user } = await renderWithPreferences(<TablePrefsProbe />);
		expect(await screen.findByTestId("size")).toHaveTextContent("20");
		expect(screen.getByTestId("price")).toHaveTextContent("true");
		await user.click(screen.getByRole("button", { name: "size" }));
		await user.click(screen.getByRole("button", { name: "hide" }));
		expect(screen.getByTestId("size")).toHaveTextContent("50");
		expect(screen.getByTestId("price")).toHaveTextContent("false");
		expect(decodeURIComponent(document.cookie)).toContain('"test-crud":{"pageSize":50,"hiddenColumns":["price"]}');
	});

	it("starts from stored preferences", async () => {
		await renderWithPreferences(<TablePrefsProbe />, { tables: { "test-crud": { pageSize: 100 } } });
		expect(await screen.findByTestId("size")).toHaveTextContent("100");
	});
});
