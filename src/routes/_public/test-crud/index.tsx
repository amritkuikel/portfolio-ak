import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, stripSearchParams, useNavigate } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { Pagination } from "@/components/navigation/pagination";
import { EmptyState } from "@/components/page/empty-state";
import { Page, PageHeader } from "@/components/page/page";
import { ListSkeleton, PageHeaderSkeleton } from "@/components/page/skeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PublicCard, PublicCardSkeleton } from "@/features/test-crud/components/public-card";
import { publicTestCrudListQueryOptions } from "@/features/test-crud/queries";
import {
	TEST_CRUD_PUBLIC_PAGE_SIZE,
	TEST_CRUD_PUBLIC_SEARCH_DEFAULTS,
	type TestCrudPublicSearch,
	testCrudPublicSearchSchema,
} from "@/features/test-crud/schema";
import { formatNumber } from "@/lib/intl";
import { seo } from "@/lib/seo";
import { m } from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

export const Route = createFileRoute("/_public/test-crud/")({
	validateSearch: testCrudPublicSearchSchema,
	search: { middlewares: [stripSearchParams(TEST_CRUD_PUBLIC_SEARCH_DEFAULTS)] },
	loaderDeps: ({ search }) => search,
	// Awaited: the cards are in the SSR HTML, so the page works without JavaScript.
	loader: ({ context, deps }) => context.queryClient.ensureQueryData(publicTestCrudListQueryOptions(deps)),
	head: ({ match }) => listSeo(match.search),
	pendingComponent: PublicListPending,
	component: PublicListPage,
});

/** Page 1 is canonical "/test-crud"; later pages are their own URLs; searches are noindex. */
const listSeo = ({ q, page }: TestCrudPublicSearch) =>
	seo({
		title: q
			? m.test_crud_public_search_title({ q })
			: page > 1
				? m.test_crud_public_page_title({ page: formatNumber(page) })
				: m.test_crud_public_title(),
		description: m.test_crud_public_description(),
		path: page > 1 && !q ? `/test-crud?page=${page}` : "/test-crud",
		noindex: q !== "",
	});

function PublicListPage() {
	const search = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });
	const { data } = useSuspenseQuery(publicTestCrudListQueryOptions(search));

	// Without JS this is a normal GET form to the same URL.
	const onSearch = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const q = String(new FormData(event.currentTarget).get("q") ?? "");
		void navigate({ search: { q, page: 1 } });
	};

	return (
		<Page width="wide" className="gap-8">
			<PageHeader
				size="display"
				title={m.test_crud_public_title()}
				description={m.test_crud_public_description()}
				breadcrumbsJsonLd
			>
				<search>
					<form method="get" action={localizeHref("/test-crud")} onSubmit={onSearch} className="flex max-w-lg gap-2">
						<label htmlFor="public-q" className="sr-only">
							{m.test_crud_search_label()}
						</label>
						<Input
							id="public-q"
							name="q"
							type="search"
							defaultValue={search.q}
							key={search.q}
							placeholder={m.test_crud_public_search_placeholder()}
						/>
						<Button type="submit">{m.test_crud_search_submit()}</Button>
					</form>
				</search>
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
				<ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="public-grid">
					{data.items.map((item) => (
						<li key={item.slug} className="flex">
							<PublicCard item={item} />
						</li>
					))}
				</ul>
			)}

			<Pagination page={data.page} pageCount={data.pageCount} layout="center" hideWhenSingle />
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
