import { StyleSheet, TouchableOpacity, FlatList, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function IndexScreen() {
  const router = useRouter();
  const { challenges, user, updateChallengeStatus, updateChallengeCoach } = useAuth();

  const filteredChallenges = () => {
    if (filter === 'challenger') {
      return {
        pendingChallenges: challenges.filter(c => c.status === 'pending' && c.userId === user?.id),
        activeChallenges: challenges.filter(c => c.status === 'active' && c.userId === user?.id),
        coachPendingRequests: [],
        coachActiveRequests: []
      };
    } else if (filter === 'coaching' && user?.role === 'coach') {
      return {
        pendingChallenges: [],
        activeChallenges: [],
        coachPendingRequests: challenges.filter(c => c.status === 'pending' && c.coachId === user?.id),
        coachActiveRequests: challenges.filter(c => c.status === 'active' && c.coachId === user?.id)
      };
    } else {
      return {
        pendingChallenges: challenges.filter(c => c.status === 'pending' && c.userId === user?.id),
        activeChallenges: challenges.filter(c => c.status === 'active' && c.userId === user?.id),
        coachPendingRequests: user?.role === 'coach' 
          ? challenges.filter(c => c.status === 'pending' && c.coachId === user?.id)
          : [],
        coachActiveRequests: user?.role === 'coach'
          ? challenges.filter(c => c.status === 'active' && c.coachId === user?.id)
          : []
      };
    }
  };

  const {
    pendingChallenges,
    activeChallenges,
    coachPendingRequests,
    coachActiveRequests
  } = filteredChallenges();

  const renderChallengeSection = (title, items, isCoachSection = false) => (
    <ThemedView style={[styles.section, isCoachSection && styles.coachSection]}>
      <ThemedText type="subtitle">{title}</ThemedText>
      {items.length === 0 ? (
        <ThemedText>No {title.toLowerCase()}</ThemedText>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.createdAt.toString()}
          renderItem={({ item }) => (
            <View>
              <ThemedView style={styles.challengeCard}>
                <ThemedText style={styles.challengeTitle}>{item.title}</ThemedText>
                <View style={styles.participantsContainer}>
                  <ThemedText style={styles.participantText}>Challenger: {item.userId}</ThemedText>
                  <ThemedText style={styles.participantText}>Coach: {item.coachId}</ThemedText>
                </View>
                <ThemedText>{item.description}</ThemedText>
                <ThemedText>Frequency: {item.frequency}</ThemedText>
                <View style={styles.dateContainer}>
                  <ThemedText>Start: {new Date(item.startDate).toLocaleDateString()}</ThemedText>
                  <ThemedText>End: {new Date(item.endDate).toLocaleDateString()}</ThemedText>
                </View>
                
                {item.status === 'pending' && (
                  <View style={styles.actionsContainer}>
                    {user?.role === 'coach' && item.coachId === user.id && (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.acceptButton]} 
                          onPress={() => handleAcceptChallenge(item)}>
                          <ThemedText style={styles.buttonText}>Accept</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.rejectButton]}
                          onPress={() => handleRejectChallenge(item)}>
                          <ThemedText style={styles.buttonText}>Reject</ThemedText>
                        </TouchableOpacity>
                      </View>
                    )}
                    {user?.role === 'user' && item.userId === user.id && item.status === 'pending' && (
                      <View style={styles.challengerActions}>
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.changeCoachButton]}
                          onPress={() => handleChangeCoach(item.id, 'newCoachId')}>
                          <ThemedText style={styles.buttonText}>Change Coach</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.deleteButton]}
                          onPress={() => handleDeleteChallenge(item.id)}>
                          <ThemedText style={styles.buttonText}>Delete</ThemedText>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </ThemedView>
            </View>
          )}
          scrollEnabled={false}
        />
      )}
    </ThemedView>
  );

  const handleAcceptChallenge = async (challenge) => {
    try {
      await updateChallengeStatus(challenge.id, 'active');
    } catch (error) {
      console.error("Error accepting challenge:", error);
    }
  };

  const handleRejectChallenge = async (challenge) => {
    try {
      await updateChallengeStatus(challenge.id, 'rejected');
    } catch (error) {
      console.error("Error rejecting challenge:", error);
    }
  };

  const handleChangeCoach = async (challengeId, newCoachId) => {
    try {
      await updateChallengeCoach(challengeId, newCoachId);
    } catch (error) {
      console.error("Error changing coach:", error);
    }
  };

  const handleDeleteChallenge = async (challengeId) => {
    try {
      await deleteChallenge(challengeId);
    } catch (error) {
      console.error("Error deleting challenge:", error);
    }
  };


  const [filter, setFilter] = useState('all');

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.headerTitle}>Challenges</ThemedText>
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]} 
            onPress={() => setFilter('all')}>
            <ThemedText style={filter === 'all' && styles.filterTextActive}>All</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'challenger' && styles.filterButtonActive]}
            onPress={() => setFilter('challenger')}>
            <ThemedText style={filter === 'challenger' && styles.filterTextActive}>My Challenges</ThemedText>
          </TouchableOpacity>
          {user?.role === 'coach' && (
            <TouchableOpacity 
              style={[styles.filterButton, filter === 'coaching' && styles.filterButtonActive]}
              onPress={() => setFilter('coaching')}>
              <ThemedText style={filter === 'coaching' && styles.filterTextActive}>Coaching</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </ThemedView>
      <ThemedView style={styles.container}>
        {/* Challenger's view */}
        {renderChallengeSection('My Pending Challenges', pendingChallenges)}
        {renderChallengeSection('My Active Challenges', activeChallenges)}
        
        {/* Coach's view */}
        {user?.role === 'coach' && (
          <>
            {renderChallengeSection('Pending Coaching Requests', coachPendingRequests, true)}
            {renderChallengeSection('Active Coaching Sessions', coachActiveRequests, true)}
          </>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 20,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterTextActive: {
    color: '#fff',
  },
  participantsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  participantText: {
    fontSize: 14,
    opacity: 0.9,
  },
  actionsContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  changeCoachButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  challengerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  coachSection: {
    backgroundColor: 'rgba(161, 206, 220, 0.15)', // Light blue tint
    borderWidth: 1,
    borderColor: '#A1CEDC',
  },
  section: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  challengeCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  challengeTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 0.4,
    color: '#0a7ea4',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  actionButton: {
    padding: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  changeCoachButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  challengerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 10,
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
});