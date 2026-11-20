import * as Sentry from '@sentry/react-native';
import { env } from '@/lib/env';

/** True when a DSN is configured. With no DSN the integration is fully off. */
export const monitoringEnabled = Boolean(env.EXPO_PUBLIC_SENTRY_DSN);

let initialised = false;

/**
 * Initialise Sentry once, only when EXPO_PUBLIC_SENTRY_DSN is set.
 * Events must carry ids and error codes, never task titles or message text (doc 08 section 8.4).
 */
export function initMonitoring(): void {
  if (initialised || !env.EXPO_PUBLIC_SENTRY_DSN) return;
  initialised = true;
  Sentry.init({
    dsn: env.EXPO_PUBLIC_SENTRY_DSN,
    environment: env.EXPO_PUBLIC_ENV,
    sendDefaultPii: false,
    tracesSampleRate: env.EXPO_PUBLIC_ENV === 'production' ? 0.1 : 1.0,
  });
}

export const wrapRoot = Sentry.wrap;

export function captureError(error: unknown): void {
  if (!monitoringEnabled) return;
  Sentry.captureException(error);
}
