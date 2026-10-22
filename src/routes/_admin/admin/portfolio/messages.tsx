import { createFileRoute } from "@tanstack/react-router";
import { MessagesInbox, MessagesPending } from "@/features/portfolio/admin/components/messages-inbox";
import { messageListQueryOptions } from "@/features/portfolio/admin/queries";
import { MESSAGES_TABLE_ID } from "@/features/portfolio/constants";
import { messageList } from "@/features/portfolio/search";
import { assertRoutePermission } from "@/features/rbac/route-guard";
import { staticCrumb } from "@/lib/breadcrumbs";
import { listLoader, listSearch, titleHead } from "@/lib/crud/route";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_admin/admin/portfolio/messages")({
	...listSearch(messageList.search, messageList.defaults),
	beforeLoad: ({ context }) => assertRoutePermission(context.session, "messages:read"),
	loaderDeps: ({ search }) => search,
	loader: (route) => listLoader(route, { tableId: MESSAGES_TABLE_ID, query: messageListQueryOptions }),
	staticData: { breadcrumb: staticCrumb(m.messages_title) },
	head: titleHead(m.messages_title),
	pendingComponent: MessagesPending,
	component: MessagesInbox,
});
