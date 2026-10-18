import { z } from "zod";
import { TEST_CRUD_MAX_IMAGES } from "@/features/attachments/constants";
import { ALT_MAX, attachmentRefSchema, type ImageAsset } from "@/features/attachments/schema";
import { versionSchema } from "@/lib/concurrency";
import { formatNumber } from "@/lib/intl";
import {
	bulkIdsSchema,
	enumParam,
	type Paged,
	pageParam,
	pageSizeParam,
	resolvedPageSize,
	searchParam,
} from "@/lib/list";
import type { SafeHtml } from "@/lib/safe-html";
import { arrayParam, booleanParam, dateParam, numberParam } from "@/lib/search";
import { currency, optionalText, phone, required, richText, tags } from "@/lib/validation";
import { m } from "@/paraglide/messages";
import { TEST_CRUD_STATUSES, type TestCrudStatus } from "./constants";

export * from "./constants";

// ---------------------------------------------------------------------------
// Create / update: ONE schema shared by the form (client) and the server functions
// ---------------------------------------------------------------------------

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const slug = () =>
	z
		.string()
		.trim()
		.min(1, { error: () => m.validation_required() })
		.max(80, { error: () => m.validation_text_max({ max: formatNumber(80) }) })
		.regex(SLUG_PATTERN, { error: () => m.validation_slug() });

/**
 * Every editable field. `images` are attachments (uploaded beforehand, straight
 * to Cloudinary) in display order with their alt text; the first is the cover.
 */
export const testCrudInputSchema = z.object({
	title: required({ max: 120 }),
	slug: slug(),
	summary: optionalText({ max: 280 }),
	/** Rich-text HTML; the server sanitizes it before storing. */
	body: richText({ required: false, max: 20_000 }),
	status: z.enum(TEST_CRUD_STATUSES),
	price: currency({ max: 10_000_000 }),
	phone: phone({ optional: true }),
	tags: tags({ max: 10, maxLength: 32 }),
	images: z.array(attachmentRefSchema).max(TEST_CRUD_MAX_IMAGES),
});
export type TestCrudInput = z.output<typeof testCrudInputSchema>;

/** Update: the same fields plus which item and the version the edit started from (its `updatedAt`). */
export const testCrudUpdateSchema = testCrudInputSchema.extend({ id: z.uuid(), updatedAt: versionSchema() });

/** One image in the form: the attachment, its alt text, and its preview (not sent to the server). */
export const formImageSchema = z.object({
	id: z.uuid(),
	alt: optionalText({ max: ALT_MAX }),
	preview: z.custom<ImageAsset>(),
});

/** The admin form: the shared input, with image previews for the editor. */
export const testCrudFormSchema = testCrudInputSchema.extend({
	images: z.array(formImageSchema).max(TEST_CRUD_MAX_IMAGES),
});
export type TestCrudFormValues = z.input<typeof testCrudFormSchema>;

/** Form values -> the server input (previews dropped). */
export const toTestCrudInput = (values: z.output<typeof testCrudFormSchema>): TestCrudInput => ({
	...values,
	images: values.images.map(({ id, alt }) => ({ id, alt })),
});

/** Lowercase ASCII slug from a title ("Hello, World!" -> "hello-world"); "" for non-Latin titles. */
export const slugify = (title: string) =>
	title
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 80)
		.replace(/-+$/g, "");

// ---------------------------------------------------------------------------
// Admin list: URL search params == listTestCrud input
// ---------------------------------------------------------------------------

export const TEST_CRUD_SORTS = ["-updated", "updated", "title", "-title", "price", "-price"] as const;
export type TestCrudSort = (typeof TEST_CRUD_SORTS)[number];

export const TEST_CRUD_STATUS_FILTERS = ["all", ...TEST_CRUD_STATUSES] as const;
export type TestCrudStatusFilter = (typeof TEST_CRUD_STATUS_FILTERS)[number];

export const TEST_CRUD_SEARCH_DEFAULTS = {
	q: "",
	status: "all",
	sort: "-updated",
	page: 1,
	tags: [] as string[],
} as const satisfies { q: string; status: TestCrudStatusFilter; sort: TestCrudSort; page: number; tags: string[] };

export const TEST_CRUD_PRICE_MAX = 10_000_000;

/** A tag in a filter: same limits as stored tags. */
const tagValue = z.string().trim().min(1).max(32);

/**
 * /admin/test-crud search params and the list server function input. Invalid
 * values are corrected (.catch) rather than rejected. `pageSize` is optional in
 * the URL; the route falls back to the saved table preference.
 *
 * Filters: status, tags (any of), price range, published date range (calendar
 * days in the app time zone) and has-image.
 */
export const testCrudSearchSchema = z.object({
	q: searchParam(),
	status: enumParam(TEST_CRUD_STATUS_FILTERS, TEST_CRUD_SEARCH_DEFAULTS.status),
	tags: arrayParam(tagValue, { max: 10 }),
	priceMin: numberParam({ max: TEST_CRUD_PRICE_MAX }),
	priceMax: numberParam({ max: TEST_CRUD_PRICE_MAX }),
	from: dateParam(),
	to: dateParam(),
	hasImage: booleanParam(),
	sort: enumParam(TEST_CRUD_SORTS, TEST_CRUD_SEARCH_DEFAULTS.sort),
	page: pageParam(),
	pageSize: pageSizeParam(),
});
export type TestCrudSearch = z.output<typeof testCrudSearchSchema>;

/** The filter keys (what "Clear all" resets; sort and page size are kept). */
export const TEST_CRUD_FILTER_KEYS = ["q", "status", "tags", "priceMin", "priceMax", "from", "to", "hasImage"] as const;

/**
 * The admin list ROUTE's search: the list params plus `edit`, the item open in the
 * edit dialog (a masked route: the address bar shows /admin/test-crud/$id).
 * `edit` is UI state only; it is not part of the server function input.
 */
export const testCrudAdminRouteSearchSchema = testCrudSearchSchema.extend({
	edit: z.uuid().optional().catch(undefined),
});

/** What the list server function receives: the search with a resolved page size. */
export const testCrudListInputSchema = testCrudSearchSchema.extend({ pageSize: resolvedPageSize() });
export type TestCrudListInput = z.output<typeof testCrudListInputSchema>;

export const testCrudIdsSchema = bulkIdsSchema(100);
export const testCrudIdSchema = z.object({ id: z.uuid() });
/** Path params of /admin/test-crud/$id (the route doesn't match anything else). */
export const testCrudIdParamSchema = z.object({ id: z.uuid() });
export const testCrudStatusUpdateSchema = z.object({ id: z.uuid(), status: z.enum(TEST_CRUD_STATUSES) });

// ---------------------------------------------------------------------------
// DTOs (what crosses the wire; dates as ISO strings)
// ---------------------------------------------------------------------------

export type TestCrudListItem = {
	id: string;
	slug: string;
	title: string;
	status: TestCrudStatus;
	price: number;
	tags: string[];
	/** The cover (first image), or null. */
	image: ImageAsset | null;
	publishedAt: string | null;
	updatedAt: string;
};

export type TestCrudPage = Paged<TestCrudListItem>;

export type TestCrudDetail = TestCrudListItem & {
	/** Every image, in order (the first is `image`). */
	images: ImageAsset[];
	summary: string;
	body: string;
	phone: string | null;
	createdAt: string;
};

// ---------------------------------------------------------------------------
// Public side (/test-crud): published items only, no auth
// ---------------------------------------------------------------------------

export const TEST_CRUD_PUBLIC_PAGE_SIZE = 12;

export const TEST_CRUD_PUBLIC_SEARCH_DEFAULTS = { q: "", page: 1 } as const satisfies { q: string; page: number };

/** /test-crud search params and the public list input. Invalid values are corrected. */
export const testCrudPublicSearchSchema = z.object({ q: searchParam(), page: pageParam() });
export type TestCrudPublicSearch = z.output<typeof testCrudPublicSearchSchema>;

/** The public list ROUTE's search: plus `view`, the item in the quick-view dialog (masked to /test-crud/$slug). */
export const testCrudPublicRouteSearchSchema = testCrudPublicSearchSchema.extend({
	view: z.string().max(80).regex(SLUG_PATTERN).optional().catch(undefined),
});

/** Slug route param; anything that isn't a valid slug can't exist. */
export const testCrudSlugParamSchema = z.object({ slug: z.string().max(80).regex(SLUG_PATTERN) });

export type PublicTestCrudCard = {
	slug: string;
	title: string;
	summary: string;
	price: number;
	tags: string[];
	image: ImageAsset | null;
	publishedAt: string;
};

export type PublicTestCrudPage = Paged<PublicTestCrudCard>;

export type PublicTestCrudDetail = PublicTestCrudCard & {
	images: ImageAsset[];
	/** Sanitized on the server (sanitizeRichText); render with <RichTextContent>. */
	body: SafeHtml;
	phone: string | null;
};
