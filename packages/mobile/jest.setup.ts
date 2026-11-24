import 'react-native-gesture-handler/jestSetup';

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

/**
 * Native modules added in Phase 1. Each is mocked at the package boundary with the library's own
 * test support where it ships one, so components still run for real.
 */
jest.mock('react-native-reanimated', () => jest.requireActual('react-native-reanimated/mock'));
jest.mock('@gorhom/bottom-sheet', () => jest.requireActual('@gorhom/bottom-sheet/mock'));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

// react-native-mmkv pulls in Nitro modules (ESM + native). Tests use a plain in-memory store with the
// same method names; src/services/storage.ts is still the code under test.
jest.mock('react-native-mmkv', () => ({
  createMMKV: () => {
    const map = new Map<string, string | boolean | number>();
    return {
      getString: (key: string) => {
        const value = map.get(key);
        return typeof value === 'string' ? value : undefined;
      },
      getBoolean: (key: string) => {
        const value = map.get(key);
        return typeof value === 'boolean' ? value : undefined;
      },
      set: (key: string, value: string | boolean | number) => void map.set(key, value),
      remove: (key: string) => map.delete(key),
    };
  },
}));
