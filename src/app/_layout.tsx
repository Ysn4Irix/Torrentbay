import '@/styles/global.css';

import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.background,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.primary,
  },
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView
      className="flex-1 bg-background"
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <SafeAreaProvider style={{ flex: 1, backgroundColor: colors.background }}>
        <ThemeProvider value={navigationTheme}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.background },
              headerShadowVisible: false,
              headerTintColor: colors.textPrimary,
              contentStyle: { backgroundColor: colors.background },
              navigationBarColor: colors.background,
              statusBarBackgroundColor: colors.background,
              statusBarStyle: 'light',
              presentation: 'card',
              animation: Platform.select({
                ios: 'simple_push',
                android: 'ios_from_right',
                default: 'default',
              }),
              animationDuration: 220,
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="home" options={{ headerShown: false }} />
            <Stack.Screen name="search" options={{ headerShown: false }} />
            <Stack.Screen name="history" options={{ headerShown: false }} />
            <Stack.Screen
              name="torrent/[id]"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="favorites" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
