import { contrastRatio } from './contrast';
import { palette, swatches, type Scheme } from './tokens';

const SCHEMES: Scheme[] = ['light', 'dark'];
const AA_TEXT = 4.5;
const AA_NON_TEXT = 3;

describe('contrast helper', () => {
  it('returns 21 for black on white and 1 for identical colours', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 5);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#1F6F5C', '#F7F6F2')).toBeCloseTo(
      contrastRatio('#F7F6F2', '#1F6F5C'),
      10,
    );
  });

  it('rejects anything that is not a 6-digit hex colour', () => {
    expect(() => contrastRatio('rgba(0,0,0,0.4)', '#FFFFFF')).toThrow();
  });
});

describe.each(SCHEMES)('%s palette: text colours (WCAG AA 4.5:1)', (scheme) => {
  const p = palette[scheme];
  const softOf = {
    info: p.infoSoft,
    warning: p.warningSoft,
    danger: p.dangerSoft,
    success: p.successSoft,
  };

  const pairs: [string, string, string][] = [
    ['text on bg', p.text, p.bg],
    ['text on surface', p.text, p.surface],
    ['text on surfaceAlt', p.text, p.surfaceAlt],
    ['textSecondary on bg', p.textSecondary, p.bg],
    ['textSecondary on surface', p.textSecondary, p.surface],
    ['textSecondary on surfaceAlt', p.textSecondary, p.surfaceAlt],
    // textTertiary is not used for essential text on surfaceAlt (doc 02: 4.27 in light), so it is not listed there.
    ['textTertiary on bg', p.textTertiary, p.bg],
    ['textTertiary on surface', p.textTertiary, p.surface],
    ['accent on bg', p.accent, p.bg],
    ['accent on surface', p.accent, p.surface],
    ['accent on accentSoft', p.accent, p.accentSoft],
    ['onAccent on accent', p.onAccent, p.accent],
    ['text on accentSoft', p.text, p.accentSoft],
    // Button "danger": label drawn in `surface` on the danger fill.
    ['surface on danger', p.surface, p.danger],
    // Snackbar: inverted bar (text as fill) with bg-coloured message and accentSoft action.
    ['bg on text', p.bg, p.text],
    ['accentSoft on text', p.accentSoft, p.text],
    ...(['info', 'warning', 'danger', 'success'] as const).flatMap((tone) => [
      [`${tone} on bg`, p[tone], p.bg] as [string, string, string],
      [`${tone} on surface`, p[tone], p.surface] as [string, string, string],
      [`${tone} on ${tone}Soft (Banner action)`, p[tone], softOf[tone]] as [string, string, string],
      [`text on ${tone}Soft (Banner message)`, p.text, softOf[tone]] as [string, string, string],
    ]),
  ];

  it.each(pairs)('%s', (_name, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(AA_TEXT);
  });
});

describe.each(SCHEMES)('%s palette: priority colours (WCAG non-text 3:1)', (scheme) => {
  const p = palette[scheme];
  // Priority 0 (none) deliberately uses borderStrong, a quiet ring. See the note below.
  it.each([1, 2, 3, 4] as const)('priority %i ring on bg and surface', (level) => {
    expect(contrastRatio(p.priority[level], p.bg)).toBeGreaterThanOrEqual(AA_NON_TEXT);
    expect(contrastRatio(p.priority[level], p.surface)).toBeGreaterThanOrEqual(AA_NON_TEXT);
  });
});

/**
 * Known gap, recorded rather than hidden: `borderStrong` (priority-none checkbox ring, input borders)
 * is about 1.5:1 against `bg` in light and 1.9:1 in dark, below the 3:1 WCAG 2.x asks of the
 * boundary of an interactive control. It is the blueprint's value (doc 02 section 2.2), so it is not
 * changed here; the product owner decides. This test pins the current value so a change is noticed.
 */
describe('borderStrong against bg (known gap, see doc 02)', () => {
  it.each(SCHEMES)('%s is below 3:1', (scheme) => {
    const ratio = contrastRatio(palette[scheme].borderStrong, palette[scheme].bg);
    expect(ratio).toBeLessThan(AA_NON_TEXT);
    expect(ratio).toBeGreaterThan(1);
  });
});

describe.each(SCHEMES)('%s swatches (WCAG AA 4.5:1 on bg and surface)', (scheme) => {
  const p = palette[scheme];
  it.each(Object.entries(swatches))('%s', (_key, colours) => {
    expect(contrastRatio(colours[scheme], p.bg)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrastRatio(colours[scheme], p.surface)).toBeGreaterThanOrEqual(AA_TEXT);
  });
});

/** The "Verified contrast" table in doc 02 section 2.2 must stay true. */
describe('doc 02 verified-contrast table', () => {
  const light = palette.light;
  const dark = palette.dark;
  const rows: [string, number, number][] = [
    ['text on bg light', contrastRatio(light.text, light.bg), 15.96],
    ['text on bg dark', contrastRatio(dark.text, dark.bg), 16.61],
    ['textSecondary on bg light', contrastRatio(light.textSecondary, light.bg), 6.19],
    ['textSecondary on bg dark', contrastRatio(dark.textSecondary, dark.bg), 7.79],
    ['textTertiary on bg light', contrastRatio(light.textTertiary, light.bg), 4.58],
    ['textTertiary on surface dark', contrastRatio(dark.textTertiary, dark.surface), 5.2],
    ['accent on bg light', contrastRatio(light.accent, light.bg), 5.57],
    ['accent on bg dark', contrastRatio(dark.accent, dark.bg), 8.73],
    ['onAccent on accent light', contrastRatio(light.onAccent, light.accent), 6.02],
    ['onAccent on accent dark', contrastRatio(dark.onAccent, dark.accent), 7.95],
    ['accent on accentSoft light', contrastRatio(light.accent, light.accentSoft), 5.15],
    ['accent on accentSoft dark', contrastRatio(dark.accent, dark.accentSoft), 6.53],
    ['textTertiary on surfaceAlt light', contrastRatio(light.textTertiary, light.surfaceAlt), 4.27],
  ];
  it.each(rows)('%s', (_name, actual, documented) => {
    expect(actual).toBeCloseTo(documented, 1);
  });
});
