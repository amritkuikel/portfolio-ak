// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	createMemoryHistory,
	createRootRouteWithContext,
	createRoute,
	createRouter,
	RouterProvider,
} from "@tanstack/react-router";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { PortfolioMenu } from "@/features/portfolio/components/chrome/portfolio-menu";
import { CopyEmailButton } from "@/features/portfolio/components/contact/copy-email-button";
import { Marquee } from "@/features/portfolio/components/primitives/marquee";
import { SplitWords } from "@/features/portfolio/components/primitives/split-words";
import { createPreferencesStore, DEFAULT_PREFERENCES } from "@/lib/stores/preferences";
import { m } from "@/paraglide/messages";
import type { RouterContext } from "@/router";

/** Renders `ui` on every portfolio path of a memory router (the menu's links need routes to resolve). */
async function renderInRouter(ui: ReactNode) {
	const rootRoute = createRootRouteWithContext<Pick<RouterContext, "preferences">>()({ component: () => <>{ui}</> });
	const routeTree = rootRoute.addChildren(
		["/portfolio", "/portfolio/work", "/portfolio/about", "/portfolio/journal", "/portfolio/contact"].map((path) =>
			createRoute({ getParentRoute: () => rootRoute, path, component: () => null }),
		),
	);
	const router = createRouter({
		routeTree,
		history: createMemoryHistory({ initialEntries: ["/portfolio"] }),
		context: { preferences: createPreferencesStore(DEFAULT_PREFERENCES) },
	});
	await act(() => router.load());
	render(
		<QueryClientProvider client={new QueryClient()}>
			<RouterProvider router={router} />
		</QueryClientProvider>,
	);
	return { router, user: userEvent.setup() };
}

describe("PortfolioMenu", () => {
	it("is a native disclosure that closes on Escape and after choosing a link", async () => {
		const { router, user } = await renderInRouter(<PortfolioMenu />);
		const summary = await screen.findByText(m.portfolio_menu_open());
		const details = summary.closest("details");
		if (!details) throw new Error("no <details>");

		await user.click(summary);
		expect(details.open).toBe(true);
		await user.keyboard("{Escape}");
		expect(details.open).toBe(false);

		await user.click(summary);
		const nav = screen.getByRole("navigation", { name: m.portfolio_nav_label() });
		await user.click(within(nav).getByRole("link", { name: new RegExp(m.portfolio_nav_journal()) }));
		expect(details.open).toBe(false);
		expect(router.state.location.pathname).toBe("/portfolio/journal");
	});
});

describe("Marquee", () => {
	it("exposes one labelled list, hides the loop copy, and can be paused", async () => {
		const user = userEvent.setup();
		const { container } = render(<Marquee items={["React", "Postgres"]} label="Toolbox" />);
		const list = screen.getByRole("list", { name: "Toolbox" });
		expect(within(list).getByText("React")).toBeTruthy();
		expect(container.querySelectorAll('ul[aria-hidden="true"]')).toHaveLength(1);

		const button = screen.getByRole("button", { name: m.portfolio_marquee_pause() });
		expect(button.getAttribute("aria-pressed")).toBe("false");
		await user.click(button);
		expect(button.getAttribute("aria-pressed")).toBe("true");
		expect(container.querySelector(".pf-marquee")?.hasAttribute("data-paused")).toBe(true);
	});
});

describe("CopyEmailButton", () => {
	it("copies the address and announces it", async () => {
		const user = userEvent.setup();
		const writeText = vi.fn().mockResolvedValue(undefined);
		vi.spyOn(navigator, "clipboard", "get").mockReturnValue({ writeText } as unknown as Clipboard);
		render(<CopyEmailButton email="hello@example.com" />);
		await user.click(screen.getByRole("button", { name: m.portfolio_contact_copy() }));
		expect(writeText).toHaveBeenCalledWith("hello@example.com");
		expect((await screen.findByRole("status")).textContent).toBe(m.portfolio_contact_copied());
	});
});

describe("SplitWords", () => {
	it("reads as the original text and numbers each word for the CSS stagger", () => {
		const { container } = render(<SplitWords text="Good software disappears." />);
		const root = container.firstElementChild as HTMLElement;
		expect(root.textContent).toBe("Good software disappears.");
		expect(root.style.getPropertyValue("--n")).toBe("3");
		const words = [...root.querySelectorAll("span")];
		expect(words.map((word) => word.style.getPropertyValue("--i"))).toEqual(["0", "1", "2"]);
	});
});
