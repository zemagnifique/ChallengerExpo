import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/contexts/AuthContext";

export default function UserScreen() {
  const { user, logout, notifications, markNotificationAsRead } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const { login } = useAuth();

  const switchUser = async (user_id: string) => {
    await logout();
    const success = await login(user_id, user_id);
    if (!success) {
      console.error("Failed to switch user");
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <ThemedView style={styles.userContainer}>
      <ThemedText style={styles.username}>Profile: {user?.username}</ThemedText>

      <ThemedView style={styles.testControls}>
        <ThemedText type="subtitle">Test Controls</ThemedText>
        <TouchableOpacity
          style={styles.userButton}
          onPress={() => switchUser("user1")}
        >
          <ThemedText style={styles.userButtonText}>
            Switch to User 1
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.userButton}
          onPress={() => switchUser("user2")}
        >
          <ThemedText style={styles.userButtonText}>
            Switch to User 2
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <TouchableOpacity
        style={[styles.userButton, styles.logoutButton]}
        onPress={handleLogout}
      >
        <ThemedText style={styles.userButtonText}>Logout</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

import { GlobalStyles } from "@/constants/Styles";
const styles = GlobalStyles;