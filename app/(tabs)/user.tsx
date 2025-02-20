import { StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';

export default function UserScreen() {
  const { user, logout, notifications, markNotificationAsRead } = useAuth();
  const router = useRouter();

  const { login } = useAuth();

  const switchUser = async (userId: string) => {
    await logout();
    const success = await login(userId, userId);
    if (!success) {
      console.error('Failed to switch user');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Profile</ThemedText>
      <ThemedText style={[styles.username, { color: Colors[colorScheme].text }]}>{user?.username}</ThemedText>

      <ThemedView style={styles.notificationsContainer}>
        <ThemedText type="subtitle">Notifications</ThemedText>
        {notifications.length === 0 ? (
          <ThemedText>No notifications</ThemedText>
        ) : (
          notifications.map(notification => (
            <TouchableOpacity
              key={notification.id}
              style={[styles.notification, notification.read && styles.notificationRead]}
              onPress={() => markNotificationAsRead(notification.id)}>
              <ThemedText style={styles.notificationText}>{notification.message}</ThemedText>
              <ThemedText style={styles.notificationDate}>
                {new Date(notification.createdAt).toLocaleDateString()}
              </ThemedText>
            </TouchableOpacity>
          ))
        )}
      </ThemedView>

      <ThemedView style={styles.testControls}>
        <ThemedText type="subtitle">Test Controls</ThemedText>
        <TouchableOpacity style={styles.button} onPress={() => switchUser('user1')}>
          <ThemedText style={styles.buttonText}>Switch to User 1</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => switchUser('user2')}>
          <ThemedText style={styles.buttonText}>Switch to User 2</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <ThemedText style={styles.buttonText}>Logout</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  testControls: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    gap: 10,
  },
  logoutButton: {
    backgroundColor: '#ff6b6b',
  },
  container: {
    flex: 1,
    padding: 20,
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
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
    backgroundColor: '#ff6b6b',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});