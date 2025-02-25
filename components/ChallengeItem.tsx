import React from "react";
import { TouchableOpacity, View } from "react-native";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { GlobalStyles as styles } from "@/constants/Styles";

interface ChallengeItemProps {
  item: any; // Replace 'any' with your Challenge type if available
  getUnreadCount: (challenge: any) => number;
  onAccept?: (challenge: any) => void;
  onReject?: (challenge: any) => void;
  onChangeCoach?: (challengeId: string, newCoachId: string) => void;
  onDelete?: (challengeId: string) => void;
  onArchive?: (challengeId: string) => void;
}

export const ChallengeItem: React.FC<ChallengeItemProps> = ({
  item,
  getUnreadCount,
  onAccept,
  onReject,
  onChangeCoach,
  onDelete,
  onArchive,
}) => {
  const { user } = useAuth();
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: "/chat",
      params: { challenge_id: item.id },
    });
  };

  const usernameStyle = [styles.username];
  const displayedUsername =
    parseInt(user?.id) === parseInt(item.coach_id)
      ? item.username
      : item.coachUsername;
  const isDisplayedUserCoach = displayedUsername === item.coachUsername;

  if (isDisplayedUserCoach) {
    usernameStyle.push(styles.coachUsername); // Blue for coach
  } else {
    usernameStyle.push(styles.challengerUsername); // Red for challenger
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Swipeable
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
                      onPress={() => onAccept && onAccept(item)}
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
                      onPress={() => onReject && onReject(item)}
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
                    onPress={() => onArchive && onArchive(item.id)}
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
                      onPress={() =>
                        onChangeCoach && onChangeCoach(item.id, "newCoachId")
                      }
                    >
                      <IconSymbol name="biceps" size={24} color="#fff" />
                      <ThemedText style={styles.defaultButtonText}>
                        Change Coach
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => onDelete && onDelete(item.id)}
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
                    onPress={() => onArchive && onArchive(item.id)}
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
        <TouchableOpacity activeOpacity={1} onPress={handlePress}>
          <ThemedView
            style={[
              styles.listItem,
              parseInt(user?.id) === parseInt(item.coach_id)
                ? styles.coachingItem
                : styles.challengeItem,
              getUnreadCount(item) > 0 && styles.unreadItem,
              item.status === "pending" && styles.pendingItem,
            ]}
          >
            <View style={styles.avatarContainer}>
              <View
                style={[
                  styles.avatar,
                  parseInt(user?.id) === parseInt(item.coach_id)
                    ? styles.coachingAvatar
                    : styles.challengeAvatar,
                ]}
              >
                <ThemedText style={styles.avatarText}>
                  {item.title.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
              <View style={styles.challengesUsernameContainer}>
                <ThemedText style={usernameStyle} numberOfLines={1}>
                  {parseInt(user?.id) === parseInt(item.coach_id)
                    ? item.username
                    : item.coachUsername}
                </ThemedText>
              </View>
            </View>
            <View style={styles.contentContainer}>
              <View style={styles.titleContainer}>
                <ThemedText style={styles.title}>{item.title}</ThemedText>
                {item.status === "pending" && (
                  <View style={styles.pendingbadge}>
                    <ThemedText style={styles.badgeText}>Pending</ThemedText>
                  </View>
                )}
                {getUnreadCount(item) > 0 && (
                  <View style={styles.badge}>
                    <ThemedText style={styles.badgeText}>
                      {getUnreadCount(item)}
                    </ThemedText>
                  </View>
                )}
              </View>
              <ThemedText numberOfLines={1} style={styles.preview}>
                {item.description || `Frequency: ${item.frequency}`}
              </ThemedText>
              <View style={styles.previewRow}>
                <ThemedText numberOfLines={1} style={styles.preview}>
                  {item.messages && item.messages.length > 0
                    ? item.messages[item.messages.length - 1].text
                    : ""}
                </ThemedText>
              </View>
            </View>
          </ThemedView>
        </TouchableOpacity>
      </Swipeable>
    </GestureHandlerRootView>
  );
};
