import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, Socket } from "socket.io-client";
import { ApiClient } from "@/api/client";
import type {
  User,
  Challenge,
  Notification,
  Message,
  AuthContextType,
} from "@/types";

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  challenges: [],
  notifications: [],
  login: async () => false,
  logout: async () => {},
  getCoaches: () => [],
  addChallenge: async () => {
    throw new Error("Not implemented");
  },
  addNotification: () => {},
  markNotificationAsRead: () => {},
  updateChallenge: async () => {},
  updateChallengeStatus: async () => {},
  updateChallengeCoach: async () => {},
  deleteChallenge: async () => {},
  archiveChallenge: async () => {},
  getUnreadMessageCount: () => 0,
  markMessagesAsRead: async () => {},
  validateProof: async () => {},
  sendProofMessage: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socketRef = useRef<Socket | null>(null);

  // In‑memory caches: these persist for the lifetime of the provider.
  const usernameCache = useRef<Record<string, string>>({});
  const coachUsernameCache = useRef<Record<number, string>>({});

  // Helper: persist challenges and update state
  const persistChallenges = useCallback(
    async (updatedChallenges: Challenge[]) => {
      setChallenges(updatedChallenges);
      await AsyncStorage.setItem(
        "challenges",
        JSON.stringify(updatedChallenges),
      );
    },
    [],
  );

  // Define addNotification first so other functions can use it.
  const addNotification = useCallback((message: string) => {
    const notification: Notification = {
      id: Date.now().toString(),
      message,
      read: false,
      createdAt: new Date(),
    };
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)),
    );
  }, []);

  // Check for stored user on mount
  const checkAuth = useCallback(async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setIsAuthenticated(true);
        setUser(parsedUser);
        await loadChallenges(parsedUser.id);
      }
    } catch (error) {
      console.error("Error checking auth:", error);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Initialize the socket connection once the user is authenticated
  useEffect(() => {
    if (!user?.id) return;
    const socket = io(ApiClient.getApiUrl(), {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to main WebSocket");
      // Join all challenge rooms on connection
      challenges.forEach((challenge) => {
        socket.emit("joinRoom", challenge.id);
      });
    });

    socket.on("updateMessages", (messages: any) => {
      if (!messages || !messages.length) return;
      const socketChallengeId = String(messages[0].challenge_id);
      const processedMessages = messages.map((msg: any) => ({
        ...msg,
        id: String(msg.id),
        is_read: msg.is_read,
        isProof: msg.is_proof,
        isValidated: msg.is_validated,
        timestamp: new Date(msg.created_at),
      }));

      setChallenges(prevChallenges => 
        prevChallenges.map(challenge =>
          challenge.id === socketChallengeId
            ? { ...challenge, messages: processedMessages }
            : challenge
        )
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id, challenges]);

  // When challenges update, join new challenge rooms
  useEffect(() => {
    if (socketRef.current) {
      challenges.forEach((challenge) => {
        socketRef.current!.emit("joinRoom", challenge.id);
      });
    }
  }, [challenges]);

  // -----------------------
  // Auth and Challenges Logic
  // -----------------------

  const login = useCallback(async (username: string, password: string) => {
    try {
      const userData = await ApiClient.login(username, password);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      setIsAuthenticated(true);
      setUser(userData);
      await loadChallenges(userData.id);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem("user");
      setIsAuthenticated(false);
      setUser(null);
      setChallenges([]);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, []);

  const getCoaches = useCallback((): User[] => {
    // Dummy implementation; adjust as needed
    return [
      { id: "1", username: "Coach1" },
      { id: "2", username: "Coach2" },
    ];
  }, []);

  const addChallenge = useCallback(
    async (challenge: Challenge): Promise<Challenge> => {
      try {
        const newChallenge = await ApiClient.createChallenge(challenge);
        await persistChallenges([...challenges, newChallenge]);
        addNotification(`New challenge created: ${challenge.title}`);
        return newChallenge;
      } catch (error) {
        console.error("Error adding challenge:", error);
        throw error;
      }
    },
    [challenges, persistChallenges, addNotification],
  );

  // Updated merge: only override username fields if they are explicitly provided
  const updateChallenge = useCallback(async (challenge: Challenge) => {
    setChallenges((prevChallenges) => {
      const updated = prevChallenges.map((ch) => {
        if (ch.id === challenge.id) {
          const merged = { ...ch, ...challenge };
          if (challenge.username === undefined) {
            merged.username = ch.username;
          }
          if (challenge.coachUsername === undefined) {
            merged.coachUsername = ch.coachUsername;
          }
          return merged;
        }
        return ch;
      });
      AsyncStorage.setItem("challenges", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateChallengeStatus = useCallback(
    async (challenge_id: string, status: string, reason?: string) => {
      const updatedChallenges = challenges.map((c) =>
        c.id === challenge_id ? { ...c, status, rejectionReason: reason } : c,
      );
      await persistChallenges(updatedChallenges);
      addNotification(
        `Challenge ${
          status === "rejected" ? "rejected" : "updated to " + status
        }`,
      );
    },
    [challenges, persistChallenges, addNotification],
  );

  const updateChallengeCoach = useCallback(
    async (challenge_id: string, newCoachId: string) => {
      const updatedChallenges = challenges.map((c) =>
        c.id === challenge_id
          ? { ...c, coach_id: parseInt(newCoachId), status: "pending" }
          : c,
      );
      await persistChallenges(updatedChallenges);
      addNotification("Coach updated for challenge");
    },
    [challenges, persistChallenges, addNotification],
  );

  const deleteChallenge = useCallback(
    async (challenge_id: string) => {
      const updatedChallenges = challenges.filter((c) => c.id !== challenge_id);
      await persistChallenges(updatedChallenges);
      addNotification("Challenge deleted");
    },
    [challenges, persistChallenges, addNotification],
  );

  const archiveChallenge = useCallback(
    async (challenge_id: string) => {
      const updatedChallenges = challenges.map((c) =>
        c.id === challenge_id ? { ...c, archived: true } : c,
      );
      await persistChallenges(updatedChallenges);
      addNotification("Challenge archived");
    },
    [challenges, persistChallenges, addNotification],
  );

  const getUnreadMessageCount = useCallback(
    (challenge_id: string): number => {
      const challenge = challenges.find((c) => c.id === challenge_id);
      if (!challenge || !challenge.messages) return 0;
      return challenge.messages.filter(
        (msg) => msg.user_id !== user?.id && !msg.is_read,
      ).length;
    },
    [challenges, user],
  );

  const markMessagesAsRead = useCallback(
    async (challenge_id: string) => {
      const updatedChallenges = challenges.map((c) => {
        if (c.id === challenge_id) {
          return {
            ...c,
            messages:
              c.messages?.map((msg) => ({
                ...msg,
                is_read: msg.user_id === user?.id ? msg.is_read : true,
              })) || [],
          };
        }
        return c;
      });
      await persistChallenges(updatedChallenges);
      await ApiClient.markMessagesAsRead(challenge_id, user?.id || "");
    },
    [challenges, user, persistChallenges],
  );

  // Updated loadChallenges: fetch username only if not cached already.
  const loadChallenges = useCallback(
    async (userId: string) => {
      try {
        const fetchedChallenges = await ApiClient.getChallenges(userId);
        if (Array.isArray(fetchedChallenges)) {
          const processedChallenges = await Promise.all(
            fetchedChallenges.map(async (challenge: any) => {
              // Use cached username if available
              let username = challenge.username;
              if (!username) {
                if (usernameCache.current[challenge.user_id]) {
                  username = usernameCache.current[challenge.user_id];
                } else {
                  username = await ApiClient.getUsername(challenge.user_id);
                  usernameCache.current[challenge.user_id] = username;
                }
              }
              let coachUsername = challenge.coachUsername;
              if (!coachUsername) {
                if (coachUsernameCache.current[challenge.coach_id]) {
                  coachUsername =
                    coachUsernameCache.current[challenge.coach_id];
                } else {
                  coachUsername = await ApiClient.getUsername(
                    challenge.coach_id,
                  );
                  coachUsernameCache.current[challenge.coach_id] =
                    coachUsername;
                }
              }
              return {
                ...challenge,
                username,
                coachUsername,
                id: challenge.id.toString(),
                messages: challenge.messages
                  ? challenge.messages.map((msg: any) => ({
                      ...msg,
                      is_read: msg.is_read,
                      user_id: msg.user_id,
                      timestamp: new Date(msg.created_at),
                    }))
                  : [],
              };
            }),
          );
          await persistChallenges(processedChallenges);
        } else {
          console.error("Invalid challenges data:", fetchedChallenges);
        }
      } catch (error) {
        console.error("Error loading challenges:", error);
      }
    },
    [persistChallenges],
  );

  // Add function to set message as proof
  const setMessageAsProof = useCallback(
    async (messageId: string, isProof: boolean) => {
      try {
        await ApiClient.setMessageAsProof(messageId, isProof);
        // WebSocket will handle state update
        addNotification(`Message ${isProof ? 'marked as' : 'unmarked from'} proof`);
      } catch (error) {
        console.error("Error setting message as proof:", error);
        throw error;
      }
    },
    [addNotification]
  );

  // Add new function to validate proof messages
  const validateProof = useCallback(
    async (messageId: string, isValidated: boolean, challengeId: string) => {
      try {
        await ApiClient.validateMessage(messageId, isValidated);

        // No need to manually update state here as the WebSocket will handle it
        addNotification(`Proof ${isValidated ? 'validated' : 'invalidated'}`);
      } catch (error) {
        console.error("Error validating proof:", error);
        throw error;
      }
    },
    [addNotification]
  );

  // Add new function to send proof messages
  const sendProofMessage = useCallback(
    async (challengeId: string, message: Partial<Message>) => {
      try {
        await ApiClient.sendMessage(challengeId, {
          ...message,
          isProof: true,
          user_id: user?.id || "",
        });

        // No need to manually update state here as the WebSocket will handle it
        addNotification("Proof submitted");
      } catch (error) {
        console.error("Error sending proof:", error);
        throw error;
      }
    },
    [user, addNotification]
  );

  return (
    <AuthContext.Provider
      value={{
        setMessageAsProof,
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
        setChallenges,
        validateProof,
        sendProofMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);