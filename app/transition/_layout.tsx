/**
 * Transition Section Layout
 * Stack navigation for transition planning screens
 */

import { Stack } from 'expo-router';
import { useTheme } from '../../hooks';

export default function TransitionLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
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
          title: 'Transition Planning',
        }}
      />
      <Stack.Screen
        name="setup"
        options={{
          title: 'Transition Setup',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="countdown"
        options={{
          title: 'ETS Countdown',
        }}
      />
      <Stack.Screen
        name="benefits"
        options={{
          title: 'Benefits Calculator',
        }}
      />
      <Stack.Screen
        name="va-claims"
        options={{
          title: 'VA Claims',
        }}
      />
      <Stack.Screen
        name="checklist"
        options={{
          title: 'Transition Checklist',
        }}
      />
      <Stack.Screen
        name="comparison"
        options={{
          title: 'Income Comparison',
        }}
      />
      <Stack.Screen
        name="tsp"
        options={{
          title: 'TSP Options',
        }}
      />
    </Stack>
  );
}
