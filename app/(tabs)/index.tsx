import { useState, useCallback, useEffect } from "react";
import {
  TouchableOpacity,
  FlatList,
  View,
  Animated,
  RefreshControl,
  ScrollView,
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
    setChallenges,
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
                        <ThemedText style={styles.defaultButtonText}>
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
                        <ThemedText style={styles.defaultButtonText}>
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
                      <ThemedText style={styles.defaultButtonText}>
                        Archive
                      </ThemedText>
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
                        <ThemedText style={styles.defaultButtonText}>
                          Change Coach
                        </ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeleteChallenge(item.id)}
                      >
                        <IconSymbol name="trash.fill" size={24} color="#fff" />
                        <ThemedText style={styles.defaultButtonText}>
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
                      <ThemedText style={styles.defaultButtonText}>
                        Archive
                      </ThemedText>
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
                  {parseInt(user?.id) === parseInt(item.coach_id)
                    ? `Challenger: ${item.username}`
                    : `Coach: ${item.coachUsername}`}
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
    setRefreshing(true);
    try {
      const challenges = await ApiClient.getChallenges(userId);
      setChallenges(challenges);
    } catch (error) {
      console.error("Error loading challenges:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    if (!user?.id) return;
    setRefreshing(true);
    try {
      const refreshedChallenges = await ApiClient.getChallenges(user.id);
      refreshedChallenges.forEach((challenge) => {
        updateChallenge(challenge);
      });
    } catch (error) {
      console.error("Error refreshing challenges:", error);
    } finally {
      setRefreshing(false);
    }
  }, [user?.id, updateChallenge]);

  useEffect(() => {
    if (user?.id) {
      loadChallenges(user.id);
    }
  }, [user]);

  const HeaderComponent = () => (
    <ThemedView style={styles.globalHeader}>
      <ThemedText style={styles.headerTitle}>Challenges</ThemedText>
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal={true}
          style={styles.filterContentContainer}
          showsHorizontalScrollIndicator={false}
        >
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
        </ScrollView>
      </View>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.baseContainer}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        data={allChallenges}
        renderItem={({ item }) => renderChallengeSection(item)}
        ListHeaderComponent={HeaderComponent}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        headerImage={<></>}
      />
    </ThemedView>
  );
}

import { GlobalStyles } from "@/constants/Styles";
const styles = GlobalStyles;
