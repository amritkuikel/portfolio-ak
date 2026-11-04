import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { HubPageData, HubRailData } from "@/features/parda/home/types";
import { PARDA_HUBS, PARDA_TYPES, titleParamsSchema } from "@/features/parda/search";
import type { TitlePageData } from "@/features/parda/title/types";
import { zodInput } from "@/functions/_lib/validator";
import { withPardaCatalog } from "@/middleware/parda";
import { locales } from "@/paraglide/runtime";
import { catalogScope } from "@/server/parda/catalog/context";
import { hubPage, hubRail } from "@/server/parda/catalog/hubs";
import { titlePage } from "@/server/parda/catalog/title-page";

/**
 * Parda's catalogue reads (PLAN 12.5, decision 0234): open to everyone, each starting
 * with `withPardaCatalog`. Takedowns and the cache epoch apply inside
 * src/server/parda/catalog/service.ts, the only way in. The locale is an input, so a
 * client-side navigation reads the language of the page it goes to.
 */

const locale = z.enum(locales);
const page = z.enum(["home", ...PARDA_HUBS]);
const hubInput = z.strictObject({ page, locale });
const railInput = z.strictObject({
	page,
	rail: z.string().regex(/^[a-z0-9-]{1,40}$/),
	locale,
});
const titleInput = titleParamsSchema.extend({ locale }).strict();

export const getPardaHub = createServerFn({ method: "GET" })
	.middleware([withPardaCatalog])
	.validator(zodInput(hubInput))
	.handler(
		({ data, context }): Promise<HubPageData> =>
			context.catalog
				? hubPage(context.catalog.services, catalogScope(context.catalog, data.locale), data.page)
				: Promise.resolve({ configured: false }),
	);

export const getPardaRail = createServerFn({ method: "GET" })
	.middleware([withPardaCatalog])
	.validator(zodInput(railInput))
	.handler(
		({ data, context }): Promise<HubRailData> =>
			context.catalog
				? hubRail(context.catalog.services, catalogScope(context.catalog, data.locale), data.page, data.rail)
				: Promise.resolve({ imageBase: "", titles: null }),
	);

export const getPardaTitle = createServerFn({ method: "GET" })
	.middleware([withPardaCatalog])
	.validator(zodInput(titleInput))
	.handler(
		({ data, context }): Promise<TitlePageData> =>
			context.catalog
				? titlePage(
						context.catalog.services,
						catalogScope(context.catalog, data.locale),
						PARDA_TYPES[data.type],
						data.id,
					)
				: Promise.resolve({ configured: false }),
	);
