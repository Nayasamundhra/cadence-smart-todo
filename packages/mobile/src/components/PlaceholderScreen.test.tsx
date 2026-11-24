import { screen } from '@testing-library/react-native';
import { palette } from '@/design';
import { renderThemed, SCHEMES } from '@/test/renderThemed';
import { PlaceholderScreen } from './PlaceholderScreen';

describe.each(SCHEMES)('PlaceholderScreen in the %s theme', (scheme) => {
  it('renders its name as a header and exposes a stable test id', async () => {
    // Testing Library 14: render is async and must be awaited.
    await renderThemed(<PlaceholderScreen name="Today" />, scheme);
    expect(screen.getByRole('header', { name: 'Today' })).toBeTruthy();
    expect(screen.getByTestId('screen-today')).toBeTruthy();
  });

  it('sits on the theme background', async () => {
    await renderThemed(<PlaceholderScreen name="Today" />, scheme);
    expect(screen.getByTestId('screen-today')).toHaveStyle({ backgroundColor: palette[scheme].bg });
  });
});
