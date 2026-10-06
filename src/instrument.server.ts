/**
 * Server Sentry setup, imported first by src/server.ts. This is Sentry's
 * "without --import" option, the one that works on serverless hosts (Vercel);
 * it instruments Node's native fetch/http. No DSN, no Sentry.
 */
import * as Sentry from "@sentry/tanstackstart-react";
import { sentryDsn, sentryOptions } from "./lib/observability/sentry";

if (sentryDsn) Sentry.init(sentryOptions(sentryDsn));
