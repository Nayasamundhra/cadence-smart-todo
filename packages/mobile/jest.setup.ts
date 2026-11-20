/**
 * Unit tests must not load the real monitoring/analytics SDKs: they ship ESM + native modules that
 * Jest cannot run, and tests should never send events. Both are mocked at the package boundary.
 * The wrappers in src/services are still exercised (they are the code under test).
 */
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  wrap: <T>(component: T): T => component,
  captureException: jest.fn(),
}));

jest.mock('posthog-react-native', () => ({
  PostHogProvider: ({ children }: { children: unknown }) => children,
}));
