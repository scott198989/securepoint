// Tab navigation layout

import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks';
import { typography } from '../../constants/theme';

// Tab icon component
function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  const icons: Record<string, string> = {
    dashboard: focused ? '◉' : '○',
    transactions: focused ? '⊡' : '□',
    budget: focused ? '◈' : '◇',
    goals: focused ? '★' : '☆',
    settings: focused ? '⚙' : '⚙',
  };

  return (
    <Text style={[styles.icon, { color }]}>
      {icons[name] || '•'}
    </Text>
  );
}

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 85,
          paddingTop: 8,
          paddingBottom: 25,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.medium,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="dashboard" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="transactions" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Budget',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="budget" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="goals" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="settings" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 24,
  },
});
