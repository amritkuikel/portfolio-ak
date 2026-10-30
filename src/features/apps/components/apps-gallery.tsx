import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";
import { Page, PageHeader } from "@/components/page/page";
import { GUEST_LIFETIME_DAYS } from "@/lib/guests";
import { formatNumber } from "@/lib/i18n/intl";
import { m } from "@/paraglide/messages";
import { APPS, appPath } from "../registry";

/** /apps (decision 0187): every showcase app, each one to try without signing up. */
export function AppsGallery() {
	return (
		<Page width="wide" data-testid="apps-gallery">
			<PageHeader size="display" title={m.apps_title()} description={m.apps_description()} />
			<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{APPS.map((app) => (
					<li key={app.slug}>
						<Link
							to={appPath(app.slug)}
							className="group flex h-full flex-col gap-3 rounded-xl border bg-surface-1 p-5 outline-none transition-colors hover:bg-surface-2 focus-visible:ring-[3px] focus-visible:ring-ring/50"
						>
							<app.icon className="size-6 text-primary" aria-hidden />
							<span className="flex flex-col gap-1">
								<span className="font-semibold text-heading">{app.name()}</span>
								<span className="text-muted-foreground text-sm">{app.tagline()}</span>
							</span>
							<span className="mt-auto inline-flex items-center gap-1 font-medium text-sm">
								{m.apps_open()}
								<ArrowRightIcon
									className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180"
									aria-hidden
								/>
							</span>
						</Link>
					</li>
				))}
			</ul>
			<p className="max-w-prose text-muted-foreground text-sm">
				{m.apps_guest_note({ days: formatNumber(GUEST_LIFETIME_DAYS) })}
			</p>
		</Page>
	);
}
