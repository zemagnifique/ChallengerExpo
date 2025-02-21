import AsyncStorage from "@react-native-async-storage/async-storage";
import { Challenge, User, Notification } from "@/types";

export const StorageAPI = {
  // User operations
  getUser: async (): Promise<User | null> => {
    const user = await AsyncStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  setUser: async (user: User): Promise<void> => {
    await AsyncStorage.setItem("user", JSON.stringify(user));
  },

  removeUser: async (): Promise<void> => {
    await AsyncStorage.removeItem("user");
  },

  // Challenge operations
  getChallenges: async (): Promise<Challenge[]> => {
    const challenges = await AsyncStorage.getItem("challenges");
    return challenges ? JSON.parse(challenges) : [];
  },

  saveChallenges: async (challenges: Challenge[]): Promise<void> => {
    await AsyncStorage.setItem("challenges", JSON.stringify(challenges));
  },

  addChallenge: async (challenge: Challenge): Promise<void> => {
    const challenges = await StorageAPI.getChallenges();
    challenges.push(challenge);
    await StorageAPI.saveChallenges(challenges);
  },

  updateChallenge: async (challenge: Challenge): Promise<void> => {
    const challenges = await StorageAPI.getChallenges();
    const index = challenges.findIndex((c) => c.id === challenge.id);
    if (index !== -1) {
      challenges[index] = challenge;
      await StorageAPI.saveChallenges(challenges);
    }
  },

  deleteChallenge: async (challengeId: string): Promise<void> => {
    const challenges = await StorageAPI.getChallenges();
    const filtered = challenges.filter((c) => c.id !== challengeId);
    await StorageAPI.saveChallenges(filtered);
  },

  // Notification operations
  getNotifications: async (): Promise<Notification[]> => {
    const notifications = await AsyncStorage.getItem("notifications");
    return notifications ? JSON.parse(notifications) : [];
  },

  saveNotifications: async (notifications: Notification[]): Promise<void> => {
    await AsyncStorage.setItem("notifications", JSON.stringify(notifications));
  },

  addNotification: async (notification: Notification): Promise<void> => {
    const notifications = await StorageAPI.getNotifications();
    notifications.unshift(notification);
    await StorageAPI.saveNotifications(notifications);
  },

  markNotificationAsRead: async (notificationId: string): Promise<void> => {
    const notifications = await StorageAPI.getNotifications();
    const updated = notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n,
    );
    await StorageAPI.saveNotifications(updated);
  },
};
