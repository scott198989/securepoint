/**
 * Deployment Section Layout
 * Stack navigator for deployment mode tools
 */

import { Stack } from 'expo-router';
import { useTheme } from '../../hooks';

export default function DeploymentLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Deployment Mode',
        }}
      />
      <Stack.Screen
        name="activate"
        options={{
          title: 'Start Deployment',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="status"
        options={{
          title: 'Deployment Status',
        }}
      />
      <Stack.Screen
        name="savings"
        options={{
          title: 'Savings Tracker',
        }}
      />
      <Stack.Screen
        name="budget"
        options={{
          title: 'Deployment Budget',
        }}
      />
      <Stack.Screen
        name="countdown"
        options={{
          title: 'Countdown',
        }}
      />
      <Stack.Screen
        name="checklist"
        options={{
          title: 'Pre-Deployment Checklist',
        }}
      />
    </Stack>
  );
}
