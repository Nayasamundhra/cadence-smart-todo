import type { ReactNode } from 'react';
import { PostHogProvider } from 'posthog-react-native';
import { env } from '@/lib/env';

/** True when a PostHog key is configured. With no key the integration is fully off. */
export const analyticsEnabled = Boolean(env.EXPO_PUBLIC_POSTHOG_KEY);

/**
 * Wraps the app in the PostHog provider only when a key is configured; otherwise it
 * renders children untouched. Never send task titles or free text (doc 08 section 8.4).
 */
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  if (!env.EXPO_PUBLIC_POSTHOG_KEY) return <>{children}</>;
  return (
    <PostHogProvider
      apiKey={env.EXPO_PUBLIC_POSTHOG_KEY}
      options={{
        host: env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
        disabled: __DEV__ && env.EXPO_PUBLIC_ENV === 'development',
      }}
    >
      {children}
    </PostHogProvider>
  );
}
