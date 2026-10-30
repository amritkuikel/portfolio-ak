import { createFileRoute } from "@tanstack/react-router";
import { LinksModeration } from "@/features/apps/links/admin/components/links-moderation";
import { linkModerationQueryOptions } from "@/features/apps/links/admin/queries";
import { LINK_MODERATION_TABLE_ID, linkModerationList } from "@/features/apps/links/admin/search";
import { assertRoutePermission } from "@/features/rbac/route-guard";
import { staticCrumb } from "@/lib/breadcrumbs";
import { listLoader, listSearch, titleHead } from "@/lib/crud/route";
import { m } from "@/paraglide/messages";

/** /admin/links: every user's short links, to block or delete (decision 0191). */
export const Route = createFileRoute("/_admin/admin/links")({
	...listSearch(linkModerationList.search, linkModerationList.defaults),
	beforeLoad: ({ context }) => assertRoutePermission(context.session, "links:moderate"),
	loaderDeps: ({ search }) => search,
	loader: (route) => listLoader(route, { tableId: LINK_MODERATION_TABLE_ID, query: linkModerationQueryOptions }),
	staticData: { breadcrumb: staticCrumb(m.links_moderation_title) },
	head: titleHead(m.links_moderation_title),
	component: LinksModeration,
});
