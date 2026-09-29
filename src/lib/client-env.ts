import { createClientEnv } from "./client-env.schema.ts";

/** Validated public environment. Safe to import anywhere, including the browser. */
export const clientEnv = createClientEnv(import.meta.env);
