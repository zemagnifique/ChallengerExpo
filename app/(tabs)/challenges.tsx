
import { StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function ChallengesScreen() {
  const router = useRouter();
  const { challenges } = useAuth();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}>
      <ThemedView style={styles.container}>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => router.push('/create-challenge')}>
          <IconSymbol name="plus" size={32} color="#fff" />
        </TouchableOpacity>

        <ThemedView style={styles.challengesList}>
          <ThemedText type="subtitle">Your Challenges</ThemedText>
          {challenges.length === 0 ? (
            <ThemedText>No challenges yet</ThemedText>
          ) : (
            <FlatList
              data={challenges}
              keyExtractor={(item) => item.createdAt.toString()}
              renderItem={({ item }) => (
                <ThemedView style={styles.challengeCard}>
                  <ThemedText style={styles.challengeTitle}>{item.title}</ThemedText>
                  <ThemedText>{item.description}</ThemedText>
                  <ThemedText>Frequency: {item.frequency}</ThemedText>
                  <ThemedText>Status: {item.status}</ThemedText>
                </ThemedView>
              )}
            />
          )}
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    width: 56,
    height: 56,
    borderRadius: 28,
    position: 'absolute',
    bottom: 20,
    right: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1,
  },
  challengesList: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    gap: 10,
    flex: 1,
  },
  challengeCard: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 10,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});
