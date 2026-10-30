/**
 * The browser review: every page in REVIEWED_PAGES, in en/ne × light/dark × 390/768/1280.
 * A route missing from the list fails tests/unit/e2e-pages.test.ts.
 */
import { E2E } from "./harness/config.ts";
import { type Harness, RESOURCE_STATUS, signedIn, test } from "./support/fixtures.ts";
import {
	localizedPath,
	REVIEWED_PAGES,
	type ReviewedPage,
	routePattern,
	SEEDED_ITEM_SLUG,
	SEEDED_PUBLISHED_SLUG,
} from "./support/pages.ts";
import { reviewPage } from "./support/review.ts";

const THEMES = ["light", "dark"] as const;
const WIDTHS = [390, 768, 1280] as const;
const LOCALES = ["en", "ne"] as const;

let sitemapPaths: Promise<string[]> | undefined;
/** English paths listed in /sitemap.xml (read once per worker). */
const fromSitemap = () => {
	sitemapPaths ??= fetch(new URL("/sitemap.xml", E2E.baseURL))
		.then((response) => response.text())
		.then((xml) =>
			[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
				.map((match) => new URL(match[1] ?? "", E2E.baseURL).pathname)
				.filter((path) => !path.startsWith("/ne/") && path !== "/ne"),
		);
	return sitemapPaths;
};

async function resolvePath(page: ReviewedPage, harness: Harness) {
	if (page.path) return page.path;
	if (!page.params) return page.route;
	if (page.params.from === "test-crud-id") {
		return page.route.replace("$id", await harness.testCrudId(SEEDED_ITEM_SLUG));
	}
	if (page.params.from === "seeded-slug") return page.route.replace("$slug", SEEDED_PUBLISHED_SLUG);
	// portfolio:start
	if (page.params.from === "portfolio-project-id") {
		return page.route.replace("$id", await harness.portfolioId("project", "ledgerline"));
	}
	if (page.params.from === "portfolio-post-id") {
		return page.route.replace("$id", await harness.portfolioId("post", "server-render-everything"));
	}
	// portfolio:end
	// apps:start
	if (page.params.from === "kanban-board-id") {
		return page.route.replace("$boardId", await harness.kanbanBoardId(page.as ?? "member"));
	}
	// apps:end
	const pattern = routePattern(page.route);
	const path = (await fromSitemap()).find((candidate) => pattern.test(candidate));
	if (!path) throw new Error(`no sitemap URL matches ${page.route}`);
	return path;
}

for (const page of REVIEWED_PAGES) {
	const name = [page.route, page.as && `as ${page.as}`, page.label].filter(Boolean).join(" ");
	test.describe(name, () => {
		if (page.as) test.use(signedIn(page.as));
		for (const theme of THEMES) {
			for (const width of WIDTHS) {
				test.describe(`${theme} ${width}`, () => {
					test.use({ colorScheme: theme, viewport: { width, height: 900 } });
					for (const locale of LOCALES) {
						test(locale, async ({ page: browserPage, harness, guard }) => {
							if (page.status) guard.allow(RESOURCE_STATUS(page.status));
							const path = await resolvePath(page, harness);
							await reviewPage(browserPage, localizedPath(path, locale), page.status ? { status: page.status } : {});
						});
					}
				});
			}
		}
	});
}
