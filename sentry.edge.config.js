import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://a1cf5c15e6f84d09bec76e60b8846341@o1339131.ingest.sentry.io/6610904",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0.5,

  // ...

  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
});
