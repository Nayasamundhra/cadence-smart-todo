import { Tabs } from 'expo-router';
import {
  Calendar,
  CalendarCheck,
  ChartNoAxesColumn,
  LayoutGrid,
  type LucideIcon,
} from '@/design/icons/lucide';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui';
import { Spark, useTheme } from '@/design';

/** Tab label: the caption style, capped at 1.4x font scaling so the bar keeps its height (doc 02 section 2.3). */
function TabLabel({ color, children }: { color: ColorValue; children: string }) {
  return (
    <Text
      variant="caption"
      maxFontSizeMultiplier={1.4}
      numberOfLines={1}
      // Five labels share the bar width; shrink slightly rather than cut "Calendar" to "Calend...".
      adjustsFontSizeToFit
      minimumFontScale={0.8}
      style={{ color }}
    >
      {children}
    </Text>
  );
}

function TabIcon({ icon: Icon, color }: { icon: LucideIcon; color: ColorValue }) {
  const { controls } = useTheme();
  return <Icon size={controls.iconSize.bar} strokeWidth={controls.iconStroke} color={color} />;
}

/** The five primary sections (doc 03 section 3.1): icon + label, accent when active, textTertiary otherwise. */
export default function TabsLayout() {
  const { colors, controls, layout } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabel: ({ color, children }) => <TabLabel color={color}>{children}</TabLabel>,
        tabBarStyle: {
          height: layout.tabBarHeight + insets.bottom,
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: ({ color }) => <TabIcon icon={CalendarCheck} color={color} />,
          tabBarButtonTestID: 'tab-today',
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color }) => <TabIcon icon={LayoutGrid} color={color} />,
          tabBarButtonTestID: 'tab-browse',
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => <TabIcon icon={Calendar} color={color} />,
          tabBarButtonTestID: 'tab-calendar',
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => <TabIcon icon={ChartNoAxesColumn} color={color} />,
          tabBarButtonTestID: 'tab-progress',
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: 'Assistant',
          tabBarIcon: ({ color }) => <Spark size={controls.iconSize.bar} color={String(color)} />,
          tabBarButtonTestID: 'tab-assistant',
        }}
      />
    </Tabs>
  );
}
