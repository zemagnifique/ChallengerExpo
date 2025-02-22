import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, Socket } from "socket.io-client";
import { ApiClient } from "@/api/client";

// -----------------------
// Type Definitions
// -----------------------
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
  coach_id: number; // adjust if your naming differs (coachId vs. coach_id)
  createdAt: Date;
  messages?: Array<{
    id?: string;
    text: string;
    user_id: string;
    timestamp: Date;
    read: boolean;
    isProof?: boolean;
    isValidated?: boolean;
  }>;
  archived?: boolean;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  challenges: Challenge[];
  notifications: Notification[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  getCoaches: () => User[];
  addChallenge: (challenge: Challenge) => Promise<Challenge>;
  addNotification: (message: string) => void;
  markNotificationAsRead: (id: string) => void;
  updateChallenge: (challenge: Challenge) => Promise<void>;
  updateChallengeStatus: (
    challenge_id: string,
    status: string,
    reason?: string,
  ) => Promise<void>;
  updateChallengeCoach: (
    challenge_id: string,
    newCoachId: string,
  ) => Promise<void>;
  deleteChallenge: (challenge_id: string) => Promise<void>;
  archiveChallenge: (challenge_id: string) => Promise<void>;
  getUnreadMessageCount: (challenge_id: string) => number;
  markMessagesAsRead: (challenge_id: string) => Promise<void>;
};

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
});

// -----------------------
// AuthProvider Component
// -----------------------
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socketRef = useRef<Socket | null>(null);

  // Check for stored user on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Initialize the socket connection when user is authenticated
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
      // Join each challenge room
      challenges.forEach((challenge) => {
        socket.emit("joinRoom", challenge.id);
      });
    });

    // Listen for message updates
    socket.on("updateMessages", (messages: any) => {
      console.log("updateMessages");
      if (!messages || !messages.length) return;
      const challenge_id = messages[0].challenge_id;
      const processedMessages = messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.created_at),
      }));
      const socketChallengeId = String(messages[0].challenge_id);
      setChallenges((currentChallenges) =>
        currentChallenges.map((challenge) =>
          challenge.id === socketChallengeId
            ? { ...challenge, messages: processedMessages }
            : challenge,
        ),
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, challenges]);

  // When challenges update, join any new challenge rooms
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
  const checkAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setIsAuthenticated(true);
        setUser(parsedUser);
        loadChallenges(parsedUser.id);
      }
    } catch (error) {
      console.error("Error checking auth:", error);
    }
  };

  const login = async (username: string, password: string) => {
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
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      setIsAuthenticated(false);
      setUser(null);
      setChallenges([]);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getCoaches = (): User[] => {
    // Dummy implementation; adjust as needed
    return [
      { id: "1", username: "Coach1" },
      { id: "2", username: "Coach2" },
    ];
  };

  const addChallenge = async (challenge: Challenge): Promise<Challenge> => {
    try {
      const newChallenge = await ApiClient.createChallenge(challenge);
      setChallenges((prev) => [...prev, newChallenge]);
      addNotification(`New challenge created: ${challenge.title}`);
      return newChallenge;
    } catch (error) {
      console.error("Error adding challenge:", error);
      throw error;
    }
  };

  const addNotification = (message: string) => {
    const notification: Notification = {
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
    const updatedChallenges = challenges.map((c) =>
      c.id === challenge_id ? { ...c, status, rejectionReason: reason } : c,
    );
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
    const updatedChallenges = challenges.map((c) =>
      c.id === challenge_id
        ? { ...c, coach_id: parseInt(newCoachId), status: "pending" }
        : c,
    );
    setChallenges(updatedChallenges);
    await AsyncStorage.setItem("challenges", JSON.stringify(updatedChallenges));
    addNotification("Coach updated for challenge");
  };

  const deleteChallenge = async (challenge_id: string) => {
    const updatedChallenges = challenges.filter((c) => c.id !== challenge_id);
    setChallenges(updatedChallenges);
    await AsyncStorage.setItem("challenges", JSON.stringify(updatedChallenges));
    addNotification("Challenge deleted");
  };

  const archiveChallenge = async (challenge_id: string) => {
    const updatedChallenges = challenges.map((c) =>
      c.id === challenge_id ? { ...c, archived: true } : c,
    );
    setChallenges(updatedChallenges);
    await AsyncStorage.setItem("challenges", JSON.stringify(updatedChallenges));
    addNotification("Challenge archived");
  };

  const getUnreadMessageCount = (challenge_id: string): number => {
    const challenge = challenges.find((c) => c.id === challenge_id);
    if (!challenge || !challenge.messages) return 0;
    return challenge.messages.filter(
      (msg) => msg.user_id !== user?.id && !msg.read,
    ).length;
  };

  const markMessagesAsRead = async (challenge_id: string) => {
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

  const loadChallenges = async (userId: string) => {
    try {
      const fetchedChallenges = await ApiClient.getChallenges(userId);
      if (Array.isArray(fetchedChallenges)) {
        const processedChallenges = fetchedChallenges.map((challenge: any) => ({
          ...challenge,
          id: challenge.id.toString(),
          messages: challenge.messages
            ? challenge.messages.map((msg: any) => ({
                ...msg,
                read: msg.read,
                user_id: msg.user_id,
                timestamp: new Date(msg.created_at),
              }))
            : [],
        }));
        setChallenges(processedChallenges);
        await AsyncStorage.setItem(
          "challenges",
          JSON.stringify(processedChallenges),
        );
      } else {
        console.error("Invalid challenges data:", fetchedChallenges);
      }
    } catch (error) {
      console.error("Error loading challenges:", error);
    }
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
};

export const useAuth = () => useContext(AuthContext);
