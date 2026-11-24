import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { storage } from '@/services/storage';
import {
  darkTheme,
  isThemePreference,
  lightTheme,
  type Theme,
  type ThemePreference,
} from './theme';

const PREFERENCE_KEY = 'theme.preference';

interface ThemeContextValue {
  theme: Theme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readPreference(): ThemePreference {
  const stored = storage.getString(PREFERENCE_KEY);
  return isThemePreference(stored) ? stored : 'system';
}

/** Makes native chrome (keyboard, Switch, system dialogs) follow the in-app choice, not just the OS. */
function applyNativeScheme(preference: ThemePreference): void {
  Appearance.setColorScheme(preference === 'system' ? 'auto' : preference);
}

/**
 * Provides the resolved theme. The preference (system, light or dark) is persisted in MMKV and read
 * synchronously, so the first frame is already in the right scheme. Changing it is instant.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(readPreference);
  const systemScheme = useColorScheme();

  // The OS value is still reported when an override is set on some platforms, so resolve explicitly.
  const scheme = preference === 'system' ? (systemScheme ?? 'light') : preference;

  useEffect(() => {
    applyNativeScheme(preference);
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => {
    storage.setString(PREFERENCE_KEY, next);
    setPreferenceState(next);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: scheme === 'dark' ? darkTheme : lightTheme,
      preference,
      setPreference,
    }),
    [scheme, preference, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside <ThemeProvider>.');
  return context;
}

/** The resolved theme: colours, spacing, type and motion tokens for the current scheme. */
export function useTheme(): Theme {
  return useThemeContext().theme;
}

/** The user's choice (system, light, dark) and its setter, for the Appearance settings screen. */
export function useThemePreference(): Pick<ThemeContextValue, 'preference' | 'setPreference'> {
  const { preference, setPreference } = useThemeContext();
  return { preference, setPreference };
}
