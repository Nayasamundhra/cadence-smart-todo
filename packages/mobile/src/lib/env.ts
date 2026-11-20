/**
 * Typed access to public build-time configuration (doc 08 section 8.7).
 * Everything here is public by design: it ships inside the app bundle.
 * Never add a secret here. Server secrets live in Supabase function secrets.
 *
 * Expo inlines `process.env.EXPO_PUBLIC_*` only for literal property accesses,
 * so each variable is read explicitly below rather than through a dynamic key.
 */
import { z } from 'zod';

const emptyToUndefined = (value: unknown) => (value === '' ? undefined : value);
const optionalString = z.preprocess(emptyToUndefined, z.string().optional());
const optionalUrl = z.preprocess(emptyToUndefined, z.url().optional());

const envSchema = z.object({
  EXPO_PUBLIC_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  EXPO_PUBLIC_SUPABASE_URL: optionalUrl,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: optionalString,
  EXPO_PUBLIC_API_BASE_URL: optionalUrl,
  EXPO_PUBLIC_SENTRY_DSN: optionalUrl,
  EXPO_PUBLIC_POSTHOG_KEY: optionalString,
  EXPO_PUBLIC_POSTHOG_HOST: optionalUrl,
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(raw: Record<string, string | undefined>): Env {
  return envSchema.parse(raw);
}

export const env: Env = parseEnv({
  EXPO_PUBLIC_ENV: process.env.EXPO_PUBLIC_ENV,
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
  EXPO_PUBLIC_POSTHOG_KEY: process.env.EXPO_PUBLIC_POSTHOG_KEY,
  EXPO_PUBLIC_POSTHOG_HOST: process.env.EXPO_PUBLIC_POSTHOG_HOST,
});
