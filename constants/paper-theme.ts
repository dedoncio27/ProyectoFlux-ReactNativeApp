import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';

/** Color principal heredado del diseño anterior de la app. */
const primary = '#1565c0';
const secondary = '#4a90dd';

export const fluxLightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary,
    onPrimary: '#ffffff',
    primaryContainer: '#cfe3fb',
    onPrimaryContainer: '#0f284d',
    secondary,
    onSecondary: '#ffffff',
    secondaryContainer: '#e3f2fd',
    onSecondaryContainer: '#0f284d',
    background: '#f2f2f2',
    surface: '#ffffff',
    surfaceVariant: '#e7e7e7',
    outline: '#a8a8a8',
  },
};

export const fluxDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#1565c0',
    onPrimary: '#ffffff',
    primaryContainer: '#1565c0',
    onPrimaryContainer: '#e3f2fd',
    secondary: '#64b5f6',
    onSecondary: '#0d1b2a',
    secondaryContainer: '#1e3a5f',
    onSecondaryContainer: '#e3f2fd',
    background: '#121212',
    surface: '#1e1e1e',
    surfaceVariant: '#2c2c2c',
    outline: '#8a8a8a',
  },
};
