import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";
import { ErrorPage } from "@/components/errors/error-page";
import { NotFoundPage } from "@/components/errors/not-found-page";
import { ConsentBanner, ObservabilitySync } from "@/components/layout/observability";
import { SiteHeader } from "@/components/layout/site-header";
import { SystemThemeScript, ThemeSync, themeHtmlProps } from "@/components/layout/theme";
import { Toaster } from "@/components/ui/sonner";
import { sessionQueryOptions } from "@/features/auth/queries";
import { fontPreloads } from "@/lib/fonts";
import { pageTitle } from "@/lib/seo";
import { usePreferences } from "@/lib/stores/hooks";
import type { ThemePreference } from "@/lib/stores/preferences";
import { m } from "@/paraglide/messages";
import { getLocale, getTextDirection, localizeHref } from "@/paraglide/runtime";
import type { RouterContext } from "@/router";
import appCss from "@/styles/app.css?url";

export const Route = createRootRouteWithContext<RouterContext>()({
	// Fill the session slot for every route. On the server this is a per-request
	// lookup. In the browser it comes from the Query cache while it's fresh (its
	// staleTime), then is fetched again, so route guards never trust a session
	// that expired long ago. Server functions check the session themselves either way.
	beforeLoad: async ({ context }) => ({
		session: await context.queryClient.query(sessionQueryOptions()),
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
			// Icon set: SVG for modern browsers, ICO for the rest, PNG for iOS; the manifest has the app icons.
			{ rel: "icon", href: "/favicon.ico", sizes: "32x32" },
			{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
			{ rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
			{ rel: "manifest", href: localizeHref("/manifest.webmanifest") },
		],
	}),
	errorComponent: ErrorPage,
	notFoundComponent: NotFoundPage,
	shellComponent: RootDocument,
});

/** Browser UI colour: --background of the chosen theme, or both for "system" (head() dedupes meta by name). */
const THEME_COLORS = { light: "#ffffff", dark: "#09090b" } as const;

function ThemeColor({ theme }: { theme: ThemePreference }) {
	if (theme !== "system") return <meta name="theme-color" content={THEME_COLORS[theme]} />;
	return (
		<>
			<meta name="theme-color" media="(prefers-color-scheme: light)" content={THEME_COLORS.light} />
			<meta name="theme-color" media="(prefers-color-scheme: dark)" content={THEME_COLORS.dark} />
		</>
	);
}

function RootDocument({ children }: { children: ReactNode }) {
	const locale = getLocale();
	const theme = usePreferences((preferences) => preferences.theme);
	return (
		// suppressHydrationWarning: SystemThemeScript may add class="dark" before hydration (this element only).
		<html lang={locale} dir={getTextDirection(locale)} {...themeHtmlProps(theme)} suppressHydrationWarning>
			<head>
				<SystemThemeScript />
				<ThemeColor theme={theme} />
				<HeadContent />
			</head>
			<body className="flex min-h-dvh flex-col">
				<SiteHeader />
				<div className="flex flex-1 flex-col">{children}</div>
				<ThemeSync />
				<ObservabilitySync />
				<ConsentBanner />
				<Toaster theme={theme} />
				<TanStackDevtools
					config={{ position: "bottom-right" }}
					plugins={[{ name: "TanStack Router", render: <TanStackRouterDevtoolsPanel /> }]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
