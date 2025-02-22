import { StyleSheet, TouchableOpacity } from "react-native";
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
    <ThemedView style={styles.container}>
      <ThemedText type="title">Profile: {user?.username}</ThemedText>

      <ThemedView style={styles.notificationsContainer}>
        <ThemedText type="subtitle">Notifications</ThemedText>
        {notifications.length === 0 ? (
          <ThemedText>No notifications</ThemedText>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notification,
                notification.read && styles.notificationRead,
              ]}
              onPress={() => markNotificationAsRead(notification.id)}
            >
              <ThemedText style={styles.notificationText}>
                {notification.message}
              </ThemedText>
              <ThemedText style={styles.notificationDate}>
                {new Date(notification.createdAt).toLocaleDateString()}
              </ThemedText>
            </TouchableOpacity>
          ))
        )}
      </ThemedView>

      <ThemedView style={styles.testControls}>
        <ThemedText type="subtitle">Test Controls</ThemedText>
        <TouchableOpacity
          style={styles.button}
          onPress={() => switchUser("user1")}
        >
          <ThemedText style={styles.buttonText}>Switch to User 1</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => switchUser("user2")}
        >
          <ThemedText style={styles.buttonText}>Switch to User 2</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    username: {
      fontSize: 24,
      marginVertical: 10,
    },
    button: {
      backgroundColor: '#4CAF50',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    logoutButton: {
      backgroundColor: '#F44336',
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    notificationsContainer: {
      marginTop: 20,
      gap: 10,
    },
    notification: {
      padding: 15,
      borderRadius: 8,
      backgroundColor: "rgba(255,255,255,0.1)",
      marginVertical: 5,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.15)",
    },
    notificationRead: {
      opacity: 0.6,
    },
    notificationText: {
      fontSize: 16,
      marginBottom: 5,
    },
    notificationDate: {
      fontSize: 12,
      opacity: 0.7,
    },
  });
