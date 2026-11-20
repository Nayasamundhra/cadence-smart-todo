import { render, screen } from '@testing-library/react-native';
import { PlaceholderScreen } from './PlaceholderScreen';

describe('PlaceholderScreen', () => {
  it('renders its name as a header and exposes a stable test id', async () => {
    // Testing Library 14: render is async and must be awaited.
    await render(<PlaceholderScreen name="Today" />);
    expect(screen.getByRole('header', { name: 'Today' })).toBeTruthy();
    expect(screen.getByTestId('screen-today')).toBeTruthy();
  });
});
