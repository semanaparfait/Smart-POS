// Error tracking (Sentry) in the browser. Without NEXT_PUBLIC_SENTRY_DSN
// nothing is sent.
import * as Sentry from "@sentry/nextjs";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    // A tenth of page loads are timed, to spot slow pages.
    tracesSampleRate: 0.1,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
