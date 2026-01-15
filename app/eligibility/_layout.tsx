/**
 * Eligibility Section Layout
 * Stack navigator for special pay eligibility wizard
 */

import { Stack } from 'expo-router';
import { useTheme } from '../../hooks';

export default function EligibilityLayout() {
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
          title: 'Special Pay Eligibility',
        }}
      />
      <Stack.Screen
        name="wizard"
        options={{
          title: 'Eligibility Wizard',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="results"
        options={{
          title: 'Your Results',
        }}
      />
    </Stack>
  );
}
