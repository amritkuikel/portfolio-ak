import type { Organization, Product, WebSite } from "schema-dts";
import { getLocale, localizeHref } from "@/paraglide/runtime";
import { clientEnv } from "./env/client";
import { DEFAULT_CURRENCY } from "./i18n/intl";
import { absoluteUrl } from "./seo";

/**
 * schema.org objects for seo({ jsonLd }). Types come from schema-dts, so a
 * misspelt property or a wrong value type fails typecheck. BreadcrumbList is
 * built by <Breadcrumbs jsonLd> (src/lib/breadcrumbs.ts).
 */

const ORGANIZATION_ID = () => absoluteUrl("/#organization");

/** The site owner (home page). The logo is the 512 px app icon. */
export const organizationJsonLd = (): Exclude<Organization, string> => ({
	"@type": "Organization",
	"@id": ORGANIZATION_ID(),
	name: clientEnv.VITE_APP_TITLE,
	url: absoluteUrl("/"),
	logo: absoluteUrl("/icon-512.png"),
});

/** The site itself, in the current language (home page). */
export const websiteJsonLd = (description: string): Exclude<WebSite, string> => ({
	"@type": "WebSite",
	"@id": absoluteUrl(`${localizeHref("/")}#website`),
	name: clientEnv.VITE_APP_TITLE,
	description,
	url: absoluteUrl(localizeHref("/")),
	inLanguage: getLocale(),
	publisher: { "@id": ORGANIZATION_ID() },
});

export type ProductJsonLdInput = {
	name: string;
	description: string;
	/** De-localized path of the item's page. */
	path: string;
	price: number;
	images: ReadonlyArray<string>;
	publishedAt: string;
	tags: ReadonlyArray<string>;
};

/** A published Test CRUD item: a Product with an Offer (it has a price). */
export const productJsonLd = (item: ProductJsonLdInput): Exclude<Product, string> => {
	const url = absoluteUrl(localizeHref(item.path));
	return {
		"@type": "Product",
		"@id": `${url}#product`,
		name: item.name,
		description: item.description,
		url,
		...(item.images.length > 0 ? { image: [...item.images] } : {}),
		...(item.tags.length > 0 ? { keywords: item.tags.join(", ") } : {}),
		releaseDate: item.publishedAt,
		brand: { "@id": ORGANIZATION_ID() },
		offers: {
			"@type": "Offer",
			url,
			price: item.price.toFixed(2),
			priceCurrency: DEFAULT_CURRENCY,
			availability: "https://schema.org/InStock",
			seller: { "@id": ORGANIZATION_ID() },
		},
	};
};
