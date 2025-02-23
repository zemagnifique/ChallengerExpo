import { useState, useCallback, useEffect } from "react";
import { TouchableOpacity, View, ScrollView } from "react-native";
import { ApiClient } from "@/api/client";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { ChallengeItem } from "@/components/ChallengeItem";
import { GlobalStyles as styles } from "@/constants/Styles";

export default function IndexScreen() {
  const colorScheme = useColorScheme();
  const [filter, setFilter] = useState("all");
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const {
    challenges,
    user,
    updateChallengeStatus,
    updateChallengeCoach,
    deleteChallenge,
    archiveChallenge,
    updateChallenge,
    setChallenges,
  } = useAuth();

  // Load challenges on mount using updateChallenge so that merge logic preserves username fields.
  const loadChallenges = async (userId: string) => {
    setRefreshing(true);
    try {
      const fetchedChallenges = await ApiClient.getChallenges(userId);
      fetchedChallenges.forEach((challenge) => {
        updateChallenge(challenge);
      });
    } catch (error) {
      console.error("Error loading challenges:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadChallenges(user.id);
    }
  }, [user]);

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
  const getUnreadCount = (challenge) => getUnreadMessageCount(challenge.id);

  // Handlers for swipeable actions passed to ChallengeItem
  const handleAcceptChallenge = async (challenge) => {
    try {
      await ApiClient.updateChallengeStatus(challenge.id, "active");
      const updatedChallenge = { ...challenge, status: "active" };
      await updateChallenge(updatedChallenge);
    } catch (error) {
      console.error("Error accepting challenge:", error);
    }
  };

  const handleRejectChallenge = async (challenge) => {
    try {
      await updateChallengeStatus(challenge.id, "rejected");
    } catch (error) {
      console.error("Error rejecting challenge:", error);
    }
  };

  const handleChangeCoach = async (challenge_id, newCoachId) => {
    try {
      await updateChallengeCoach(challenge_id, newCoachId);
    } catch (error) {
      console.error("Error changing coach:", error);
    }
  };

  const handleDeleteChallenge = async (challenge_id) => {
    try {
      await deleteChallenge(challenge_id);
    } catch (error) {
      console.error("Error deleting challenge:", error);
    }
  };

  const handleArchiveChallenge = async (challenge_id) => {
    try {
      await archiveChallenge(challenge_id);
    } catch (error) {
      console.error("Error archiving challenge:", error);
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
        renderItem={({ item }) => (
          <ChallengeItem
            item={item}
            getUnreadCount={getUnreadCount}
            onAccept={handleAcceptChallenge}
            onReject={handleRejectChallenge}
            onChangeCoach={handleChangeCoach}
            onDelete={handleDeleteChallenge}
            onArchive={handleArchiveChallenge}
          />
        )}
        ListHeaderComponent={HeaderComponent}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        headerImage={<></>}
      />
    </ThemedView>
  );
}
