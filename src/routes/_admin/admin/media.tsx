import { createFileRoute } from "@tanstack/react-router";
import { MediaLibrary } from "@/features/media/components/media-library";
import { mediaListQueryOptions } from "@/features/media/queries";
import { mediaList } from "@/features/media/search";
import { assertRoutePermission } from "@/features/rbac/route-guard";
import { staticCrumb } from "@/lib/breadcrumbs";
import { listLoader, listSearch, titleHead } from "@/lib/crud/route";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_admin/admin/media")({
	...listSearch(mediaList.search, mediaList.defaults),
	beforeLoad: ({ context }) => assertRoutePermission(context.session, "media:read"),
	loaderDeps: ({ search }) => search,
	loader: (route) => listLoader(route, { tableId: "media", query: mediaListQueryOptions }),
	staticData: { breadcrumb: staticCrumb(m.media_title) },
	head: titleHead(m.media_title),
	component: MediaLibrary,
});
