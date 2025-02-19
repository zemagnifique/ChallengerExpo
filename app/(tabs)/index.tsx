import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';

export default function DashboardScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Your Challenger Dashboard</ThemedText>

        <ThemedView style={styles.statsContainer}>
          <ThemedText type="subtitle">Active Challenges</ThemedText>
          <ThemedText>You have no active challenges</ThemedText>
        </ThemedView>

        <ThemedView style={styles.statsContainer}>
          <ThemedText type="subtitle">Pending Proofs</ThemedText>
          <ThemedText>No pending proof submissions</ThemedText>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  statsContainer: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    gap: 10,
  },
});