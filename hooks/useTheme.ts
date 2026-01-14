// Theme hook for managing light/dark mode

import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../store';
import { lightTheme, darkTheme, Theme } from '../constants/theme';

export function useTheme(): Theme & { isDark: boolean } {
  const systemColorScheme = useColorScheme();
  const { settings } = useSettingsStore();

  let isDark: boolean;

  switch (settings.theme) {
    case 'dark':
      isDark = true;
      break;
    case 'light':
      isDark = false;
      break;
    case 'system':
    default:
      isDark = systemColorScheme === 'dark';
      break;
  }

  const theme = isDark ? darkTheme : lightTheme;

  return { ...theme, isDark };
}

// Hook to get just the colors
export function useThemeColors() {
  const theme = useTheme();
  return theme.colors;
}

// Hook to check if dark mode is active
export function useIsDarkMode(): boolean {
  const theme = useTheme();
  return theme.isDark;
}
