import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { ArrowLeftIcon } from "lucide-react";
import { RichTextContent } from "@/components/rich-text-content";
import { Badge } from "@/components/ui/badge";
import { publicTestCrudDetailQueryOptions } from "@/features/test-crud/queries";
import { testCrudSlugParamSchema } from "@/features/test-crud/schema";
import { isAppError } from "@/lib/errors";
import { setErrorStatus } from "@/lib/http-status";
import { formatCurrency, formatDate } from "@/lib/intl";
import { seo } from "@/lib/seo";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_public/test-crud/$slug")({
	loader: async ({ context, params }) => {
		// Not a valid slug -> can't exist; answer the localized 404 without a query.
		if (!testCrudSlugParamSchema.safeParse(params).success) throw notFound();
		try {
			return await context.queryClient.ensureQueryData(publicTestCrudDetailQueryOptions(params.slug));
		} catch (error) {
			// Missing and draft slugs are indistinguishable to the public: both 404.
			if (isAppError(error) && error.code === "NOT_FOUND") throw notFound();
			await setErrorStatus(error);
			throw error;
		}
	},
	head: ({ loaderData, params }) => {
		if (!loaderData) return {};
		const tags = seo({
			title: loaderData.title,
			description: loaderData.summary || m.test_crud_public_description(),
			path: `/test-crud/${params.slug}`,
			image: loaderData.imageUrl,
			type: "article",
		});
		return {
			...tags,
			meta: [...tags.meta, { property: "article:published_time", content: loaderData.publishedAt }],
		};
	},
	component: PublicDetailPage,
});

function PublicDetailPage() {
	const { slug } = Route.useParams();
	const { data: item } = useSuspenseQuery(publicTestCrudDetailQueryOptions(slug));
	const phone = item.phone ? parsePhoneNumberFromString(item.phone) : undefined;

	return (
		<main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 sm:py-14">
			<Link
				to="/test-crud"
				className="inline-flex w-fit items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
			>
				<ArrowLeftIcon className="size-4" aria-hidden />
				{m.test_crud_public_all_items()}
			</Link>
			<article className="flex flex-col gap-6">
				<header className="flex flex-col gap-3">
					<h1 className="font-semibold text-3xl leading-tight tracking-tight sm:text-4xl">{item.title}</h1>
					<p className="text-muted-foreground text-sm">
						{m.test_crud_public_published_on({ date: formatDate(item.publishedAt, { dateStyle: "long" }) })}
					</p>
					{item.summary ? <p className="text-lg text-muted-foreground">{item.summary}</p> : null}
				</header>
				{item.imageUrl ? (
					<img
						src={item.imageUrl}
						alt=""
						width={1280}
						height={720}
						className="aspect-[16/9] w-full rounded-xl border bg-muted object-cover"
					/>
				) : null}
				<dl className="grid gap-4 rounded-xl border bg-card p-4 text-sm sm:grid-cols-3">
					<div className="flex flex-col gap-1">
						<dt className="text-muted-foreground">{m.test_crud_public_price()}</dt>
						<dd className="font-medium text-base tabular-nums">{formatCurrency(item.price)}</dd>
					</div>
					{phone ? (
						<div className="flex flex-col gap-1">
							<dt className="text-muted-foreground">{m.test_crud_public_contact()}</dt>
							<dd>
								<a href={phone.getURI()} className="font-medium text-base underline-offset-4 hover:underline">
									{phone.formatInternational()}
								</a>
							</dd>
						</div>
					) : null}
					{item.tags.length > 0 ? (
						<div className="flex flex-col gap-1">
							<dt className="text-muted-foreground">{m.test_crud_public_tags()}</dt>
							<dd className="flex flex-wrap gap-1">
								{item.tags.map((tag) => (
									<Badge key={tag} variant="secondary">
										{tag}
									</Badge>
								))}
							</dd>
						</div>
					) : null}
				</dl>
				{item.body ? <RichTextContent html={item.body} className="max-w-none text-base" /> : null}
			</article>
		</main>
	);
}
