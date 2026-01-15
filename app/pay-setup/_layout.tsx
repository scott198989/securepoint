// Pay Setup wizard layout

import { Stack } from 'expo-router';
import { useTheme } from '../../hooks';

export default function PaySetupLayout() {
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
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Pay Profile Setup',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="service"
        options={{
          title: 'Service Information',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="status"
        options={{
          title: 'Duty Status',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="location"
        options={{
          title: 'Duty Station',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="family"
        options={{
          title: 'Family Status',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="tax"
        options={{
          title: 'Tax Information',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="deductions"
        options={{
          title: 'Deductions',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="special-pays"
        options={{
          title: 'Special Pays',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="summary"
        options={{
          title: 'Pay Summary',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
