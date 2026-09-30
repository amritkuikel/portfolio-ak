import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";
import { ErrorPage } from "@/components/errors/error-page";
import { NotFoundPage } from "@/components/errors/not-found-page";
import { SiteHeader } from "@/components/layout/site-header";
import { Toaster } from "@/components/ui/sonner";
import { sessionQueryOptions } from "@/features/auth/queries";
import { fontPreloads } from "@/lib/fonts";
import { pageTitle } from "@/lib/seo";
import { m } from "@/paraglide/messages";
import { getLocale, getTextDirection } from "@/paraglide/runtime";
import type { RouterContext } from "@/router";
import appCss from "@/styles/app.css?url";

export const Route = createRootRouteWithContext<RouterContext>()({
	// Fill the session slot for every route. On the server this is a per-request
	// lookup; on the client it comes from the Query cache (see sessionQueryOptions).
	beforeLoad: async ({ context }) => ({
		session: await context.queryClient.ensureQueryData(sessionQueryOptions()),
	}),
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			// Default title; child routes override it with pageTitle("…").
			{ title: pageTitle() },
			{ name: "description", content: m.site_description() },
		],
		links: [
			...fontPreloads(getLocale()),
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
		],
	}),
	errorComponent: ErrorPage,
	notFoundComponent: NotFoundPage,
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
	const locale = getLocale();
	return (
		<html lang={locale} dir={getTextDirection(locale)}>
			<head>
				<HeadContent />
			</head>
			<body className="flex min-h-dvh flex-col">
				<SiteHeader />
				<div className="flex flex-1 flex-col">{children}</div>
				<Toaster />
				<TanStackDevtools
					config={{ position: "bottom-right" }}
					plugins={[{ name: "TanStack Router", render: <TanStackRouterDevtoolsPanel /> }]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
