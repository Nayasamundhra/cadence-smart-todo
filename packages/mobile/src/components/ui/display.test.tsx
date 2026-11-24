import { Inbox } from '@/design/icons/lucide';
import { fireEvent, screen } from '@testing-library/react-native';
import { fontFamily, palette, Spark, typography, type TextVariant } from '@/design';
import { renderThemed, SCHEMES } from '@/test/renderThemed';
import {
  Avatar,
  Banner,
  Card,
  EmptyState,
  ErrorState,
  ListHeader,
  ProgressBar,
  ProgressRing,
  Skeleton,
  Text,
} from '.';

describe.each(SCHEMES)('display components in the %s theme', (scheme) => {
  const colors = palette[scheme];

  describe('Text', () => {
    it.each(Object.keys(typography) as TextVariant[])(
      '%s uses its family, size, line height and font scaling cap',
      async (variant) => {
        await renderThemed(<Text variant={variant}>Sample</Text>, scheme);
        const spec = typography[variant];
        const node = screen.getByText('Sample');
        expect(node).toHaveStyle({
          fontFamily: fontFamily[spec.family],
          fontSize: spec.size,
          lineHeight: spec.lineHeight,
        });
        expect(node.props.allowFontScaling).toBe(true);
        expect(node.props.maxFontSizeMultiplier).toBe(spec.maxFontSizeMultiplier);
      },
    );

    it('caps display and serif titles at 1.4x and body text at 2x (doc 02 section 2.3)', () => {
      expect(typography.display.maxFontSizeMultiplier).toBe(1.4);
      expect(typography.emptyTitle.maxFontSizeMultiplier).toBe(1.4);
      expect(typography.body.maxFontSizeMultiplier).toBe(2);
    });

    it('uses the serif only for display roles', () => {
      const serif = (Object.keys(typography) as TextVariant[]).filter(
        (v) => typography[v].family === 'display',
      );
      expect(serif.sort()).toEqual(['display', 'emptyTitle']);
    });

    it('defaults to the body variant in the text colour', async () => {
      await renderThemed(<Text>Hello</Text>, scheme);
      expect(screen.getByText('Hello')).toHaveStyle({ color: colors.text, fontSize: 16 });
    });

    it('applies a colour token', async () => {
      await renderThemed(<Text color="danger">Oops</Text>, scheme);
      expect(screen.getByText('Oops')).toHaveStyle({ color: colors.danger });
    });

    it('uppercases overlines and uses tabular numerals for stats', async () => {
      await renderThemed(
        <>
          <Text variant="overline">Overdue</Text>
          <Text variant="stat">1,284</Text>
        </>,
        scheme,
      );
      expect(screen.getByText('Overdue')).toHaveStyle({
        textTransform: 'uppercase',
        letterSpacing: 0.6,
      });
      expect(screen.getByText('1,284')).toHaveStyle({ fontVariant: ['tabular-nums'] });
    });

    it('lets a caller tighten the scaling cap (tab bar labels use 1.4)', async () => {
      await renderThemed(
        <Text variant="caption" maxFontSizeMultiplier={1.4}>
          Today
        </Text>,
        scheme,
      );
      expect(screen.getByText('Today').props.maxFontSizeMultiplier).toBe(1.4);
    });
  });

  describe('Card', () => {
    it('is a surface with a hairline border and 16 padding', async () => {
      await renderThemed(<Card testID="card" />, scheme);
      expect(screen.getByTestId('card')).toHaveStyle({
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        padding: 16,
        borderRadius: 16,
      });
    });

    it('adds a shadow only in the light theme', async () => {
      await renderThemed(<Card testID="card" elevated />, scheme);
      const card = screen.getByTestId('card');
      if (scheme === 'light') expect(card).toHaveStyle({ shadowOpacity: 0.04 });
      else
        expect(
          card.props.style.flat?.(Infinity).some((s: object) => 'shadowOpacity' in (s ?? {})),
        ).toBe(false);
    });
  });

  describe('Skeleton', () => {
    it('is hidden from screen readers and uses the surfaceAlt fill', async () => {
      await renderThemed(<Skeleton height={16} />, scheme);
      const json = JSON.stringify(screen.toJSON());
      expect(json).toContain(colors.surfaceAlt);
      expect(json).toContain('"accessibilityElementsHidden":true');
      expect(json).toContain('no-hide-descendants');
    });
  });

  describe('EmptyState', () => {
    it('shows a header, a sentence and one primary action', async () => {
      const onPress = jest.fn();
      await renderThemed(
        <EmptyState
          icon={Inbox}
          title="Nothing due today"
          message="Add a task to get started."
          action={{ label: 'Add task', onPress }}
        />,
        scheme,
      );
      expect(screen.getByRole('header', { name: 'Nothing due today' })).toBeTruthy();
      expect(screen.getByText('Add a task to get started.')).toBeTruthy();
      await fireEvent.press(screen.getByRole('button', { name: 'Add task' }));
      expect(onPress).toHaveBeenCalled();
    });

    it('titles are in the serif at 24', async () => {
      await renderThemed(<EmptyState icon={Inbox} title="Clear" message="All done." />, scheme);
      expect(screen.getByText('Clear')).toHaveStyle({
        fontFamily: fontFamily.display,
        fontSize: 24,
      });
    });

    it('has no button without an action', async () => {
      await renderThemed(<EmptyState icon={Inbox} title="Clear" message="All done." />, scheme);
      expect(screen.queryByRole('button')).toBeNull();
    });
  });

  describe('ErrorState', () => {
    it('is an alert that says what failed and offers Try again', async () => {
      const onRetry = jest.fn();
      await renderThemed(
        <ErrorState message="Couldn't load your report. Try again." onRetry={onRetry} />,
        scheme,
      );
      expect(screen.getByRole('alert')).toBeTruthy();
      expect(screen.getByText("Couldn't load your report. Try again.")).toBeTruthy();
      await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
      expect(onRetry).toHaveBeenCalled();
    });
  });

  describe('Banner', () => {
    it.each([
      ['info', colors.infoSoft],
      ['warning', colors.warningSoft],
      ['danger', colors.dangerSoft],
    ] as const)('%s tone uses its soft fill', async (tone, fill) => {
      await renderThemed(<Banner tone={tone} message="Heads up" testID="banner" />, scheme);
      expect(screen.getByTestId('banner')).toHaveStyle({ backgroundColor: fill });
      expect(screen.getByText('Heads up')).toBeTruthy();
    });

    it('only the danger tone is announced as an alert', async () => {
      await renderThemed(
        <>
          <Banner tone="info" message="Info" testID="info" />
          <Banner tone="danger" message="Danger" testID="danger" />
        </>,
        scheme,
      );
      expect(screen.getAllByRole('alert')).toHaveLength(1);
      expect(screen.getByRole('alert')).toHaveTextContent('Danger');
    });

    it('runs its action', async () => {
      const onPress = jest.fn();
      await renderThemed(
        <Banner
          tone="warning"
          message="Notifications are off."
          action={{ label: 'Open Settings', onPress }}
        />,
        scheme,
      );
      await fireEvent.press(screen.getByRole('button', { name: 'Open Settings' }));
      expect(onPress).toHaveBeenCalled();
    });
  });

  describe('ProgressRing', () => {
    it('is a progressbar with a label and a 0-100 value', async () => {
      await renderThemed(
        <ProgressRing progress={0.6} accessibilityLabel="Goal progress" testID="ring" />,
        scheme,
      );
      const ring = screen.getByRole('progressbar', { name: 'Goal progress' });
      expect(ring.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 60 });
    });

    it.each([20, 40, 72, 120] as const)('size %i', async (size) => {
      await renderThemed(
        <ProgressRing progress={0.5} size={size} accessibilityLabel="Ring" />,
        scheme,
      );
      expect(screen.getByRole('progressbar')).toHaveStyle({ width: size, height: size });
    });

    it.each([
      [-1, 0],
      [2, 100],
      [0.255, 26],
    ])('clamps and rounds progress %d to %d percent', async (input, expected) => {
      await renderThemed(<ProgressRing progress={input} accessibilityLabel="Ring" />, scheme);
      expect(screen.getByRole('progressbar').props.accessibilityValue.now).toBe(expected);
    });

    it('shows a centre label', async () => {
      await renderThemed(
        <ProgressRing progress={1} size={72} accessibilityLabel="Ring">
          <Text>Done</Text>
        </ProgressRing>,
        scheme,
      );
      expect(screen.getByText('Done')).toBeTruthy();
    });
  });

  describe('ProgressBar', () => {
    it('is 6 high, fully rounded and exposes its value', async () => {
      await renderThemed(<ProgressBar progress={0.5} accessibilityLabel="Milestones" />, scheme);
      const bar = screen.getByRole('progressbar', { name: 'Milestones' });
      expect(bar).toHaveStyle({ height: 6, borderRadius: 999, backgroundColor: colors.border });
      expect(bar.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 50 });
    });

    it('clamps out-of-range progress', async () => {
      await renderThemed(<ProgressBar progress={7} accessibilityLabel="Bar" />, scheme);
      expect(screen.getByRole('progressbar').props.accessibilityValue.now).toBe(100);
    });
  });

  describe('Avatar', () => {
    it.each([
      ['Ada Lovelace', 'AL'],
      ['grace brewster murray hopper', 'GH'],
      ['Single', 'S'],
      ['  ', ''],
    ])('shows initials for "%s"', async (name, initials) => {
      await renderThemed(<Avatar name={name} />, scheme);
      if (initials) expect(screen.getByText(initials)).toBeTruthy();
      expect(screen.getByRole('image', { name })).toBeTruthy();
    });

    it.each([
      ['sm', 32],
      ['lg', 64],
    ] as const)('size %s is %i', async (size, dimension) => {
      await renderThemed(<Avatar name="Ada Lovelace" size={size} />, scheme);
      expect(screen.getByRole('image')).toHaveStyle({
        width: dimension,
        height: dimension,
        backgroundColor: colors.accentSoft,
      });
    });
  });

  describe('ListHeader', () => {
    it('is a header whose label includes the count', async () => {
      await renderThemed(<ListHeader title="Overdue" count={3} />, scheme);
      expect(screen.getByRole('header', { name: 'Overdue, 3' })).toBeTruthy();
    });

    it('is a plain header without a count and runs its action', async () => {
      const onPress = jest.fn();
      await renderThemed(
        <ListHeader title="Today" action={{ label: 'Reschedule', onPress }} />,
        scheme,
      );
      expect(screen.getByRole('header', { name: 'Today' })).toBeTruthy();
      await fireEvent.press(screen.getByRole('button', { name: 'Reschedule' }));
      expect(onPress).toHaveBeenCalled();
    });

    it('has 32 above and 8 below', async () => {
      await renderThemed(<ListHeader title="Today" testID="header" />, scheme);
      expect(screen.getByTestId('header')).toHaveStyle({ paddingTop: 32, paddingBottom: 8 });
    });
  });

  describe('Spark', () => {
    it('renders in the accent colour and is hidden from screen readers', async () => {
      await renderThemed(<Spark color={colors.accent} />, scheme);
      const json = JSON.stringify(screen.toJSON());
      // react-native-svg stores colours as 0xAARRGGBB integers.
      const argb = parseInt(`FF${colors.accent.slice(1)}`, 16);
      expect(json).toContain(`"payload":${argb}`);
      expect(json).toContain('"accessibilityElementsHidden":true');
    });
  });
});
