import { parseEnv } from './env';

describe('parseEnv', () => {
  it('defaults to development and leaves integrations off when nothing is set', () => {
    const env = parseEnv({});
    expect(env.EXPO_PUBLIC_ENV).toBe('development');
    expect(env.EXPO_PUBLIC_SENTRY_DSN).toBeUndefined();
    expect(env.EXPO_PUBLIC_POSTHOG_KEY).toBeUndefined();
  });

  it('treats empty strings as unset so .env.example copies leave integrations off', () => {
    const env = parseEnv({
      EXPO_PUBLIC_SENTRY_DSN: '',
      EXPO_PUBLIC_POSTHOG_KEY: '',
      EXPO_PUBLIC_SUPABASE_URL: '',
    });
    expect(env.EXPO_PUBLIC_SENTRY_DSN).toBeUndefined();
    expect(env.EXPO_PUBLIC_POSTHOG_KEY).toBeUndefined();
    expect(env.EXPO_PUBLIC_SUPABASE_URL).toBeUndefined();
  });

  it('accepts valid values', () => {
    const env = parseEnv({
      EXPO_PUBLIC_ENV: 'staging',
      EXPO_PUBLIC_SENTRY_DSN: 'https://abc@o1.ingest.sentry.io/2',
    });
    expect(env.EXPO_PUBLIC_ENV).toBe('staging');
    expect(env.EXPO_PUBLIC_SENTRY_DSN).toBe('https://abc@o1.ingest.sentry.io/2');
  });

  it('rejects an unknown environment name', () => {
    expect(() => parseEnv({ EXPO_PUBLIC_ENV: 'prod' })).toThrow();
  });

  it('rejects a malformed DSN', () => {
    expect(() => parseEnv({ EXPO_PUBLIC_SENTRY_DSN: 'not a url' })).toThrow();
  });
});
