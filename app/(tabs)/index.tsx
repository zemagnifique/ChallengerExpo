
import { StyleSheet, TouchableOpacity, FlatList, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function IndexScreen() {
  const router = useRouter();
  const { challenges, user } = useAuth();

  const pendingChallenges = challenges.filter(c => c.status === 'pending' && c.userId === user?.id);
  const activeChallenges = challenges.filter(c => c.status === 'active' && c.userId === user?.id);
  const coachingChallenges = challenges.filter(c => c.coachId === user?.id);

  const renderChallengeSection = (title, items) => (
    <ThemedView style={styles.section}>
      <ThemedText type="subtitle">{title}</ThemedText>
      {items.length === 0 ? (
        <ThemedText>No {title.toLowerCase()}</ThemedText>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.createdAt.toString()}
          renderItem={({ item }) => (
            <ThemedView style={styles.challengeCard}>
              <ThemedText style={styles.challengeTitle}>{item.title}</ThemedText>
              <ThemedText>{item.description}</ThemedText>
              <ThemedText>Frequency: {item.frequency}</ThemedText>
              <View style={styles.dateContainer}>
                <ThemedText>Start: {new Date(item.startDate).toLocaleDateString()}</ThemedText>
                <ThemedText>End: {new Date(item.endDate).toLocaleDateString()}</ThemedText>
              </View>
            </ThemedView>
          )}
          scrollEnabled={false}
        />
      )}
    </ThemedView>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}>
      <ThemedView style={styles.container}>
        {renderChallengeSection('Pending Challenges', pendingChallenges)}
        {renderChallengeSection('Active Challenges', activeChallenges)}
        {renderChallengeSection('Coaching Challenges', coachingChallenges)}

        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => router.push('/create-challenge')}>
          <IconSymbol name="plus" size={32} color="#fff" />
        </TouchableOpacity>
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
  section: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    gap: 10,
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
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
});
