
import { useEffect, useState } from 'react';
import { ColorSchemeName } from 'react-native-web';

export function useColorScheme(): ColorSchemeName {
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateColorScheme = (e: MediaQueryListEvent | MediaQueryList) => {
      setColorScheme(e.matches ? 'dark' : 'light');
    };

    updateColorScheme(mediaQuery);
    mediaQuery.addListener(updateColorScheme);

    return () => mediaQuery.removeListener(updateColorScheme);
  }, []);

  return colorScheme;
}
