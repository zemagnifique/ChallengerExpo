
import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet, RefreshControl } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';

const HEADER_HEIGHT = 0;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
  data?: any[];
  renderItem?: any;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  onRefresh?: () => Promise<void>;
  refreshing?: boolean;
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
  data,
  renderItem,
  ListHeaderComponent,
  onRefresh,
  refreshing,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.FlatList>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const bottom = useBottomTabOverflow();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 50,
    },
    header: {
      height: 'auto',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backgroundColor: Colors[colorScheme].background,
      paddingTop: 16,
      paddingHorizontal: 16,
    },
    content: {
      flex: 1,
      paddingVertical: 16,
      gap: 16,
      overflow: 'hidden',
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  const Header = () => (
    <>
      <Animated.View
        style={[
          styles.header,
          { backgroundColor: Colors[colorScheme].background },
          headerAnimatedStyle,
        ]}>
        {headerImage}
      </Animated.View>
      {ListHeaderComponent && <ListHeaderComponent />}
      {children && <ThemedView style={styles.content}>{children}</ThemedView>}
    </>
  );

  return (
    <ThemedView style={styles.container}>
      <Animated.FlatList
        ref={scrollRef}
        data={data || []}
        renderItem={renderItem}
        ListHeaderComponent={Header}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: bottom }}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing || false} onRefresh={onRefresh} />
          ) : undefined
        }
      />
    </ThemedView>
  );
}
