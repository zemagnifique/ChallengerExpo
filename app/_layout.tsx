
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
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        if (typeof window !== 'undefined') {
          const { Buffer } = require('buffer/');
          window.Buffer = Buffer;
          global.Buffer = Buffer;
          // Enable web resource access
          if (window.location.hostname === '0.0.0.0') {
            document.domain = '0.0.0.0';
          }
        }
      } catch (e) {
        console.warn(e);
      }
    }
    prepare();
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
