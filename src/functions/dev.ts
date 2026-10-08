import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { AppError } from "@/lib/errors";
import { zodInput } from "@/lib/fn-input";
import { sanitizeRichText } from "@/server/rich-text/sanitize";

/**
 * Dev-only: runs the rich-text sanitizer for the /dev/forms showcase so the
 * stored/rendered form of editor output can be inspected. Refuses in production.
 */
export const previewRichText = createServerFn({ method: "POST" })
	.validator(zodInput(z.object({ html: z.string().max(100_000) })))
	.handler(({ data }) => {
		if (!import.meta.env.DEV) throw new AppError("NOT_FOUND", "Not found");
		return { html: sanitizeRichText(data.html) };
	});
