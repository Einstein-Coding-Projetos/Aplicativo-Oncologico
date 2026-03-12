import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '../hooks/use-color-scheme';
import { AppProvider } from '../context/AppContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const isTabsRoute = segments[0] === '(tabs)';

  return (
    <AppProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={isTabsRoute ? 'light' : 'dark'} translucent={false} />
      </ThemeProvider>
    </AppProvider>
  );
}
