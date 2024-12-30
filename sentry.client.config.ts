/**
 * Copied from https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#create-initialization-config-files
 */
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://a1cf5c15e6f84d09bec76e60b8846341@o1339131.ingest.us.sentry.io/6610904",
  // Replay may only be enabled for the client-side
  integrations: [Sentry.replayIntegration()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for tracing.
  // We recommend adjusting this value in production
  // Learn more at
  // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
  tracesSampleRate: 1.0,

  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  // Learn more at
  // https://docs.sentry.io/platforms/javascript/session-replay/configuration/#general-integration-configuration
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // ...

  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
});
