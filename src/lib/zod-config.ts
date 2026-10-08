import { z } from "zod";

/**
 * Zod 4 compiles object schemas with `new Function` when it detects eval is
 * allowed, and detecting that is itself an eval. Our Content-Security-Policy
 * forbids eval (no 'unsafe-eval'), so the probe shows up as a CSP violation on
 * every page. Jitless mode skips both; validation is just as correct.
 * Imported first by the client and server entries (src/client.tsx, src/server.ts),
 * before Sentry reads the env schema, and by src/router.tsx for tests and tools.
 */
z.config({ jitless: true });
