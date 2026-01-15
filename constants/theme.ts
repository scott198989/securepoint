// Theme constants for $ecurePoint
// Clean, professional design - no tacky military themes

export const colors = {
  // Primary brand colors
  primary: {
    50: '#e8f5e9',
    100: '#c8e6c9',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#2e7d32', // Main primary - professional green
    600: '#2e7d32',
    700: '#388e3c',
    800: '#1b5e20',
    900: '#1b5e20',
  },
  // Secondary accent
  secondary: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#1976d2', // Main secondary - reliable blue
    600: '#1565c0',
    700: '#0d47a1',
    800: '#0d47a1',
    900: '#0d47a1',
  },
  // Neutral grays
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  // Semantic colors
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  // Income/Expense colors
  income: '#4caf50',
  expense: '#f44336',
  transfer: '#2196f3',
  savings: '#9c27b0',
  // Category colors for charts
  categoryColors: [
    '#2e7d32', '#1976d2', '#7b1fa2', '#c62828',
    '#f57c00', '#00838f', '#558b2f', '#6a1b9a',
    '#283593', '#ad1457', '#00695c', '#4527a0',
  ],
};

export const lightTheme = {
  dark: false,
  colors: {
    primary: colors.primary[500],
    background: '#ffffff',
    card: '#f5f5f5',
    text: colors.gray[900],
    textSecondary: colors.gray[600],
    border: colors.gray[300],
    notification: colors.error,
    // Custom
    surface: '#ffffff',
    surfaceVariant: colors.gray[100],
    income: colors.income,
    expense: colors.expense,
    warning: colors.warning,
    divider: colors.gray[200],
    disabled: colors.gray[400],
    placeholder: colors.gray[500],
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
};

export const darkTheme = {
  dark: true,
  colors: {
    primary: colors.primary[400],
    background: '#121212',
    card: '#1e1e1e',
    text: '#ffffff',
    textSecondary: colors.gray[400],
    border: colors.gray[800],
    notification: colors.error,
    // Custom
    surface: '#1e1e1e',
    surfaceVariant: '#2d2d2d',
    income: '#81c784',
    expense: '#ef5350',
    warning: '#ffb74d',
    divider: colors.gray[800],
    disabled: colors.gray[600],
    placeholder: colors.gray[500],
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Standalone spacing export for components
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export type Theme = typeof lightTheme;
