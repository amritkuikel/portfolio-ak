// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	createMemoryHistory,
	createRootRouteWithContext,
	createRoute,
	createRouter,
	Outlet,
	RouterProvider,
} from "@tanstack/react-router";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteHeader } from "@/components/layout/site-header";
import { sessionQueryOptions } from "@/features/auth/queries";
import { createPreferencesStore, DEFAULT_PREFERENCES } from "@/lib/stores/preferences";
import type { RouterContext } from "@/router";

/**
 * The root layout's header and the `chrome: "bare"` opt-out (src/lib/chrome.ts,
 * decision 0105): every existing page keeps the header; a section that opts out
 * (the /portfolio layout) and everything under it renders none.
 */
async function renderAt(path: string) {
	const rootRoute = createRootRouteWithContext<Pick<RouterContext, "preferences">>()({
		component: () => (
			<>
				<SiteHeader />
				<Outlet />
			</>
		),
	});
	const page = () => <p>page</p>;
	const bareSection = createRoute({
		getParentRoute: () => rootRoute,
		path: "/portfolio",
		staticData: { chrome: "bare" },
		component: Outlet,
	});
	const routeTree = rootRoute.addChildren([
		createRoute({ getParentRoute: () => rootRoute, path: "/", component: page }),
		createRoute({ getParentRoute: () => rootRoute, path: "/stack", component: page }),
		bareSection.addChildren([createRoute({ getParentRoute: () => bareSection, path: "/work", component: page })]),
	]);
	const router = createRouter({
		routeTree,
		history: createMemoryHistory({ initialEntries: [path] }),
		context: { preferences: createPreferencesStore(DEFAULT_PREFERENCES) },
	});
	await act(() => router.load());
	const queryClient = new QueryClient();
	queryClient.setQueryData(sessionQueryOptions().queryKey, null);
	render(
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>,
	);
	await screen.findByText("page");
}

describe("site chrome", () => {
	it.each(["/", "/stack"])("existing pages keep the site header (%s)", async (path) => {
		await renderAt(path);
		expect(screen.getByRole("banner")).toBeTruthy();
		expect(screen.getByTestId("nav-login")).toBeTruthy();
	});

	it("a section with chrome: bare, and its children, render no site header", async () => {
		await renderAt("/portfolio/work");
		expect(screen.queryByRole("banner")).toBeNull();
		expect(screen.queryByTestId("nav-login")).toBeNull();
	});
});
