import { Appearance, Text as RNText } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { ThemeProvider, useTheme, useThemePreference } from './ThemeProvider';
import { palette } from './tokens';
import { storage } from '@/services/storage';

// useColorScheme reads RN's internal binding, so spying on Appearance.getColorScheme would not reach
// it. Mocking the hook's module is the reliable seam for "what the OS says".
let mockSystemScheme: 'light' | 'dark' = 'light';
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: () => mockSystemScheme,
}));

function Probe() {
  const theme = useTheme();
  const { preference, setPreference } = useThemePreference();
  return (
    <>
      <RNText testID="scheme">{theme.scheme}</RNText>
      <RNText testID="preference">{preference}</RNText>
      <RNText testID="bg">{theme.colors.bg}</RNText>
      <RNText testID="dark" onPress={() => setPreference('dark')}>
        dark
      </RNText>
      <RNText testID="light" onPress={() => setPreference('light')}>
        light
      </RNText>
      <RNText testID="system" onPress={() => setPreference('system')}>
        system
      </RNText>
    </>
  );
}

const text = (id: string) => screen.getByTestId(id).props.children;

describe('ThemeProvider', () => {
  beforeEach(() => {
    storage.remove('theme.preference');
    mockSystemScheme = 'light';
    jest.restoreAllMocks();
  });

  it('defaults to following the system and resolves its light scheme', async () => {
    await render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(text('preference')).toBe('system');
    expect(text('scheme')).toBe('light');
    expect(text('bg')).toBe(palette.light.bg);
  });

  it('follows a dark system scheme when the preference is system', async () => {
    mockSystemScheme = 'dark';
    await render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(text('scheme')).toBe('dark');
    expect(text('bg')).toBe(palette.dark.bg);
  });

  it('switches instantly when the user picks a scheme, whatever the system says', async () => {
    await render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    await fireEvent.press(screen.getByTestId('dark'));
    expect(text('scheme')).toBe('dark');
    expect(text('preference')).toBe('dark');
    await fireEvent.press(screen.getByTestId('light'));
    expect(text('scheme')).toBe('light');
  });

  it('persists the choice and restores it on the next start', async () => {
    const first = await render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    await fireEvent.press(screen.getByTestId('dark'));
    expect(storage.getString('theme.preference')).toBe('dark');
    await act(async () => first.unmount());

    // A new provider (a fresh app start) reads the stored value synchronously: no flash of light.
    await render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(text('preference')).toBe('dark');
    expect(text('scheme')).toBe('dark');
  });

  it('ignores a corrupt stored value and falls back to system', async () => {
    storage.setString('theme.preference', 'purple');
    await render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(text('preference')).toBe('system');
  });

  it('asks the OS to follow the choice, and to reset for system', async () => {
    const setColorScheme = jest.spyOn(Appearance, 'setColorScheme').mockImplementation(() => {});
    await render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(setColorScheme).toHaveBeenLastCalledWith('auto');
    await fireEvent.press(screen.getByTestId('dark'));
    expect(setColorScheme).toHaveBeenLastCalledWith('dark');
    await fireEvent.press(screen.getByTestId('system'));
    expect(setColorScheme).toHaveBeenLastCalledWith('auto');
  });

  it('throws a clear error when used outside the provider', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(render(<Probe />)).rejects.toThrow('useTheme must be used inside <ThemeProvider>');
  });
});
