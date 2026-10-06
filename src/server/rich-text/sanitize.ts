import sanitizeHtml from "sanitize-html";
import type { SafeHtml } from "@/lib/safe-html";

/**
 * Allowlist matching exactly what the RichTextField toolbar can produce
 * (StarterKit with h2/h3 and links). Disallowed tags are unwrapped (their text
 * kept); script/style/textarea contents are dropped entirely (sanitize-html's
 * default nonTextTags).
 */
const OPTIONS: sanitizeHtml.IOptions = {
	allowedTags: [
		"p",
		"br",
		"strong",
		"em",
		"u",
		"s",
		"code",
		"pre",
		"h2",
		"h3",
		"ul",
		"ol",
		"li",
		"blockquote",
		"hr",
		"a",
	],
	// rel/target are listed because transformTags runs before attribute filtering;
	// the transform overwrites any values the input carried.
	allowedAttributes: { a: ["href", "rel", "target"], ol: ["start"] },
	allowedSchemes: ["http", "https", "mailto"],
	allowedSchemesAppliedToAttributes: ["href"],
	allowProtocolRelative: false,
	disallowedTagsMode: "discard",
	transformTags: {
		// Links open in a new tab without leaking the opener or passing ranking.
		a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow", target: "_blank" }),
	},
	// A link whose href was removed (e.g. javascript:) becomes plain text.
	exclusiveFilter: (frame) => (frame.tag === "a" && !frame.attribs.href ? "excludeTag" : false),
};

/**
 * Sanitize rich-text HTML. Call it before storing editor output and again on
 * the server before sending stored HTML to the page (defence in depth against
 * rows written by older code or directly in the database).
 */
export const sanitizeRichText = (html: string): SafeHtml => sanitizeHtml(html, OPTIONS).trim() as SafeHtml;
