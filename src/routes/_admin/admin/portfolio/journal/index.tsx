import { createFileRoute } from "@tanstack/react-router";
import { PostList, PostsPending } from "@/features/portfolio/admin/components/post-list";
import { postListQueryOptions } from "@/features/portfolio/admin/queries";
import { POSTS_TABLE_ID } from "@/features/portfolio/constants";
import { postList } from "@/features/portfolio/search";
import { listLoader, listSearch, titleHead } from "@/lib/crud/route";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_admin/admin/portfolio/journal/")({
	...listSearch(postList.search, postList.defaults),
	loaderDeps: ({ search }) => search,
	loader: (route) => listLoader(route, { tableId: POSTS_TABLE_ID, query: postListQueryOptions }),
	head: titleHead(m.portfolio_admin_posts_title),
	pendingComponent: PostsPending,
	component: PostList,
});
