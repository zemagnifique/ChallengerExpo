import { StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/Colors";
import { useState } from 'react';

export default function UserScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [filter, setFilter] = useState("all");
  const colorScheme = useColorScheme();
  const { user, logout: userLogout, notifications, markNotificationAsRead } = useAuth();

  const { login } = useAuth();

  const switchUser = async (user_id: string) => {
    await userLogout();
    const success = await login(user_id, user_id);
    if (!success) {
      console.error("Failed to switch user");
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const HeaderComponent = () => (
    <ThemedView style={styles.header}>
      <ThemedText style={styles.headerTitle}>Profile</ThemedText>
      <View style={styles.filterContainer}>
        <ScrollView horizontal={true} style={styles.filterContentContainer} showsHorizontalScrollIndicator={false}>
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
              filter === "completed" && styles.filterButtonActive,
            ]}
            onPress={() => setFilter("completed")}
          >
            <ThemedText
              style={
                filter === "completed" &&
                (colorScheme === "dark"
                  ? styles.filterTextActive
                  : styles.filterTextActiveLight)
              }
            >
              Completed
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "settings" && styles.filterButtonActive,
            ]}
            onPress={() => setFilter("settings")}
          >
            <ThemedText
              style={
                filter === "settings" &&
                (colorScheme === "dark"
                  ? styles.filterTextActive
                  : styles.filterTextActiveLight)
              }
            >
              Settings
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <HeaderComponent />
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

      <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={handleLogout}
      >
        <ThemedText style={styles.buttonText}>Logout</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 16,
  },
  filterContainer: {
    marginTop: 10,
  },
  filterContentContainer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 10,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
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
  username: {
    fontSize: 24,
    marginVertical: 10,
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
  button: {
    backgroundColor: "#F44336",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  testControls: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    gap: 10,
  },
  logoutButton: {
    backgroundColor: "#F44336",
  },
});