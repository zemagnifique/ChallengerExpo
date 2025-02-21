import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";
import { ApiClient } from "@/api/client";
import { User, Challenge, Notification } from "@/types";

type User = {
  id: string;
  username: string;
};

type Notification = {
  id: string;
  message: string;
  read: boolean;
  createdAt: Date;
};

type Challenge = {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  frequency: string;
  proofRequirements: string;
  status: string;
  user_id: string;
  coachId: string;
  createdAt: Date;
  messages?: Array<{
    text: string;
    user_id: string;
    timestamp: Date;
    read: boolean; // Added read status to messages
  }>;
  archived?: boolean; // Added archived field
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  challenges: Challenge[];
  notifications: Notification[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  getCoaches: () => User[];
  addChallenge: (challenge: Challenge) => void;
  addNotification: (message: string) => void;
  markNotificationAsRead: (id: string) => void;
  updateChallenge: (challenge: Challenge) => void;
  updateChallengeStatus: (challenge_id: string, status: string) => void;
  updateChallengeCoach: (
    challenge_id: string,
    newCoachId: string,
  ) => Promise<void>;
  deleteChallenge: (challenge_id: string) => Promise<void>;
  archiveChallenge: (challenge_id: string) => void; // Added archiveChallenge method
  getUnreadMessageCount: (challenge_id: string) => number;
  markMessagesAsRead: (challenge_id: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => false,
  logout: async () => {},
  getCoaches: () => [],
  addChallenge: () => {},
  addNotification: () => {},
  markNotificationAsRead: () => {},
  updateChallenge: () => {},
  updateChallengeStatus: () => {},
  updateChallengeCoach: async () => {},
  deleteChallenge: async () => {},
  getUnreadMessageCount: () => 0,
  markMessagesAsRead: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadChallenges();

      // Setup WebSocket connection
      const socket = io(ApiClient.getApiUrl(), {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
      });

      socket.on("connect", () => {
        console.log("Connected to main WebSocket");
        // Join all challenge rooms
        challenges.forEach((challenge) => {
          socket.emit("joinRoom", challenge.id);
        });
      });

      socket.on("updateMessages", async (messages) => {
        if (!messages || !messages.length) return;
        console.log("TEST updateMessages Auth");
        console.log(messages[0].challenge_id);
        const challenge_id = messages[0].challenge_id;
        try {
          // Fetch fresh messages from the database
          const updatedMessages = await ApiClient.getMessages(challenge_id);

          setChallenges((currentChallenges) =>
            currentChallenges.map((challenge) => {
              console.log("setChallenges");
              console.log(currentChallenges);
              if (challenge.id === challenge_id) {
                return {
                  ...challenge,
                  messages: updatedMessages.map((msg) => ({
                    ...msg,
                    is_read: msg.is_read,
                    timestamp: new Date(msg.created_at),
                  })),
                };
              }
              return challenge;
            }),
          );
        } catch (error) {
          console.error("Error fetching updated messages:", error);
        }
      });

      socket.on("messagesRead", ({ challenge_id, user_id }) => {
        if (user_id !== user.id) {
          setChallenges((currentChallenges) =>
            currentChallenges.map((challenge) => {
              if (challenge.id === challenge_id) {
                return {
                  ...challenge,
                  messages: challenge.messages?.map((msg) => ({
                    ...msg,
                    is_read: msg.user_id === user_id ? true : msg.is_read,
                  })),
                };
              }
              return challenge;
            }),
          );
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  const checkAuth = async () => {
    const storedUser = await AsyncStorage.getItem("user");
    if (storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const userData = await ApiClient.login(username, password);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      setIsAuthenticated(true);
      setUser(userData);
      await loadChallenges();
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    setChallenges([]);
  };
  //DELETE
  const TEST_USERS = {
    user1: { id: "1", username: "user1", isCoach: false },
    user2: { id: "2", username: "user2", isCoach: true },
  };
  //DELETE
  const getCoaches = () => {
    return Object.values(TEST_USERS)
      .filter((user) => user.isCoach)
      .map((user) => ({ id: user.id, username: user.username }));
  };

  const addChallenge = async (challenge: Challenge) => {
    try {
      const newChallenge = await ApiClient.createChallenge(challenge);
      setChallenges((prev) => [...prev, newChallenge]);

      // Add notification for the coach
      if (challenge.coachId) {
        const notification = {
          id: Date.now().toString(),
          message: `New coaching request: ${challenge.title}`,
          read: false,
          createdAt: new Date(),
          user_id: challenge.coachId,
        };
        setNotifications((prev) => [notification, ...prev]);
      }
      return newChallenge;
    } catch (error) {
      console.error("Error adding challenge:", error);
      throw error;
    }
  };

  const addNotification = (message: string) => {
    const notification = {
      id: Date.now().toString(),
      message,
      read: false,
      createdAt: new Date(),
    };
    setNotifications((prev) => [notification, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)),
    );
  };

  const updateChallenge = async (challenge: Challenge) => {
    const updatedChallenges = challenges.map((ch) =>
      ch.id === challenge.id ? challenge : ch,
    );
    setChallenges(updatedChallenges);
    await AsyncStorage.setItem("challenges", JSON.stringify(updatedChallenges));
  };

  const updateChallengeStatus = async (
    challenge_id: string,
    status: string,
    reason?: string,
  ) => {
    const updatedChallenges = challenges.map((c) => {
      if (c.id === challenge_id) {
        return { ...c, status, rejectionReason: reason };
      }
      return c;
    });
    setChallenges(updatedChallenges);
    await AsyncStorage.setItem("challenges", JSON.stringify(updatedChallenges));
    addNotification(
      `Challenge ${status === "rejected" ? "rejected" : "updated to " + status}`,
    );
  };

  const updateChallengeCoach = async (
    challenge_id: string,
    newCoachId: string,
  ) => {
    const updatedChallenges = challenges.map((c) => {
      if (c.id === challenge_id) {
        return { ...c, coachId: newCoachId, status: "pending" };
      }
      return c;
    });
    setChallenges(updatedChallenges);
    saveChallenges(updatedChallenges);
    addNotification("Coach updated for challenge");
  };

  const deleteChallenge = async (challenge_id: string) => {
    const updatedChallenges = challenges.filter((c) => c.id !== challenge_id);
    setChallenges(updatedChallenges);
    saveChallenges(updatedChallenges);
    addNotification("Challenge deleted");
  };

  const archiveChallenge = async (challenge_id: string) => {
    const updatedChallenges = challenges.map((c) => {
      if (c.id === challenge_id) {
        return { ...c, archived: true };
      }
      return c;
    });
    setChallenges(updatedChallenges);
    await AsyncStorage.setItem("challenges", JSON.stringify(updatedChallenges));
    addNotification("Challenge archived");
  };

  const saveChallenges = async (challengesToSave: Challenge[]) => {
    try {
      const storedChallenges = await AsyncStorage.getItem("challenges");
      const existingChallenges = storedChallenges
        ? JSON.parse(storedChallenges)
        : [];
      const mergedChallenges = [
        ...existingChallenges,
        ...challengesToSave.filter(
          (c) => !existingChallenges.find((ec) => ec.id === c.id),
        ),
      ];
      await AsyncStorage.setItem(
        "challenges",
        JSON.stringify(mergedChallenges),
      );
    } catch (e) {
      console.error("Error saving challenges:", e);
    }
  };

  const loadChallenges = async () => {
    try {
      const fetchedChallenges = await ApiClient.getChallenges(user?.id || "");
      if (Array.isArray(fetchedChallenges)) {
        // Convert numeric IDs to strings
        const processedChallenges = fetchedChallenges.map((challenge) => ({
          ...challenge,
          id: challenge.id.toString(),
          messages:
            challenge.messages?.map((msg) => ({
              ...msg,
              is_read: msg.is_read,
              user_id: msg.user_id,
              timestamp: new Date(msg.created_at),
            })) || [],
        }));
        setChallenges(processedChallenges);
      } else {
        console.error("Invalid challenges data:", fetchedChallenges);
      }
    } catch (e) {
      console.error("Error loading challenges:", e);
      console.error("Error details:", {
        message: e.message,
        stack: e.stack,
        name: e.name,
      });
    }
  };

  const getUnreadMessageCount = (challenge_id: string): number => {
    const challenge = challenges.find((c) => c.id === challenge_id);
    if (!challenge || !challenge.messages) return 0;
    return challenge.messages.filter(
      (msg) => msg.user_id !== user?.id && !msg.is_read,
    ).length;
  };

  const markMessagesAsRead = async (challenge_id: string): Promise<void> => {
    const updatedChallenges = challenges.map((c) => {
      if (c.id === challenge_id) {
        return {
          ...c,
          messages:
            c.messages?.map((msg) => ({
              ...msg,
              read: msg.user_id === user?.id ? msg.read : true,
            })) || [],
        };
      }
      return c;
    });
    setChallenges(updatedChallenges);
    await ApiClient.markMessagesAsRead(challenge_id, user?.id || "");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        challenges,
        notifications,
        login,
        logout,
        getCoaches,
        addChallenge,
        addNotification,
        markNotificationAsRead,
        updateChallenge,
        updateChallengeStatus,
        updateChallengeCoach,
        deleteChallenge,
        archiveChallenge,
        getUnreadMessageCount,
        markMessagesAsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
