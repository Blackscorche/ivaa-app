import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const brand = {
  purple: '#7030A0',
  purpleLight: '#9060B8',
  purpleDark: '#5020A0',
  purpleFaint: '#F3E8FF',
  pink: '#E6007E',
  pinkLight: '#FF4DA6',
  pinkDark: '#CC0066',
  cyan: '#00D4E6',
  cyanLight: '#66E5F0',
  white: '#FFFFFF',
  black: '#000000',
};

export const colors = {
  // Brand
  primary: brand.purple,
  primaryLight: brand.purpleLight,
  primaryDark: brand.purpleDark,
  primaryFaint: brand.purpleFaint,
  secondary: brand.pink,
  secondaryLight: brand.pinkLight,
  accent: brand.cyan,

  // Status
  success: '#34C759',
  successFaint: '#E8FAF0',
  warning: '#FF9500',
  warningFaint: '#FFF5E6',
  error: '#FF3B30',
  errorFaint: '#FFF0EF',
  info: '#007AFF',
  infoFaint: '#E5F1FF',

  // Neutrals
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F7',
    200: '#E5E5EA',
    300: '#D1D1D6',
    400: '#A8A8B3',
    500: '#8E8E93',
    600: '#636366',
    700: '#48484A',
    800: '#2C2C2E',
    900: '#1C1C1E',
  },

  // Surfaces
  background: '#F8F0FF',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F7',
  border: 'rgba(112, 48, 160, 0.12)',
  borderStrong: 'rgba(112, 48, 160, 0.3)',

  // Base
  white: '#FFFFFF',
  black: '#000000',

  // Text
  textPrimary: '#1C1C1E',
  textSecondary: '#636366',
  textTertiary: '#A8A8B3',
  textInverse: '#FFFFFF',
  textLink: '#7030A0',
};

export const gradients = {
  primary: [brand.purple, brand.pink] as const,
  primaryFull: [brand.purpleDark, brand.purple, brand.pink] as const,
  splash: ['#1A0033', '#2D1B69', '#7030A0'] as const,
  card: ['rgba(112,48,160,0.08)', 'rgba(230,0,126,0.04)'] as const,
  success: ['#34C759', '#2EAD4E'] as const,
  surface: ['#FFFFFF', '#F8F0FF'] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const radius = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

export const typography = {
  displayLarge: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  displayMedium: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.3 },
  displaySmall: { fontSize: 24, fontWeight: '600' as const },
  headlineLarge: { fontSize: 22, fontWeight: '600' as const },
  headlineMedium: { fontSize: 20, fontWeight: '600' as const },
  headlineSmall: { fontSize: 18, fontWeight: '600' as const },
  titleLarge: { fontSize: 16, fontWeight: '600' as const },
  titleMedium: { fontSize: 15, fontWeight: '500' as const },
  titleSmall: { fontSize: 14, fontWeight: '500' as const },
  bodyLarge: { fontSize: 16, fontWeight: '400' as const },
  bodyMedium: { fontSize: 14, fontWeight: '400' as const },
  bodySmall: { fontSize: 12, fontWeight: '400' as const },
  labelLarge: { fontSize: 14, fontWeight: '600' as const, letterSpacing: 0.1 },
  labelMedium: { fontSize: 12, fontWeight: '500' as const, letterSpacing: 0.5 },
  labelSmall: { fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.5 },
};

export const shadows = {
  sm: {
    shadowColor: brand.purple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: brand.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: brand.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 12,
  },
};

export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: brand.purple,
    onPrimary: '#FFFFFF',
    primaryContainer: brand.purpleFaint,
    onPrimaryContainer: brand.purpleDark,
    secondary: brand.pink,
    onSecondary: '#FFFFFF',
    tertiary: brand.cyan,
    background: '#F8F0FF',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F7',
    outline: 'rgba(112, 48, 160, 0.2)',
    error: '#FF3B30',
  },
  roundness: 3,
};
