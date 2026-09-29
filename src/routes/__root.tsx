import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { Toaster } from "@/components/ui/sonner";
import { clientEnv } from "@/lib/client-env";
import { fontPreloads } from "@/lib/fonts";
import { m } from "@/paraglide/messages";
import { getLocale, getTextDirection } from "@/paraglide/runtime";
import appCss from "@/styles/app.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: clientEnv.VITE_APP_TITLE },
			{ name: "description", content: m.site_description() },
		],
		links: [
			...fontPreloads(getLocale()),
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
	const locale = getLocale();
	return (
		<html lang={locale} dir={getTextDirection(locale)}>
			<head>
				<HeadContent />
			</head>
			<body>
				<SiteHeader />
				{children}
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
