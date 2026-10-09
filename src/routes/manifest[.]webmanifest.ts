import { createFileRoute } from "@tanstack/react-router";
import { webManifest } from "@/server/seo/manifest";
import { textResponse } from "@/server/seo/response";

/** /manifest.webmanifest, and /ne/manifest.webmanifest in Nepali (src/server/seo/manifest.ts). */
export const Route = createFileRoute("/manifest.webmanifest")({
	server: {
		handlers: {
			GET: ({ request }) =>
				textResponse(request, null, "application/manifest+json", () => JSON.stringify(webManifest())),
		},
	},
});
