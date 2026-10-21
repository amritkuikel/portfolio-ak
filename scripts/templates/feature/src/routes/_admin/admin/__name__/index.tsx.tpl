import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { __Pascal__AdminList } from "@/features/__name__/components/admin-list";
import { __camel__ListQueryOptions } from "@/features/__name__/queries";
import { __UPPER___SEARCH_DEFAULTS, __UPPER___TABLE_ID, __camel__SearchSchema } from "@/features/__name__/schema";
import { loadList } from "@/lib/query";
import { pageTitle } from "@/lib/seo";
import { tableListInput } from "@/hooks/use-list-page";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_admin/admin/__name__/")({
	validateSearch: __camel__SearchSchema,
	// Default values stay out of generated links, so URLs stay short.
	search: { middlewares: [stripSearchParams(__UPPER___SEARCH_DEFAULTS)] },
	loaderDeps: ({ search }) => search,
	loader: ({ context, deps, cause }) =>
		loadList(
			context.queryClient,
			__camel__ListQueryOptions(tableListInput(deps, context.preferences.state, __UPPER___TABLE_ID)),
			cause,
		),
	head: () => ({ meta: [{ title: pageTitle(m.__snake___title()) }] }),
	component: __Pascal__AdminPage,
});

function __Pascal__AdminPage() {
	return <__Pascal__AdminList search={Route.useSearch()} />;
}
