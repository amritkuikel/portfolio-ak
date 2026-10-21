import { createFileRoute, Link, stripSearchParams } from "@tanstack/react-router";
import { FilterBar } from "@/components/filters/filter-bar";
import { SearchFilter } from "@/components/filters/filters";
import { Pagination } from "@/components/navigation/pagination";
import { EmptyState } from "@/components/page/empty-state";
import { Page, PageHeader } from "@/components/page/page";
import { ListSkeleton, PageHeaderSkeleton } from "@/components/page/skeletons";
import { Button } from "@/components/ui/button";
import { PublicCard, PublicCardSkeleton } from "@/features/test-crud/components/public-card";
import { TestCrudQuickView } from "@/features/test-crud/components/quick-view";
import { publicTestCrudListQueryOptions } from "@/features/test-crud/queries";
import {
	TEST_CRUD_PUBLIC_PAGE_SIZE,
	TEST_CRUD_PUBLIC_SEARCH_DEFAULTS,
	testCrudPublicRouteSearchSchema,
} from "@/features/test-crud/search";
import { useListQuery } from "@/hooks/use-list-query";
import { formatNumber } from "@/lib/i18n/intl";
import { loadList } from "@/lib/query";
import { listSeo } from "@/lib/seo";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_public/test-crud/")({
	validateSearch: testCrudPublicRouteSearchSchema,
	search: { middlewares: [stripSearchParams(TEST_CRUD_PUBLIC_SEARCH_DEFAULTS)] },
	// `view` only opens the quick-view dialog: it must not reload the list.
	loaderDeps: ({ search: { view: _view, ...list } }) => list,
	// SSR and entering: awaited, so the cards are in the HTML and the page works without
	// JavaScript. A new search keeps the current cards until the new ones arrive (loadList).
	loader: ({ context, deps, cause }) => loadList(context.queryClient, publicTestCrudListQueryOptions(deps), cause),
	head: ({ match: { search } }) =>
		listSeo({
			title: m.test_crud_public_title(),
			description: m.test_crud_public_description(),
			path: "/test-crud",
			q: search.q,
			page: search.page,
		}),
	pendingComponent: PublicListPending,
	component: PublicListPage,
});

function PublicListPage() {
	const { view, ...search } = Route.useSearch();
	const { data, busy, error } = useListQuery(publicTestCrudListQueryOptions(search));
	if (error && !data) throw error;
	if (!data) return <PublicListPending />;

	return (
		<Page width="wide" className="gap-8">
			<PageHeader
				size="display"
				title={m.test_crud_public_title()}
				description={m.test_crud_public_description()}
				breadcrumbsJsonLd
			>
				<FilterBar values={search} label={m.test_crud_search_label()} submitLabel={m.test_crud_search_submit()}>
					<SearchFilter
						label={m.test_crud_search_label()}
						hideLabel
						value={search.q}
						placeholder={m.test_crud_public_search_placeholder()}
						className="sm:w-96"
					/>
				</FilterBar>
				{search.q ? (
					<p className="text-muted-foreground text-sm" aria-live="polite">
						{m.test_crud_public_results({ count: formatNumber(data.total), q: search.q })}
					</p>
				) : null}
			</PageHeader>

			{data.items.length === 0 ? (
				<EmptyState
					data-testid="public-empty"
					description={search.q ? m.test_crud_public_no_results({ q: search.q }) : m.test_crud_public_empty()}
					action={
						search.q ? (
							<Button variant="outline" asChild>
								<Link to="/test-crud">{m.test_crud_public_show_all()}</Link>
							</Button>
						) : null
					}
				/>
			) : (
				<ul
					className="grid gap-6 transition-opacity aria-busy:opacity-60 motion-reduce:transition-none sm:grid-cols-2 lg:grid-cols-3"
					aria-busy={busy || undefined}
					data-testid="public-grid"
				>
					{data.items.map((item) => (
						<li key={item.slug} className="flex">
							<PublicCard item={item} quickView />
						</li>
					))}
				</ul>
			)}

			<Pagination page={data.page} pageCount={data.pageCount} layout="center" hideWhenSingle />
			{view ? <TestCrudQuickView slug={view} /> : null}
		</Page>
	);
}

/** Card-shaped placeholders while a client-side navigation loads (SSR never shows this). */
function PublicListPending() {
	return (
		<Page width="wide" className="gap-8" aria-busy="true">
			<output className="sr-only">{m.test_crud_public_loading()}</output>
			<PageHeaderSkeleton size="display" extra />
			<ListSkeleton
				count={Math.min(6, TEST_CRUD_PUBLIC_PAGE_SIZE)}
				item={<PublicCardSkeleton />}
				className="sm:grid-cols-2 lg:grid-cols-3"
			/>
		</Page>
	);
}
