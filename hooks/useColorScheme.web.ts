
import { ColorSchemeName, Platform } from 'react-native';

export function useColorScheme(): ColorSchemeName {
  if (Platform.OS !== 'web') {
    return null;
  }
  return 'light';
}
