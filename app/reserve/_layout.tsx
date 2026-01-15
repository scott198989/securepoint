/**
 * Reserve Section Layout
 * Stack navigator for Guard/Reserve tools
 */

import { Stack } from 'expo-router';
import { useTheme } from '../../hooks';

export default function ReserveLayout() {
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
          title: 'Guard/Reserve Tools',
        }}
      />
      <Stack.Screen
        name="drill-calendar"
        options={{
          title: 'Drill Calendar',
        }}
      />
      <Stack.Screen
        name="drill-pay"
        options={{
          title: 'Drill Pay Calculator',
        }}
      />
      <Stack.Screen
        name="at-calculator"
        options={{
          title: 'AT Pay Calculator',
        }}
      />
      <Stack.Screen
        name="orders-compare"
        options={{
          title: 'Orders Comparison',
        }}
      />
      <Stack.Screen
        name="add-drill"
        options={{
          title: 'Add Drill Weekend',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
