/**
 * Browser Sentry setup. Imported first by src/client.tsx so errors during
 * hydration are captured. No DSN, no Sentry: nothing is initialised or sent.
 */
import * as Sentry from "@sentry/tanstackstart-react";
import { sentryDsn, sentryOptions } from "./lib/observability/sentry";

if (sentryDsn) Sentry.init(sentryOptions(sentryDsn));
