// LES (Leave and Earnings Statement) section layout

import { Stack } from 'expo-router';
import { useTheme } from '../../hooks';

export default function LESLayout() {
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
          title: 'LES History',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'Add LES Entry',
          headerBackTitle: 'Back',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'LES Details',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="compare"
        options={{
          title: 'Compare LES',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
