import { Tabs } from 'expo-router';

/** The five primary sections (doc 03 section 3.1). Icons arrive with the design system in Phase 1. */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="today" options={{ title: 'Today', tabBarButtonTestID: 'tab-today' }} />
      <Tabs.Screen name="browse" options={{ title: 'Browse', tabBarButtonTestID: 'tab-browse' }} />
      <Tabs.Screen
        name="calendar"
        options={{ title: 'Calendar', tabBarButtonTestID: 'tab-calendar' }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: 'Progress', tabBarButtonTestID: 'tab-progress' }}
      />
      <Tabs.Screen
        name="assistant"
        options={{ title: 'Assistant', tabBarButtonTestID: 'tab-assistant' }}
      />
    </Tabs>
  );
}
