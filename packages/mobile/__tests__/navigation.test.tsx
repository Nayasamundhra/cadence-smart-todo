import { renderRouter, screen, testRouter } from 'expo-router/testing-library';

/**
 * Renders the real ./app route tree (not a fixture) and checks the Phase 0 navigation skeleton:
 * the entry redirects to Today and all five primary tabs are reachable.
 */
const TABS = [
  { label: 'Today', path: '/today', testId: 'screen-today' },
  { label: 'Browse', path: '/browse', testId: 'screen-browse' },
  { label: 'Calendar', path: '/calendar', testId: 'screen-calendar' },
  { label: 'Progress', path: '/progress', testId: 'screen-progress' },
  { label: 'Assistant', path: '/assistant', testId: 'screen-assistant' },
] as const;

// The first renderRouter call imports the whole route tree (design system, sheets, icons), which takes
// several seconds on a cold Jest cache, e.g. on a fresh CI runner. The default 5 s is too tight.
jest.setTimeout(60_000);

describe('navigation skeleton', () => {
  it('opens on Today from the entry route', async () => {
    await renderRouter('./app');
    expect(screen).toHavePathname('/today');
    expect(screen.getByTestId('screen-today')).toBeTruthy();
  });

  it.each(TABS)('reaches $label', async ({ path, testId }) => {
    await renderRouter('./app');
    await testRouter.navigate(path);
    expect(screen).toHavePathname(path);
    expect(screen.getByTestId(testId)).toBeTruthy();
  });
});
