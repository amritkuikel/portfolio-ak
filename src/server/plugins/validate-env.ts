/**
 * Nitro runs plugins when the server boots, before handling any request.
 * TanStack Start's SSR handler is loaded lazily on the first request, so importing
 * the env there would delay validation. Importing it here makes `pnpm start`
 * (and a serverless cold start) fail immediately on missing or invalid env.
 */
import "../env";
import { definePlugin } from "nitro";

export default definePlugin(() => {});
