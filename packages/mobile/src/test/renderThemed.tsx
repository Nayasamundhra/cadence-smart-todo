import type { ReactElement } from 'react';
import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/design';
import { storage } from '@/services/storage';
import type { Scheme } from '@/design';

export const SCHEMES: Scheme[] = ['light', 'dark'];

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

/**
 * Renders a component inside the real ThemeProvider with the given scheme forced through the
 * persisted preference (the same path a user's choice takes). Testing Library 14: render is async.
 */
export async function renderThemed(ui: ReactElement, scheme: Scheme = 'light') {
  storage.setString('theme.preference', scheme);
  return render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}
