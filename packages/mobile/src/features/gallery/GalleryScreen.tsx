import { useState, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Ellipsis, Inbox, Plus, Search, Tag, WifiOff } from '@/design/icons/lucide';
import {
  Avatar,
  Banner,
  Button,
  Card,
  Checkbox,
  Chip,
  Dialog,
  EmptyState,
  ErrorState,
  IconButton,
  Input,
  ListHeader,
  Menu,
  ProgressBar,
  ProgressRing,
  SegmentedControl,
  Sheet,
  Skeleton,
  Slider,
  Switch,
  Text,
  useSnackbar,
} from '@/components/ui';
import {
  Spark,
  swatches,
  typography,
  useTheme,
  useThemePreference,
  type PriorityLevel,
  type SwatchKey,
  type TextVariant,
  type ThemePreference,
} from '@/design';

/**
 * Every primitive the gallery shows. A test compares this with the exports of components/ui, so a new
 * primitive cannot ship without a gallery entry (Snackbar is shown through its `useSnackbar` hook).
 */
export const GALLERY_COVERS = [
  'Avatar',
  'Banner',
  'Button',
  'Card',
  'Checkbox',
  'Chip',
  'Dialog',
  'EmptyState',
  'ErrorState',
  'IconButton',
  'Input',
  'ListHeader',
  'Menu',
  'ProgressBar',
  'ProgressRing',
  'SegmentedControl',
  'Sheet',
  'Skeleton',
  'Slider',
  'Snackbar',
  'Switch',
  'Text',
] as const;

const THEME_OPTIONS = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const satisfies readonly { value: ThemePreference; label: string }[];

const PRIORITIES: PriorityLevel[] = [0, 1, 2, 3, 4];
const PRIORITY_NAMES = ['None', 'Low', 'Medium', 'High', 'Urgent'] as const;
const VARIANTS = Object.keys(typography) as TextVariant[];
const SWATCH_KEYS = Object.keys(swatches) as SwatchKey[];

/** A titled block of the gallery. */
function Section({ title, children }: { title: string; children: ReactNode }) {
  const { space } = useTheme();
  return (
    <View style={{ gap: space[3] }}>
      <ListHeader title={title} />
      {children}
    </View>
  );
}

function Row({ children, wrap = true }: { children: ReactNode; wrap?: boolean }) {
  const { space, layout } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: wrap ? 'wrap' : 'nowrap',
        alignItems: 'center',
        gap: space[3],
        paddingHorizontal: layout.screenPadding,
      }}
    >
      {children}
    </View>
  );
}

function Padded({ children }: { children: ReactNode }) {
  const { space, layout } = useTheme();
  return <View style={{ paddingHorizontal: layout.screenPadding, gap: space[3] }}>{children}</View>;
}

/**
 * Dev-only gallery of every primitive in every state (docs/02-design-system.md section 2.6).
 * The theme control at the top switches System / Light / Dark live, so each state can be checked
 * in both schemes. Reach it by the deep link /_dev/gallery.
 */
export function GalleryScreen() {
  const theme = useTheme();
  const { colors, space, layout, controls } = theme;
  const { preference, setPreference } = useThemePreference();
  const insets = useSafeAreaInsets();
  const snackbar = useSnackbar();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('Water the plants');
  const [checks, setChecks] = useState<Record<number, boolean>>({ 2: true });
  const [chipSelected, setChipSelected] = useState(true);
  const [segment, setSegment] = useState<'day' | 'week' | 'month'>('week');
  const [switchOn, setSwitchOn] = useState(true);
  const [slider, setSlider] = useState(0.4);
  const [lastMenu, setLastMenu] = useState('none');

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }} testID="gallery">
      <ScrollView
        testID="gallery-scroll"
        contentContainerStyle={{
          paddingTop: insets.top + space[4],
          paddingBottom: insets.bottom + space[16],
          gap: space[2],
        }}
      >
        <Padded>
          <Text variant="display" accessibilityRole="header">
            Design gallery
          </Text>
          <Text variant="callout" color="textSecondary">
            Every primitive in every state. Switch the theme here; try the OS font size at 200%.
          </Text>
          <SegmentedControl
            testID="gallery-theme"
            accessibilityLabel="Theme"
            options={THEME_OPTIONS}
            value={preference}
            onChange={setPreference}
          />
        </Padded>

        <Section title="Text">
          <Padded>
            {VARIANTS.map((variant) => (
              <Text key={variant} variant={variant}>
                {variant === 'stat' ? '1,284' : `${variant}: Plan the week`}
              </Text>
            ))}
            <Text variant="body" color="textSecondary">
              textSecondary
            </Text>
            <Text variant="body" color="textTertiary">
              textTertiary
            </Text>
            <Text variant="body" color="accent">
              accent
            </Text>
            <Text variant="body" color="danger">
              danger
            </Text>
          </Padded>
        </Section>

        <Section title="Button">
          <Row>
            <Button label="Primary" />
            <Button label="Secondary" variant="secondary" />
            <Button label="Ghost" variant="ghost" />
            <Button label="Danger" variant="danger" />
          </Row>
          <Row>
            <Button label="Disabled" disabled />
            <Button label="Disabled" variant="secondary" disabled />
            <Button label="Loading" loading />
            <Button label="Loading" variant="danger" loading />
          </Row>
          <Row>
            <Button label="Large" size="lg" />
            <Button label="Medium" size="md" />
            <Button label="Small" size="sm" />
            <Button label="Add task" icon={Plus} />
          </Row>
        </Section>

        <Section title="IconButton">
          <Row>
            <IconButton icon={Search} accessibilityLabel="Search" />
            <IconButton icon={Bell} accessibilityLabel="Notifications" badge />
            <IconButton icon={Bell} accessibilityLabel="Notifications, unavailable" disabled />
            <Menu
              testID="gallery-menu"
              items={[
                { id: 'edit', title: 'Edit' },
                { id: 'duplicate', title: 'Duplicate' },
                { id: 'delete', title: 'Delete', destructive: true },
              ]}
              onSelect={setLastMenu}
            >
              <IconButton icon={Ellipsis} accessibilityLabel="More actions" />
            </Menu>
            <Text variant="caption" color="textSecondary">
              Menu chose: {lastMenu}
            </Text>
          </Row>
        </Section>

        <Section title="Input">
          <Padded>
            <Input label="Title" value={name} onChangeText={setName} placeholder="Task title" />
            <Input label="Empty with placeholder" placeholder="What needs doing?" />
            <Input label="With an error" defaultValue="x" error="Enter at least 2 characters." />
            <Input label="Disabled" defaultValue="Read only" editable={false} />
          </Padded>
        </Section>

        <Section title="Chip">
          <Row>
            <Chip label="Default" />
            <Chip
              label="Selected"
              selected={chipSelected}
              onPress={() => setChipSelected((v) => !v)}
            />
            <Chip label="Errands" icon={Tag} />
            <Chip label="Home" dotColor={theme.swatch('moss')} />
            <Chip label="Removable" onRemove={() => undefined} />
          </Row>
        </Section>

        <Section title="Checkbox">
          <Row>
            {PRIORITIES.map((level) => (
              <Checkbox
                key={level}
                priority={level}
                checked={Boolean(checks[level])}
                onChange={(value) => setChecks((current) => ({ ...current, [level]: value }))}
                accessibilityLabel={`${PRIORITY_NAMES[level]} priority task`}
              />
            ))}
          </Row>
          <Row>
            <Checkbox size="subtask" checked={false} accessibilityLabel="Subtask, not done" />
            <Checkbox size="subtask" checked accessibilityLabel="Subtask, done" />
            <Checkbox checked={false} disabled accessibilityLabel="Disabled task" />
            <Checkbox checked disabled priority={4} accessibilityLabel="Disabled done task" />
          </Row>
        </Section>

        <Section title="Card">
          <Padded>
            <Card>
              <Text variant="title3">Plain card</Text>
              <Text variant="callout" color="textSecondary">
                Surface, hairline border, no shadow.
              </Text>
            </Card>
            <Card elevated>
              <Text variant="title3">Elevated card</Text>
              <Text variant="callout" color="textSecondary">
                Soft shadow in light theme only.
              </Text>
            </Card>
          </Padded>
        </Section>

        <Section title="Sheet, Dialog, Snackbar">
          <Row>
            <Button label="Open sheet" variant="secondary" onPress={() => setSheetOpen(true)} />
            <Button label="Open dialog" variant="secondary" onPress={() => setDialogOpen(true)} />
            <Button
              label="Show snackbar"
              variant="secondary"
              onPress={() =>
                snackbar.show({
                  message: 'Task completed',
                  actionLabel: 'Undo',
                  onAction: () => undefined,
                })
              }
            />
          </Row>
        </Section>

        <Section title="SegmentedControl, Switch, Slider">
          <Padded>
            <SegmentedControl
              accessibilityLabel="Calendar range"
              options={[
                { value: 'day', label: 'Day' },
                { value: 'week', label: 'Week' },
                { value: 'month', label: 'Month' },
              ]}
              value={segment}
              onChange={setSegment}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
              <Switch
                value={switchOn}
                onValueChange={setSwitchOn}
                accessibilityLabel="Daily summary"
              />
              <Switch
                value={false}
                onValueChange={() => undefined}
                accessibilityLabel="Off switch"
              />
              <Switch
                value
                disabled
                onValueChange={() => undefined}
                accessibilityLabel="Disabled switch"
              />
            </View>
            <Slider value={slider} onValueChange={setSlider} accessibilityLabel="Daily target" />
          </Padded>
        </Section>

        <Section title="Skeleton">
          <Padded>
            <Skeleton height={controls.avatar.sm} rounded="full" width={controls.avatar.sm} />
            <Skeleton height={space[4]} width="80%" />
            <Skeleton height={space[4]} width="55%" />
          </Padded>
        </Section>

        <Section title="EmptyState, ErrorState">
          <EmptyState
            icon={Inbox}
            title="Nothing due today"
            message="Add a task to get started."
            action={{ label: 'Add task', onPress: () => undefined }}
          />
          <ErrorState
            message="Couldn't load your report. Check your connection and try again."
            onRetry={() => undefined}
          />
        </Section>

        <Section title="Banner">
          <Banner tone="info" message="Your changes are saved on this device." />
          <Banner
            tone="warning"
            icon={WifiOff}
            message="You're offline. AI needs a connection."
            action={{ label: 'Retry', onPress: () => undefined }}
          />
          <Banner
            tone="danger"
            message="Notifications are turned off."
            action={{ label: 'Open Settings', onPress: () => undefined }}
          />
        </Section>

        <Section title="ProgressRing, ProgressBar">
          <Row>
            <ProgressRing size={20} progress={0.25} accessibilityLabel="Progress 25 percent" />
            <ProgressRing size={40} progress={0.5} accessibilityLabel="Progress 50 percent" />
            <ProgressRing
              size={72}
              progress={0.75}
              color={theme.swatch('plum')}
              accessibilityLabel="Progress 75 percent"
            >
              <Text variant="caption">75%</Text>
            </ProgressRing>
            <ProgressRing size={120} progress={1} accessibilityLabel="Progress 100 percent">
              <Text variant="title2">Done</Text>
            </ProgressRing>
          </Row>
          <Padded>
            <ProgressBar progress={0} accessibilityLabel="Goal progress 0 percent" />
            <ProgressBar
              progress={0.5}
              color={theme.swatch('sky')}
              accessibilityLabel="Goal progress 50 percent"
            />
            <ProgressBar progress={1} accessibilityLabel="Goal progress 100 percent" />
          </Padded>
        </Section>

        <Section title="Avatar, ListHeader, Spark">
          <Row>
            <Avatar name="Ada Lovelace" />
            <Avatar name="Grace Hopper" size="lg" />
            <Avatar name="Single" />
            <Spark color={colors.accent} />
            <Spark size={controls.iconSize.bar} color={colors.accent} />
          </Row>
          <ListHeader
            title="Overdue"
            count={3}
            action={{ label: 'Reschedule', onPress: () => undefined }}
          />
        </Section>

        <Section title="Swatches">
          <Row>
            {SWATCH_KEYS.map((key) => (
              <View key={key} style={{ alignItems: 'center', gap: space[1] }}>
                <View
                  accessibilityLabel={`${key} swatch`}
                  style={{
                    width: layout.touchMin,
                    height: layout.touchMin,
                    borderRadius: theme.radius.full,
                    backgroundColor: theme.swatch(key),
                  }}
                />
                <Text variant="caption" color="textSecondary">
                  {key}
                </Text>
              </View>
            ))}
          </Row>
        </Section>
      </ScrollView>

      <Sheet visible={sheetOpen} onClose={() => setSheetOpen(false)} title="Sample sheet">
        <Text variant="body">Sheets hold quick add, pickers and filters.</Text>
        <Input label="Task title" placeholder="Type here to check the keyboard" />
        <Button label="Done" onPress={() => setSheetOpen(false)} />
      </Sheet>
      <Dialog
        visible={dialogOpen}
        title="Delete this task?"
        message="You can undo this for a few seconds."
        confirmLabel="Delete task"
        onConfirm={() => setDialogOpen(false)}
        onCancel={() => setDialogOpen(false)}
      />
    </View>
  );
}
