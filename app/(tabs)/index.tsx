import { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  FlatList,
  View,
  Animated,
  RefreshControl,
} from "react-native";
import { ApiClient } from "@/api/client";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import {
  Swipeable,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

export default function IndexScreen() {
  const colorScheme = useColorScheme();
  const [filter, setFilter] = useState("all");
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const {
    challenges,
    user,
    updateChallenge,
    updateChallengeStatus,
    updateChallengeCoach,
    deleteChallenge,
    archiveChallenge,
    setChallenges, // Added to update challenges state
  } = useAuth();

  const filteredChallenges = () => {
    let filtered = (challenges ?? []).filter((c) => c.status !== "rejected");

    if (filter === "archived") {
      return filtered.filter((c) => c.archived);
    }

    filtered = filtered.filter((c) => !c.archived);

    if (filter === "challenger") {
      return filtered.filter((c) => parseInt(c.user_id) === parseInt(user?.id));
    } else if (filter === "coaching") {
      return filtered.filter(
        (c) => parseInt(c.coach_id) === parseInt(user?.id),
      );
    }
    return filtered;
  };

  const allChallenges = filteredChallenges();

  const { getUnreadMessageCount } = useAuth();
  const getUnreadCount = (challenge) => {
    return getUnreadMessageCount(challenge.id);
  };

  const renderChallengeSection = (item) => {
    console.log("renderChallengeSection");
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Swipeable
          ref={(ref) => {
            if (ref && !rowRefs.has(item.id)) {
              rowRefs.set(item.id, ref);
            }
          }}
          friction={2}
          rightThreshold={40}
          renderRightActions={(progress, dragX) => (
            <View style={styles.swipeableButtons}>
              {parseInt(item.coach_id) === parseInt(user?.id) ? (
                <>
                  {item.status === "pending" && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.acceptButton]}
                        onPress={() => handleAcceptChallenge(item)}
                      >
                        <IconSymbol
                          name="checkmark.circle.fill"
                          size={24}
                          color="#fff"
                        />
                        <ThemedText style={styles.buttonText}>
                          Accept
                        </ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleRejectChallenge(item)}
                      >
                        <IconSymbol
                          name="xmark.circle.fill"
                          size={24}
                          color="#fff"
                        />
                        <ThemedText style={styles.buttonText}>
                          Reject
                        </ThemedText>
                      </TouchableOpacity>
                    </>
                  )}
                  {item.status === "active" && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.archiveButton]}
                      onPress={() => handleArchiveChallenge(item.id)}
                    >
                      <IconSymbol
                        name="tray.and.arrow.down.fill"
                        size={24}
                        color="#fff"
                      />
                      <ThemedText style={styles.buttonText}>Archive</ThemedText>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <>
                  {item.status === "pending" && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.changeCoachButton]}
                        onPress={() => handleChangeCoach(item.id, "newCoachId")}
                      >
                        <IconSymbol name="biceps" size={24} color="#fff" />
                        <ThemedText style={styles.buttonText}>
                          Change Coach
                        </ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeleteChallenge(item.id)}
                      >
                        <IconSymbol name="trash.fill" size={24} color="#fff" />
                        <ThemedText style={styles.buttonText}>
                          Delete
                        </ThemedText>
                      </TouchableOpacity>
                    </>
                  )}
                  {item.status === "active" && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.archiveButton]}
                      onPress={() => handleArchiveChallenge(item.id)}
                    >
                      <IconSymbol
                        name="tray.and.arrow.down.fill"
                        size={24}
                        color="#fff"
                      />
                      <ThemedText style={styles.buttonText}>Archive</ThemedText>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          )}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() =>
              router.push({
                pathname: "/chat",
                params: { challenge_id: item.id },
              })
            }
          >
            <ThemedView
              style={[
                styles.listItem,
                parseInt(user?.id) === item.coach_id
                  ? styles.coachingItem
                  : styles.challengeItem,
              ]}
            >
              <View style={styles.avatarContainer}>
                <View
                  style={[
                    styles.avatar,
                    parseInt(user?.id) === item.coach_id
                      ? styles.coachingAvatar
                      : styles.challengeAvatar,
                  ]}
                >
                  <ThemedText style={styles.avatarText}>
                    {item.title.charAt(0).toUpperCase()}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.contentContainer}>
                <View style={styles.titleContainer}>
                  <ThemedText style={styles.title}>{item.title}</ThemedText>
                  {getUnreadCount(item) > 0 && (
                    <View style={styles.badge}>
                      <ThemedText style={styles.badgeText}>
                        {getUnreadCount(item)}
                      </ThemedText>
                    </View>
                  )}
                </View>
                <View style={styles.previewRow}>
                  <ThemedText numberOfLines={1} style={styles.preview}>
                    {item.description || `Frequency: ${item.frequency}`}
                  </ThemedText>
                  {item.status === "pending" && (
                    <View style={styles.badge}>
                      <ThemedText style={styles.badgeText}>Pending</ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText style={styles.participantInfo}>
                  {parseInt(user?.id) === item.coach_id
                    ? `Challenger: User ${item.user_id}`
                    : `Coach: User ${item.coach_id}`}
                </ThemedText>
              </View>
            </ThemedView>
          </TouchableOpacity>
        </Swipeable>
      </GestureHandlerRootView>
    );
  };

  const rowRefs = new Map();

  const handleAcceptChallenge = async (challenge) => {
    try {
      await ApiClient.updateChallengeStatus(challenge.id, "active");
      const updatedChallenge = { ...challenge, status: "active" };
      await updateChallenge(updatedChallenge);
      rowRefs.get(challenge.id)?.close();
    } catch (error) {
      console.error("Error accepting challenge:", error);
    }
  };

  const handleRejectChallenge = async (challenge) => {
    try {
      await updateChallengeStatus(challenge.id, "rejected");
      rowRefs.get(challenge.id)?.close();
    } catch (error) {
      console.error("Error rejecting challenge:", error);
    }
  };

  const handleChangeCoach = async (challenge_id, newCoachId) => {
    try {
      await updateChallengeCoach(challenge_id, newCoachId);
      rowRefs.get(challenge_id)?.close();
    } catch (error) {
      console.error("Error changing coach:", error);
    }
  };

  const handleDeleteChallenge = async (challenge_id) => {
    try {
      await deleteChallenge(challenge_id);
      rowRefs.get(challenge_id)?.close();
    } catch (error) {
      console.error("Error deleting challenge:", error);
    }
  };

  const handleArchiveChallenge = async (challenge_id) => {
    try {
      await archiveChallenge(challenge_id);
      rowRefs.get(challenge_id)?.close();
    } catch (error) {
      console.error("Error archiving challenge:", error);
    }
  };

  const loadChallenges = async (userId) => {
    setRefreshing(true); // Set refreshing to true
    try {
      const challenges = await ApiClient.getChallenges(userId); // Replace with your API call
      setChallenges(challenges); // Update challenges state
    } catch (error) {
      console.error("Error loading challenges:", error);
    } finally {
      setRefreshing(false); // Set refreshing to false after API call
    }
  };

  const handleRefresh = useCallback(async () => {
    if (!user?.id) return;
    setRefreshing(true);
    try {
      const refreshedChallenges = await ApiClient.getChallenges(user.id);
      setChallenges(refreshedChallenges);
    } catch (error) {
      console.error('Error refreshing challenges:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user?.id, setChallenges]);

  useEffect(() => {
    if (user?.id) {
      loadChallenges(user.id);
    }
  }, [user]);


  const HeaderComponent = () => (
    <ThemedView style={styles.header}>
      <ThemedText style={styles.headerTitle}>Challenges</ThemedText>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "all" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("all")}
        >
          <ThemedText
            style={
              filter === "all" &&
              (colorScheme === "dark"
                ? styles.filterTextActive
                : styles.filterTextActiveLight)
            }
          >
            All
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "challenger" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("challenger")}
        >
          <ThemedText
            style={
              filter === "challenger" &&
              (colorScheme === "dark"
                ? styles.filterTextActive
                : styles.filterTextActiveLight)
            }
          >
            My Challenges
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "coaching" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("coaching")}
        >
          <ThemedText
            style={
              filter === "coaching" &&
              (colorScheme === "dark"
                ? styles.filterTextActive
                : styles.filterTextActiveLight)
            }
          >
            Coaching
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "archived" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("archived")}
        >
          <ThemedText
            style={
              filter === "archived" &&
              (colorScheme === "dark"
                ? styles.filterTextActive
                : styles.filterTextActiveLight)
            }
          >
            Archived
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        data={allChallenges}
        renderItem={({ item }) => renderChallengeSection(item)}
        ListHeaderComponent={HeaderComponent}
        onRefresh={handleRefresh}
        refreshing={refreshing} // Use refreshing state here
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  challengeAvatar: {
    backgroundColor: "", //"#FFEBEE",
    borderColor: "#F44336",
    borderWidth: 2,
  },
  coachingAvatar: {
    backgroundColor: "", //"#E3F2FD",
    borderColor: "#2196F3",
    borderWidth: 2,
  },
  challengeItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  coachingItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  typeLabel: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: "italic",
  },
  participantInfo: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E0E0E0",
    marginLeft: 76,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E8EAF6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "500",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  date: {
    fontSize: 12,
    opacity: 0.6,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  preview: {
    fontSize: 14,
    opacity: 0.6,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: "#FF4444",
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  typeLabel: {
    fontSize: 14,
    opacity: 0.8,
    fontStyle: "italic",
  },
  coachingCard: {
    borderColor: "#98D8A1",
    borderWidth: 2,
  },
  pendingCard: {
    borderStyle: "dashed",
  },
  activeCard: {
    borderStyle: "solid",
  },
  container: {
    flex: 1,
    gap: 20,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.15)",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: "row",
    gap: 10,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  filterButtonActive: {
    backgroundColor: "#F44336",
    borderColor: "#F44336",
  },
  filterTextActive: {
    color: "#fff",
  },
  filterTextActiveLight: {
    color: "#fff",
  },
  participantsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8,
  },
  participantText: {
    fontSize: 14,
    opacity: 0.9,
  },
  actionsContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
    paddingTop: 16,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
  },
  acceptButton: {
    backgroundColor: "rgba(76, 175, 80, 0.8)",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    height: "100%",
  },
  rejectButton: {
    backgroundColor: "rgba(244, 67, 54, 0.8)",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    height: "100%",
  },
  changeCoachButton: {
    backgroundColor: "rgba(33, 150, 243, 0.8)",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    height: "100%",
  },
  deleteButton: {
    backgroundColor: "rgba(244, 67, 54, 0.8)",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    height: "100%",
  },
  buttonText: {
    fontSize: 12,
    color: "#fff",
    textAlign: "center",
  },
  challengerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  createButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    width: 60,
    height: 60,
    borderRadius: 30,
    position: "absolute",
    bottom: 24,
    right: 24,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 1,
  },
  swipeableButtons: {
    flexDirection: "row",
    alignItems: "center",
    width: 200,
    gap: 8,
    paddingHorizontal: 8,
  },
  swipeButton: {
    flex: 1,
    height: 70,
    justifyContent: "center",
  },
  coachSection: {
    backgroundColor: "rgba(161, 206, 220, 0.15)",
    borderWidth: 1,
    borderColor: "#A1CEDC",
  },
  section: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  challengeCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  challengeTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 12,
    letterSpacing: 0.4,
    color: "#0a7ea4",
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
  },
  archiveButton: {
    backgroundColor: "rgba(128, 128, 128, 0.8)",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    height: "100%",
  },
});