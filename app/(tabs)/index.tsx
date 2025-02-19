
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
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 24,
  },
  section: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  createButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    width: 60,
    height: 60,
    borderRadius: 30,
    position: 'absolute',
    bottom: 24,
    right: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 1,
  },
  challengeCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
});
