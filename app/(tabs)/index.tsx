import { useState } from 'react';
import { StyleSheet, TouchableOpacity, FlatList, View, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';

export default function IndexScreen() {
  const [filter, setFilter] = useState('all');
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
    } else if (filter === 'coaching') {
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
        coachPendingRequests: challenges.filter(c => c.status === 'pending' && c.coachId === user?.id),
        coachActiveRequests: challenges.filter(c => c.status === 'active' && c.coachId === user?.id)
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
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item }) => (
            <Swipeable
              renderRightActions={(progress, dragX) => {
                const trans = dragX.interpolate({
                  inputRange: [-100, 0],
                  outputRange: [0, 100],
                });
                const isCoaching = item.coachId === user?.id;
                return (
                  <View style={styles.swipeableButtons}>
                    {item.status === 'pending' && (
                      <View>
                        {isCoaching ? (
                          <>
                            <Animated.View style={[styles.swipeButton, { transform: [{ translateX: trans }] }]}>
                              <TouchableOpacity
                                style={[styles.actionButton, styles.acceptButton]}
                                onPress={() => handleAcceptChallenge(item)}>
                                <IconSymbol name="checkmark.circle.fill" size={24} color="#fff" />
                                <ThemedText style={styles.buttonText}>Accept</ThemedText>
                              </TouchableOpacity>
                            </Animated.View>
                            <Animated.View style={[styles.swipeButton, { transform: [{ translateX: trans }] }]}>
                              <TouchableOpacity
                                style={[styles.actionButton, styles.rejectButton]}
                                onPress={() => handleRejectChallenge(item)}>
                                <IconSymbol name="xmark.circle.fill" size={24} color="#fff" />
                                <ThemedText style={styles.buttonText}>Reject</ThemedText>
                              </TouchableOpacity>
                            </Animated.View>
                          </>
                        ) : (
                          <Animated.View style={[styles.swipeButton, { transform: [{ translateX: trans }] }]}>
                            <TouchableOpacity
                              style={[styles.actionButton, styles.changeCoachButton]}
                              onPress={() => handleChangeCoach(item.id, 'newCoachId')}>
                                <IconSymbol name="biceps" size={24} color="#fff" />
                                <ThemedText style={styles.buttonText}>Change Coach</ThemedText>
                            </TouchableOpacity>
                          </Animated.View>
                        )}
                        <Animated.View style={[styles.swipeButton, { transform: [{ translateX: trans }] }]}>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={() => handleDeleteChallenge(item.id)}>
                            <IconSymbol name="trash.fill" size={24} color="#fff" />
                            <ThemedText style={styles.buttonText}>Delete</ThemedText>
                          </TouchableOpacity>
                        </Animated.View>
                      </View>
                    )}
                  </View>
                );
              }}
            >
              <View style={styles.listItem}>
                <View style={styles.avatarContainer}>
                  <View style={[styles.avatar, item.coachId === user?.id ? styles.coachingAvatar : styles.challengeAvatar]}>
                    <ThemedText style={styles.avatarText}>
                      {item.title.charAt(0).toUpperCase()}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.contentContainer}>
                  <View style={styles.titleRow}>
                    <ThemedText style={styles.title}>
                      {item.title}
                      <ThemedText style={styles.typeLabel}>
                        {item.coachId === user?.id ? ' (Coaching)' : ' (Challenge)'}
                      </ThemedText>
                    </ThemedText>
                    <ThemedText style={styles.date}>
                      {new Date(item.startDate).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <View style={styles.previewRow}>
                    <ThemedText numberOfLines={1} style={styles.preview}>
                      {item.description || `Frequency: ${item.frequency}`}
                    </ThemedText>
                    {item.status === 'pending' && (
                      <View style={styles.badge}>
                        <ThemedText style={styles.badgeText}>Pending</ThemedText>
                      </View>
                    )}
                  </View>
                  <ThemedText style={styles.participantInfo}>
                    {item.coachId === user?.id
                      ? `Challenger: ${item.userId}`
                      : `Coach: ${item.coachId}`}
                  </ThemedText>
                </View>
              </View>
            </Swipeable>
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
      // Assuming deleteChallenge function exists in your useAuth context
      await deleteChallenge(challengeId); 
    } catch (error) {
      console.error("Error deleting challenge:", error);
    }
  };


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
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'coaching' && styles.filterButtonActive]}
            onPress={() => setFilter('coaching')}>
            <ThemedText style={filter === 'coaching' && styles.filterTextActive}>Coaching</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
      <ThemedView style={styles.container}>
        <FlatList
          data={[...pendingChallenges, ...activeChallenges, ...coachPendingRequests, ...coachActiveRequests]}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <GestureHandlerRootView style={{ flex: 1 }}>
              <Swipeable
                friction={2}
                rightThreshold={40}
                renderRightActions={(progress, dragX) => (
                  <View style={styles.swipeableButtons}>
                    {item.coachId === user?.id ? (
                      <>
                        {item.status === 'pending' && (
                          <>
                            <TouchableOpacity
                              style={[styles.actionButton, styles.acceptButton]}
                              onPress={() => handleAcceptChallenge(item)}>
                              <IconSymbol name="checkmark.circle.fill" size={24} color="#fff" />
                              <ThemedText style={styles.buttonText}>Accept</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.actionButton, styles.rejectButton]}
                              onPress={() => handleRejectChallenge(item)}>
                              <IconSymbol name="xmark.circle.fill" size={24} color="#fff" />
                              <ThemedText style={styles.buttonText}>Reject</ThemedText>
                            </TouchableOpacity>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        {item.status === 'pending' && (
                          <>
                            <TouchableOpacity
                              style={[styles.actionButton, styles.changeCoachButton]}
                              onPress={() => handleChangeCoach(item.id, 'newCoachId')}>
                              <IconSymbol name="biceps" size={24} color="#fff" />
                              <ThemedText style={styles.buttonText}>Change Coach</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.actionButton, styles.deleteButton]}
                              onPress={() => handleDeleteChallenge(item.id)}>
                              <IconSymbol name="trash.fill" size={24} color="#fff" />
                              <ThemedText style={styles.buttonText}>Delete</ThemedText>
                            </TouchableOpacity>
                          </>
                        )}
                      </>
                    )}
                  </View>
                )}
              >
                <TouchableOpacity 
                  activeOpacity={1}
                  onPress={() => router.push(`/chat?challengeId=${item.id}`)}
                >
                  <ThemedView style={[
                styles.listItem,
                item.coachId === user?.id ? styles.coachingItem : styles.challengeItem,
              ]}>
                <View style={styles.avatarContainer}>
                  <View style={[styles.avatar, item.coachId === user?.id ? styles.coachingAvatar : styles.challengeAvatar]}>
                    <ThemedText style={styles.avatarText}>
                      {item.title.charAt(0).toUpperCase()}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.contentContainer}>
                  <View style={styles.titleRow}>
                    <ThemedText style={styles.title}>
                      {item.title}
                      <ThemedText style={styles.typeLabel}>
                        {item.coachId === user?.id ? ' (Coaching)' : ' (Challenge)'}
                      </ThemedText>
                    </ThemedText>
                    <ThemedText style={styles.date}>
                      {new Date(item.startDate).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <View style={styles.previewRow}>
                    <ThemedText numberOfLines={1} style={styles.preview}>
                      {item.description || `Frequency: ${item.frequency}`}
                    </ThemedText>
                    {item.status === 'pending' && (
                      <View style={styles.badge}>
                        <ThemedText style={styles.badgeText}>Pending</ThemedText>
                      </View>
                    )}
                  </View>
                  <ThemedText style={styles.participantInfo}>
                    {item.coachId === user?.id 
                      ? `Challenger: ${item.userId}`
                      : `Coach: ${item.coachId}`}
                  </ThemedText>
                </View>
              </ThemedView>
            </TouchableOpacity>
          </Swipeable>
        </GestureHandlerRootView>
          )}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  challengeAvatar: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  coachingAvatar: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  challengeItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  coachingItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  typeLabel: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  participantInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E0E0E0',
    marginLeft: 76,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8EAF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preview: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#2E7D32',
  },
  typeLabel: {
    fontSize: 14,
    opacity: 0.8,
    fontStyle: 'italic',
  },
  coachingCard: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  pendingCard: {
    borderStyle: 'dashed',
  },
  activeCard: {
    borderStyle: 'solid',
  },
  container: {
    flex: 1,
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
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    gap: 4,
    paddingVertical: 8,
  },
  acceptButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  rejectButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  changeCoachButton: {
    backgroundColor: 'rgba(33, 150, 243, 0.8)',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  deleteButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  buttonText: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  challengerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  swipeableButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 200,
    gap: 8,
    paddingHorizontal: 8,
  },
  swipeButton: {
    flex: 1,
    height: 70,
    justifyContent: 'center',
  },
  coachSection: {
    backgroundColor: 'rgba(161, 206, 220, 0.15)', 
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

});