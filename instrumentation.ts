// Error tracking (Sentry) on the website's server side. Without SENTRY_DSN
// (or NEXT_PUBLIC_SENTRY_DSN) nothing is sent.
import * as Sentry from "@sentry/nextjs";

export function register() {
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({ dsn, environment: process.env.NODE_ENV, tracesSampleRate: 0.1 });
}

export const onRequestError = Sentry.captureRequestError;
