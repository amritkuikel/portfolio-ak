/**
 * Nitro runs plugins when the server boots, before handling any request.
 * TanStack Start's SSR handler is loaded lazily on the first request, so validating
 * there would be too late. Doing it here makes `pnpm start` (and a serverless
 * cold start) fail immediately on:
 * - missing or invalid env (importing ../env runs the T3 Env schema), and
 * - a production build with no usable email provider (getEmailProvider throws).
 */
import "../env";
import { definePlugin } from "nitro";
import { getEmailProvider } from "../email/config";

export default definePlugin(() => {
	getEmailProvider();
});
