import { fireEvent, screen } from '@testing-library/react-native';
import { palette } from '@/design';
import { SnackbarProvider } from '@/components/ui';
import * as ui from '@/components/ui';
import { renderThemed, SCHEMES } from '@/test/renderThemed';
import { GALLERY_COVERS, GalleryScreen } from './GalleryScreen';

const renderGallery = (scheme: 'light' | 'dark') =>
  renderThemed(
    <SnackbarProvider>
      <GalleryScreen />
    </SnackbarProvider>,
    scheme,
  );

describe.each(SCHEMES)('design gallery in the %s theme', (scheme) => {
  it('renders on the theme background with its title and theme control', async () => {
    await renderGallery(scheme);
    expect(screen.getByTestId('gallery')).toHaveStyle({ backgroundColor: palette[scheme].bg });
    expect(screen.getByRole('header', { name: 'Design gallery' })).toBeTruthy();
    expect(screen.getByLabelText('Theme')).toBeTruthy();
  });

  it('shows every section', async () => {
    await renderGallery(scheme);
    for (const title of [
      'Text',
      'Button',
      'IconButton',
      'Input',
      'Chip',
      'Checkbox',
      'Card',
      'Sheet, Dialog, Snackbar',
      'SegmentedControl, Switch, Slider',
      'Skeleton',
      'EmptyState, ErrorState',
      'Banner',
      'ProgressRing, ProgressBar',
      'Avatar, ListHeader, Spark',
      'Swatches',
    ]) {
      expect(screen.getByRole('header', { name: title })).toBeTruthy();
    }
  });

  it('shows the states that are hard to reach by interaction', async () => {
    await renderGallery(scheme);
    // Loading and disabled buttons, an input in error, banners of every tone, empty and error states.
    expect(screen.getAllByRole('button', { name: 'Loading' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Disabled' }).length).toBeGreaterThan(0);
    expect(screen.getByText('Enter at least 2 characters.')).toBeTruthy();
    expect(screen.getByText('Your changes are saved on this device.')).toBeTruthy();
    expect(screen.getByText("You're offline. AI needs a connection.")).toBeTruthy();
    expect(screen.getByText('Notifications are turned off.')).toBeTruthy();
    expect(screen.getByText('Nothing due today')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeTruthy();
    // All five priorities and all ten swatches.
    expect(screen.getAllByRole('checkbox').length).toBeGreaterThanOrEqual(9);
    expect(screen.getAllByLabelText(/ swatch$/)).toHaveLength(10);
  });
});

describe('design gallery theme control', () => {
  it('switches theme instantly from the gallery', async () => {
    await renderGallery('light');
    expect(screen.getByTestId('gallery')).toHaveStyle({ backgroundColor: palette.light.bg });
    await fireEvent.press(screen.getByTestId('gallery-theme-dark'));
    expect(screen.getByTestId('gallery')).toHaveStyle({ backgroundColor: palette.dark.bg });
    await fireEvent.press(screen.getByTestId('gallery-theme-light'));
    expect(screen.getByTestId('gallery')).toHaveStyle({ backgroundColor: palette.light.bg });
  });

  it('opens its dialog and sheet samples', async () => {
    await renderGallery('light');
    await fireEvent.press(screen.getByRole('button', { name: 'Open dialog' }));
    expect(screen.getByRole('header', { name: 'Delete this task?' })).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Show snackbar' }));
    expect(screen.getByText('Task completed')).toBeTruthy();
  });
});

describe('gallery is current (doc 09 module DoD: "gallery current")', () => {
  // The snackbar provider and hook are app plumbing; the presentational Snackbar is what is shown.
  const plumbing = new Set(['SnackbarProvider', 'useSnackbar']);
  const components = Object.keys(ui)
    .filter((name) => /^[A-Z]/.test(name) && !plumbing.has(name))
    .sort();

  it('lists every component the ui index exports, and nothing else', () => {
    expect([...GALLERY_COVERS].sort()).toEqual(components);
  });
});
