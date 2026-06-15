import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

import { fluxDarkTheme, fluxLightTheme } from '@/constants/paper-theme';
import { AppThemeProvider, useAppTheme } from '@/context/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';


export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutContent() {
  const { isDark } = useAppTheme();

  const paperTheme = isDark ? fluxDarkTheme : fluxLightTheme;

  const customNavigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: paperTheme.colors.background,
      card: paperTheme.colors.surface,
    },
  };

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={customNavigationTheme}>
        <Stack
          screenOptions={{
            contentStyle: {
              backgroundColor: paperTheme.colors.background,
            },
          }}
        >
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="misAlimentos" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="bibliotecaGlobal" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="misRecetas" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="addDelOrEdItem" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
          <Stack.Screen name="nuevoAlimento" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="delOrUpItem" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="temas" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="nuevaReceta" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="myProfile" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="calorySettings" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="payment" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="exercises" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="workout" options={{ headerShown: false, animation: 'slide_from_right' }} />
        </Stack>
        <StatusBar style={isDark ? "light" : "dark"} />
      </ThemeProvider>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <RootLayoutContent />
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}
