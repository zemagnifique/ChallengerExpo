
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '@/contexts/AuthContext';
import 'react-native-polyfill-globals/auto';

// Setup Buffer polyfill properly
export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Initialize Buffer
    if (typeof window !== 'undefined') {
      const { Buffer } = require('buffer/');
      window.Buffer = Buffer;
      global.Buffer = Buffer;
    }
    
    // Prevent splash screen from auto-hiding
    SplashScreen.preventAutoHideAsync();
  }, []);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </ThemeProvider>
  );
}
