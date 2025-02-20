
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '@/contexts/AuthContext';
import 'react-native-polyfill-globals/auto';

// Setup Buffer polyfill properly
export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    async function prepare() {
      console.log('RootLayout: Starting initialization');
      try {
        console.log('RootLayout: Preventing splash screen auto-hide');
        await SplashScreen.preventAutoHideAsync();
        console.log('RootLayout: Setting up Buffer');
        if (typeof window !== 'undefined') {
          const { Buffer } = require('buffer/');
          window.Buffer = Buffer;
          global.Buffer = Buffer;
        }
        console.log('RootLayout: Initialization complete');
      } catch (e) {
        console.error('RootLayout initialization error:', e);
      }
    }
    prepare();
  }, []);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      try {
        SplashScreen.hideAsync();
      } catch (error) {
        console.error('Error hiding splash screen:', error);
      }
    }
  }, [loaded]);

  if (!loaded) {
    console.log('Fonts not loaded yet');
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated && router.pathname !== '/login') {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  return <Slot />;
}
