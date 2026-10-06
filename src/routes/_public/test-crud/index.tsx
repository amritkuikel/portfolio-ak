import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, stripSearchParams, useNavigate } from "@tanstack/react-router";
import type { FormEvent } from "react";
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
		<main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:py-14">
			<header className="flex flex-col gap-4">
				<h1 className="font-semibold text-3xl tracking-tight sm:text-4xl">{m.test_crud_public_title()}</h1>
				<p className="max-w-2xl text-muted-foreground">{m.test_crud_public_description()}</p>
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
			</header>

			{data.items.length === 0 ? (
				<div
					className="flex flex-col items-center gap-4 rounded-xl border border-dashed p-12 text-center"
					data-testid="public-empty"
				>
					<p className="text-muted-foreground">
						{search.q ? m.test_crud_public_no_results({ q: search.q }) : m.test_crud_public_empty()}
					</p>
					{search.q ? (
						<Button variant="outline" asChild>
							<Link to="/test-crud">{m.test_crud_public_show_all()}</Link>
						</Button>
					) : null}
				</div>
			) : (
				<ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="public-grid">
					{data.items.map((item) => (
						<li key={item.slug} className="flex">
							<PublicCard item={item} />
						</li>
					))}
				</ul>
			)}

			{data.pageCount > 1 ? (
				<nav aria-label={m.test_crud_pagination()} className="flex items-center justify-center gap-3 text-sm">
					<PageLink search={search} page={data.page - 1} disabled={data.page <= 1}>
						{m.test_crud_prev()}
					</PageLink>
					<span aria-current="page">
						{m.test_crud_page_of({ page: formatNumber(data.page), count: formatNumber(data.pageCount) })}
					</span>
					<PageLink search={search} page={data.page + 1} disabled={data.page >= data.pageCount}>
						{m.test_crud_next()}
					</PageLink>
				</nav>
			) : null}
		</main>
	);
}

function PageLink({
	search,
	page,
	disabled,
	children,
}: {
	search: TestCrudPublicSearch;
	page: number;
	disabled: boolean;
	children: string;
}) {
	const className = "inline-flex h-9 items-center rounded-md border px-3 hover:bg-accent";
	// A disabled step is plain text, not a dead link.
	if (disabled) return <span className={`${className} pointer-events-none opacity-50`}>{children}</span>;
	return (
		<Link
			from={Route.fullPath}
			search={{ ...search, page }}
			className={className}
			rel={page > search.page ? "next" : "prev"}
		>
			{children}
		</Link>
	);
}

/** Card-shaped placeholders while a client-side navigation loads (SSR never shows this). */
function PublicListPending() {
	return (
		<main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:py-14" aria-busy="true">
			<output className="sr-only">{m.test_crud_public_loading()}</output>
			<div className="flex flex-col gap-4">
				<div className="h-10 w-48 animate-pulse rounded-md bg-muted" />
				<div className="h-5 w-full max-w-xl animate-pulse rounded bg-muted" />
				<div className="h-9 w-full max-w-lg animate-pulse rounded-md bg-muted" />
			</div>
			<ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: Math.min(6, TEST_CRUD_PUBLIC_PAGE_SIZE) }, (_, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list; items have no identity.
					<li key={index}>
						<PublicCardSkeleton />
					</li>
				))}
			</ul>
		</main>
	);
}
