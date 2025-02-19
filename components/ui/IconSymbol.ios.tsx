import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

// Map custom names to SF Symbols
const SYMBOL_MAPPING: Record<string, SymbolViewProps['name']> = {
  'biceps': 'figure.strengthtraining',
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: SymbolViewProps['name'];
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={SYMBOL_MAPPING[name] || name}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}
