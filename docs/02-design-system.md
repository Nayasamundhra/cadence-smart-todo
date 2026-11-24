# 2. Design System

## 2.1 Direction

**Paper and ink, one green.** Warm off-white surfaces, near-black text, a single pine-green accent.
Depth comes from hairline borders and one soft shadow level, not from gradients. A serif appears in
exactly one role (large dates and greetings) to give the product a voice; everything else is one sans.

What this rules out: purple/blue AI gradients, glassmorphism, glowing sparkle effects, coloured card
backgrounds, more than one accent, drop shadows on list rows, emoji as icons.

How AI is marked: a small four-point "spark" glyph in the accent colour and the `accentSoft` surface.
Nothing else. AI surfaces use the same cards, type and spacing as the rest of the app.

## 2.2 Tokens

Implement as `packages/mobile/src/design/tokens.ts`. Screens consume them through `useTheme()`.

```ts
export const palette = {
  light: {
    bg: '#F7F6F2', // screen background
    surface: '#FFFFFF', // cards, sheets, inputs
    surfaceAlt: '#F0EEE8', // pressed rows, chips, skeleton base, grouped headers
    border: '#E4E1D8', // hairlines, card borders
    borderStrong: '#CFCBBF', // input borders, checkbox ring (priority none)
    text: '#1B1B18',
    textSecondary: '#5E5C55',
    textTertiary: '#737067', // placeholders, metadata. Do not use on surfaceAlt for essential text
    accent: '#1F6F5C',
    onAccent: '#FFFFFF',
    accentSoft: '#E3F0EC', // AI surfaces, selected chips, today cell
    danger: '#B93636',
    dangerSoft: '#F8E7E5',
    warning: '#9C5606',
    warningSoft: '#F7ECD9',
    info: '#2A62B3',
    infoSoft: '#E4EDF9',
    success: '#27724A',
    successSoft: '#E2F1E8',
    overlay: 'rgba(20,20,18,0.40)', // behind sheets and dialogs
    priority: { 0: '#CFCBBF', 1: '#6E6B62', 2: '#2A62B3', 3: '#9C5606', 4: '#B93636' },
  },
  dark: {
    bg: '#111210',
    surface: '#1A1B18',
    surfaceAlt: '#232420',
    border: '#2E2F2A',
    borderStrong: '#42433D',
    text: '#F2F1EC',
    textSecondary: '#A9A79E',
    textTertiary: '#8F8D84',
    accent: '#5FC2A6',
    onAccent: '#0C1F1A',
    accentSoft: '#17302A',
    danger: '#EF7A74',
    dangerSoft: '#3A1F1D',
    warning: '#E5A04A',
    warningSoft: '#35281A',
    info: '#7FB0F0',
    infoSoft: '#1B2A3D',
    success: '#6CC48D',
    successSoft: '#1A3024',
    overlay: 'rgba(0,0,0,0.60)',
    priority: { 0: '#42433D', 1: '#8F8D84', 2: '#7FB0F0', 3: '#E5A04A', 4: '#EF7A74' },
  },
} as const;

// User-assignable colours for projects, tags, categories, habits, goals.
// Stored in the DB as the key ('moss'), never as hex, so both themes can render it.
export const swatches = {
  moss: { light: '#4C7B48', dark: '#8DBF88' }, // light adjusted from #4E7D4A in Phase 1 (4.46 -> 4.59 on bg)
  teal: { light: '#1F7A7A', dark: '#6CC7C7' },
  sky: { light: '#2F74B5', dark: '#82B8EC' },
  indigo: { light: '#4B55B8', dark: '#9AA2F0' },
  plum: { light: '#8A4A9E', dark: '#CE9BE0' },
  rose: { light: '#B5476A', dark: '#EE94B0' },
  brick: { light: '#B04A32', dark: '#EE9580' },
  amber: { light: '#9A6508', dark: '#E3B25C' },
  olive: { light: '#6B6F1E', dark: '#BFC46E' },
  slate: { light: '#55606E', dark: '#A3AEBC' },
} as const;

export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 } as const;
export const hairline = 1; // use StyleSheet.hairlineWidth for list separators only

export const elevation = {
  none: {},
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  float: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
} as const;
// card: optional on cards over bg in light theme. float: FAB, sheets, snackbar, drag-lifted item.
// In dark theme use borders only; shadows are not visible and are omitted.

export const motion = {
  duration: { instant: 90, fast: 160, base: 240, slow: 360 },
  spring: { gentle: { damping: 20, stiffness: 180 }, snappy: { damping: 18, stiffness: 320 } },
  // easing: standard = cubic-bezier(0.2, 0, 0, 1); exit = cubic-bezier(0.4, 0, 1, 1)
} as const;

export const layout = {
  screenPadding: 20,
  maxContentWidth: 640,
  tabBarHeight: 56,
  rowMinHeight: 52,
  touchMin: 44,
  fabSize: 56,
  tabletBreakpoint: 768,
} as const;
```

### Verified contrast (WCAG 2.x ratio)

| Pair                  | Light | Dark                |
| --------------------- | ----- | ------------------- |
| text on bg            | 15.96 | 16.61               |
| textSecondary on bg   | 6.19  | 7.79                |
| textTertiary on bg    | 4.58  | — (5.20 on surface) |
| accent on bg          | 5.57  | 8.73                |
| onAccent on accent    | 6.02  | 7.95                |
| accent on accentSoft  | 5.15  | 6.53                |
| danger on bg          | 5.33  | 6.35 (on surface)   |
| warning on bg         | 5.18  | 7.79 (on surface)   |
| info on surfaceAlt    | 5.18  | 7.72 (on surface)   |
| success on surfaceAlt | 5.04  | 8.17 (on surface)   |

Light `textTertiary` on `surfaceAlt` is 4.27 — below 4.5, so it must not carry essential text there.
Phase 1 added the contrast tests (`src/design/contrast.test.ts`). Every swatch is now asserted ≥ 4.5 on
`bg` and `surface` in both themes, as is every text pairing the components use (including each tone on
its `*Soft` fill). One swatch failed and was adjusted: light `moss` `#4E7D4A` was 4.46 on `bg`; it is now
`#4C7B48` (4.59 on `bg`, 4.96 on `surface`). The table above is also asserted, so it cannot drift.

**Known gap, for the product owner:** `borderStrong` (the priority-none checkbox ring and input borders) is
1.50:1 against `bg` in light and 1.88:1 in dark. WCAG 2.x asks 3:1 for the boundary of an interactive
control, so these fail that criterion. It is the blueprint's value and has not been changed; the test pins
it so any change is noticed. Priorities 1–4 all pass 3:1.

## 2.3 Typography

- **UI:** Inter (400, 500, 600). Tabular numerals for counts, times and stats.
- **Display:** Instrument Serif (400) — only for the Today date header, onboarding headlines, report
  titles and empty-state titles. Never for controls or body text.
- Load with `expo-font`. Confirmed in Phase 1: both families exist as `@expo-google-fonts/inter` (0.4.2) and
  `@expo-google-fonts/instrument-serif` (0.4.1) and are bundled with the app (no network at run time).

| Token      | Family           | Size / line | Weight                              | Use                             |
| ---------- | ---------------- | ----------- | ----------------------------------- | ------------------------------- |
| display    | Instrument Serif | 34 / 40     | 400                                 | Today date, onboarding headline |
| title1     | Inter            | 24 / 30     | 600                                 | Screen titles (large header)    |
| title2     | Inter            | 20 / 26     | 600                                 | Sheet titles, section heroes    |
| title3     | Inter            | 17 / 24     | 600                                 | Card titles, nav bar title      |
| body       | Inter            | 16 / 24     | 400                                 | Task titles, body copy          |
| bodyStrong | Inter            | 16 / 24     | 500                                 | Emphasis, buttons               |
| callout    | Inter            | 14 / 20     | 400                                 | Secondary rows, notes           |
| caption    | Inter            | 13 / 18     | 400                                 | Metadata line, chips            |
| overline   | Inter            | 12 / 16     | 600, +0.6 letter-spacing, uppercase | Group headers ("OVERDUE")       |
| stat       | Inter tabular    | 28 / 32     | 600                                 | Analytics numbers               |

Respect the OS font scale (`allowFontScaling` on, `maxFontSizeMultiplier` 2.0 for body, 1.4 for the tab
bar and `display`). Rows grow in height; nothing truncates essential content at 200 %.

## 2.4 Iconography

Lucide icons via `lucide-react-native` (confirmed: v1.77, peer `react-native-svg`). Size 20 in rows,
22 in the tab bar and headers, 16 inside chips. Stroke 1.75. Colour follows the adjacent text colour.
The AI spark is a custom SVG in `src/design/icons/Spark.tsx`.

**Import icons one by one**, through `src/design/icons/lucide.ts` (add the icon there, import it from
`@/design`). Metro does not tree-shake, and importing from the package barrel put all of Lucide in the
bundle: measured on the Android release bundle, 10.31 MB with the barrel against 7.82 MB with per-icon
imports. Tab icons: Today `CalendarCheck`, Browse `LayoutGrid`, Calendar `Calendar`, Progress
`ChartNoAxesColumn`, Assistant the Spark.

## 2.5 Motion and haptics

| Event                  | Motion                                                                     | Haptic (expo-haptics) |
| ---------------------- | -------------------------------------------------------------------------- | --------------------- |
| Complete task          | Checkbox fills (fast), title strikes through, row collapses after 400 ms   | Success notification  |
| Reopen task            | Reverse, no collapse                                                       | Light impact          |
| Swipe passes threshold | Background colour snaps to full, icon scales 1 → 1.15                      | Light impact          |
| Drag start / drop      | Item lifts to `float` elevation, scale 1.02 / settles with `snappy` spring | Medium / Light impact |
| Sheet open / close     | Spring `gentle` from bottom, overlay fades (base)                          | none                  |
| FAB press              | Scale 0.94 (instant)                                                       | Light impact          |
| Screen push            | Native stack default                                                       | none                  |
| Destructive confirm    | —                                                                          | Warning notification  |
| Error                  | Field shakes 6 px, 2 cycles (fast)                                         | Error notification    |
| Habit logged           | Ring fills (base); at streak milestones 7/30/100 a one-off ring pulse      | Success notification  |

Rules: nothing loops. Nothing animates longer than `slow`. With the OS "Reduce motion" setting on,
replace movement with a 160 ms cross-fade and drop the row-collapse delay. Haptics honour the in-app toggle.

## 2.6 Components

Inventory for `packages/mobile/src/components`. Each gets a Storybook-style gallery entry on the
dev-only `/_dev/gallery` route.

### Primitives (`components/ui`)

| Component          | Spec                                                                                                                                                                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Text`             | Props: `variant` (table above), `color` (token key). The only way to render text                                                                                                                                                              |
| `Button`           | Variants: primary (accent fill), secondary (surface + border), ghost (text only), danger. Sizes: lg 52, md 44, sm 36 high. Radius `md`. States: pressed (opacity 0.85), disabled (opacity 0.4), loading (spinner replaces label, width fixed) |
| `IconButton`       | 44×44 hit area, 22 icon, optional badge dot                                                                                                                                                                                                   |
| `Input`            | 52 high, surface fill, `borderStrong` border, radius `md`; focus = 1.5 accent border; error = danger border + caption below. Label above in caption/textSecondary                                                                             |
| `Chip`             | 32 high, radius `full`, surfaceAlt fill, caption text, optional leading icon / colour dot, optional ✕. Selected: accentSoft fill, accent text                                                                                                 |
| `Checkbox`         | 22 circle inside 44 hit area. Ring 2 px in the task's priority colour; priority 0 uses `borderStrong`. Checked: filled with ring colour, white check. Subtask variant: 18                                                                     |
| `Card`             | surface, radius `lg`, 1 px border, padding 16. No shadow in dark                                                                                                                                                                              |
| `Sheet`            | Bottom sheet wrapper: radius `xl` top corners, grabber 36×4, overlay, keyboard-aware, snap points per use                                                                                                                                     |
| `Dialog`           | Centered, max width 320, for destructive confirmation only. Everything else is a sheet                                                                                                                                                        |
| `Snackbar`         | Floats above tab bar, text + one action ("Undo"), auto-dismiss 5 s, one at a time (new replaces old)                                                                                                                                          |
| `SegmentedControl` | 36 high, surfaceAlt track, surface thumb, radius `sm`                                                                                                                                                                                         |
| `Switch`, `Slider` | Platform-native controls tinted with accent                                                                                                                                                                                                   |
| `Skeleton`         | surfaceAlt block with a 1.2 s opacity pulse (0.6 ↔ 1). Shown only for network content                                                                                                                                                         |
| `EmptyState`       | 48 line icon in textTertiary, title in Instrument Serif 24, one line of callout, optional primary action                                                                                                                                      |
| `ErrorState`       | Icon, plain sentence saying what failed, "Try again"                                                                                                                                                                                          |
| `Banner`           | Inline, full-width, soft colour fill (info/warning/danger), icon, text, optional action. Used for offline, permission denied, sync error                                                                                                      |
| `ProgressRing`     | SVG ring; sizes 20, 40, 72, 120; track `border`, fill passed colour; optional centre label                                                                                                                                                    |
| `ProgressBar`      | 6 high, radius `full`                                                                                                                                                                                                                         |
| `Avatar`           | 32 / 64, initials fallback on accentSoft                                                                                                                                                                                                      |
| `ListHeader`       | Overline text + optional count + optional action, 32 top padding, 8 bottom                                                                                                                                                                    |
| `Menu`             | Context menu (long-press / ⋯). Use the platform-native menu where available, otherwise an action sheet                                                                                                                                        |

### Domain components

| Component                                                 | Spec                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TaskRow`                                                 | Min height 52. `[Checkbox] [title, 1–2 lines][metadata line]`. Metadata (caption, textSecondary, single line, max 3 items, in this priority order): due label (danger if overdue; "Today 17:00", "Tomorrow", "Fri 12 Jun"), recurrence icon, subtask count `2/5`, project dot + name (omitted inside its own project), first tag. Trailing: attachment/comment icons only if present. Swipe right = complete (success fill). Swipe left = Schedule (info) + Delete (danger). Long-press = bulk mode. Completed: title textTertiary + strikethrough |
| `SubtaskRow`                                              | 44 high, 18 checkbox, title, drag handle in edit mode                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `QuickAddSheet`                                           | See screen 14                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `DateTimePickerSheet`                                     | Shortcuts row (Today, Tomorrow, This weekend, Next week, No date), month grid, optional time row, recurrence row, reminder row                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `PriorityPicker`                                          | Five options in a row: flag icon in priority colour + label                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `ProjectPicker`                                           | Searchable list grouped by workspace; Inbox first; "Create project" at the end                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `TagPicker`                                               | Searchable multi-select, create-on-type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `RecurrencePicker`                                        | Presets + Custom builder; shows a plain-language summary ("Every 2 weeks on Mon, Thu")                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `ProjectCard`                                             | Colour dot, icon, name, `ProgressRing` 40, "12 of 30", next due label                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `KanbanColumn`, `KanbanCard`                              | Column width = screen − 56 (peek of next column), header with name + count + ⋯. Card: title, metadata line, priority stripe 3 px on the leading edge                                                                                                                                                                                                                                                                                                                                                                                               |
| `CalendarMonth`, `WeekStrip`, `TimeGrid`, `TimeBlockView` | Time grid hour height 56. Block: project-colour 3 px leading stripe, accentSoft-style tinted fill from the project swatch at 14 % opacity, title + time. Conflict: diagonal hatch overlay in warning                                                                                                                                                                                                                                                                                                                                               |
| `HabitCard`                                               | Icon in swatch colour, name, streak ("12 days"), last-7-days dots, large check button (44) or count stepper                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `Heatmap`                                                 | 7 rows × N weeks, 12 px cells, 3 px gap, four intensity steps of the habit swatch                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `GoalCard`                                                | Title, target date, `ProgressBar`, "3 of 5 milestones"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `StatTile`                                                | Label (caption), value (`stat`), delta vs previous period with arrow, coloured success/danger only when direction is meaningful                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `ChartCard`                                               | Card with title, optional range, chart, one-sentence takeaway below                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `ChatBubble`                                              | User: accent fill, onAccent text, right. Assistant: no bubble, body text on bg with spark glyph at the top-left of the first line. Tool activity: single caption line ("Looked at 14 tasks due this week")                                                                                                                                                                                                                                                                                                                                         |
| `ProposalCard`                                            | In-chat summary of a proposal: title, "5 changes", primary "Review". After resolution shows "Applied 4 of 5" or "Dismissed"                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `ProposalItem`                                            | Checkbox + verb icon (create/update/move/delete) + before → after diff in two lines. Destructive items in a separate group with dangerSoft background                                                                                                                                                                                                                                                                                                                                                                                              |
| `SuggestionCard`                                          | accentSoft card, spark, one sentence, up to two actions, dismiss ✕                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `VoiceButton`                                             | Mic icon; recording state = accent fill with live level bars (3 bars, driven by input volume), tap to stop                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `SyncIndicator`                                           | Hidden when synced. Shows a small cloud-off icon in headers when offline, a rotating arrows icon while syncing > 1 s, a warning dot on sync error (tap → details sheet)                                                                                                                                                                                                                                                                                                                                                                            |

## 2.7 Layout rules

- Screen padding 20. Vertical rhythm in multiples of 4; gaps between cards 12; between sections 24.
- Lists are edge-to-edge rows on `bg` with inset hairline separators starting after the checkbox column;
  grouped content (settings, stats) uses `Card`.
- Headers: large title (`title1`) that collapses to `title3` in the nav bar on scroll.
- One primary action per screen. The FAB is that action on list screens; elsewhere a full-width primary
  button pinned above the safe area.
- FAB: 56, accent fill, plus icon, bottom-right, 16 above the tab bar. Present on Today, Browse and its
  lists, Calendar, Project. Not on Assistant, Progress, Settings. On Progress the header has "+".
- Bottom sheets for: quick add, pickers, filters, sort, context actions. Full screens for: details, forms
  with more than ~6 fields, AI review.
- Tablets (width ≥ 768): content max width 640 centred, except four two-pane screens (doc 3 §3.9).

## 2.8 States every screen must define

| State                                              | Treatment                                                                                                                                    |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Loading (local data)                               | None. Local queries resolve within a frame; render directly                                                                                  |
| Loading (network: AI, reports, notifications list) | Skeleton matching final layout; AI streaming shows text as it arrives                                                                        |
| Empty                                              | `EmptyState` with a specific sentence and one action (copy is given per screen in doc 3)                                                     |
| Error                                              | `ErrorState` inline, or `Snackbar` for failed actions, with retry                                                                            |
| Offline                                            | `SyncIndicator` in header; network-only features show a `Banner` ("You're offline. AI needs a connection.") and disable their primary action |
| Permission denied                                  | `Banner` with "Open Settings"                                                                                                                |

## 2.9 Accessibility

- Every interactive element has `accessibilityRole`, `accessibilityLabel`, and state
  (`checked`, `selected`, `disabled`, `expanded`).
- `TaskRow` label reads as one sentence: "Submit report, due Friday 5 PM, high priority, 2 of 5 subtasks."
  Swipe actions are exposed as `accessibilityActions` (complete, schedule, delete).
- Drag-and-drop always has a non-drag alternative: "Move up / Move down / Move to…" in the row's actions.
- Priority and status are never conveyed by colour alone: priority has a flag icon + label in details,
  overdue has the word "Overdue" in the label.
- Focus order follows visual order; sheets trap focus and return it to the trigger on close.
- Charts expose a text summary (the takeaway sentence) as their accessibility label.
- External keyboard (tablets): Tab order, Enter activates, Esc closes sheets, Cmd/Ctrl+N quick add,
  Cmd/Ctrl+F search.

## 2.10 Voice and copy

Sentence case everywhere. Buttons say what happens ("Add task", "Apply 4 changes"). Errors say what went
wrong and what to do ("Couldn't reach the server. Your changes are saved and will sync later."). No
exclamation marks, no "Oops". The assistant writes plainly and briefly, and never claims to have done
something that is still a proposal.

## 2.11 Implementation notes (Phase 1)

Where the build deviates from, or fills a gap in, the sections above, and why.

- **Extra tokens.** `tokens.ts` adds `controls` (component sizes from §2.6: button heights, chip, input,
  checkbox, icon sizes, snackbar duration and so on), `fontFamily`, `typography`, `motion.easing`, and an
  `emptyTitle` type variant (Instrument Serif 24, the `EmptyState` title the spec describes). Nothing in
  the spec's own values changed except the `moss` swatch above.
- **Danger button label.** §2.6 does not say what colour the label of a `danger` button is. It uses
  `surface` (white in light, near-black in dark): 5.76 and 6.35 against the danger fill. `onAccent` would
  be unreadable on the lighter dark-theme danger.
- **Snackbar colours.** The bar is inverted (`text` fill, `bg` message, `accentSoft` action). Both pairs
  are contrast-tested in both themes.
- **Theme.** The preference (system, light, dark) is stored in MMKV and read synchronously, so the first
  frame is already correct. `userInterfaceStyle` is `automatic` in `app.config.ts`, and the provider calls
  `Appearance.setColorScheme` so native chrome follows the in-app choice. In React Native 0.88 the reset
  value is `'auto'` (older versions used `null`).
- **Screen-reader alerts.** `role="alert"` is set on the message text of `ErrorState` and the danger
  `Banner`, not on their container: a container that holds a button must not become one accessibility
  node, or the button disappears for VoiceOver and TalkBack.
- **Menu.** `@react-native-menu/menu` gives a native menu on both platforms, so no action-sheet fallback was
  needed. Menu rows are text-only: its icons are SF Symbol and Android drawable names, which do not match
  Lucide.
- **Gallery.** `/_dev/gallery` (dev builds only, redirects in production). The theme control at the top
  switches System / Light / Dark live. `GALLERY_COVERS` is compared with the `components/ui` exports in a
  test, so a new primitive cannot ship without a gallery entry.
- **Lint.** CLAUDE.md rule 5 is now enforced beyond hex colours: raw `fontSize`, `lineHeight`, `gap`,
  `padding*`, `margin*`, `border*Radius` and `duration` numbers are errors in `app/`, `features/` and
  `components/` (except `components/ui`, which implements the tokens and still may not contain hex).
