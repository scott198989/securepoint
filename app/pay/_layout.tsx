// Pay section layout

import { Stack } from 'expo-router';
import { useTheme } from '../../hooks';

export default function PayLayout() {
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
        name="calculator"
        options={{
          title: 'Pay Calculator',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
