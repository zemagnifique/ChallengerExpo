
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ChallengesScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}>
      <ThemedView style={styles.container}>
        <TouchableOpacity style={styles.createButton}>
          <IconSymbol name="plus.circle.fill" size={24} color="#fff" />
          <ThemedText style={styles.buttonText}>Create Challenge</ThemedText>
        </TouchableOpacity>

        <ThemedView style={styles.challengesList}>
          <ThemedText type="subtitle">Your Challenges</ThemedText>
          <ThemedText>No challenges yet</ThemedText>
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    gap: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  challengesList: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    gap: 10,
  },
});
