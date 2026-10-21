import { z } from "zod";
import { TEST_CRUD_MAX_IMAGES } from "@/features/attachments/constants";
import { ALT_MAX, attachmentRefSchema, type ImageAsset } from "@/features/attachments/schema";
import { versionSchema } from "@/lib/concurrency";
import { formatNumber } from "@/lib/i18n/intl";
import { bulkIdsSchema, type Paged } from "@/lib/list/paging";
import { phone } from "@/lib/phone";
import type { SafeHtml } from "@/lib/safe-html";
import { currency, optionalText, required, richText, tags } from "@/lib/validation";
import { m } from "@/paraglide/messages";
import { TEST_CRUD_STATUSES, type TestCrudStatus } from "./constants";
import { SLUG_PATTERN } from "./search";

export * from "./constants";

// ---------------------------------------------------------------------------
// Create / update: ONE schema shared by the form (client) and the server functions
// ---------------------------------------------------------------------------

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

// Server function inputs (the URL contract, list input included, is in ./search.ts).
export const testCrudIdsSchema = bulkIdsSchema(100);
export const testCrudIdSchema = z.object({ id: z.uuid() });
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
// Public side (/test-crud): published items only, no auth (search params in ./search.ts)
// ---------------------------------------------------------------------------

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
