import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  id: string;
  username: string;
};

const USERS: Record<string, { password: string }> = {
  'user1': { password: 'user1' },
  'user2': { password: 'user2' },
  'user3': { password: 'user3' }
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
  userId: string;
  coachId: string;
  createdAt: Date;
  messages?: Array<{
    text: string;
    userId: string;
    timestamp: Date;
  }>;
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
  updateChallengeStatus: (challengeId: string, status: string) => void;
  updateChallengeCoach: (challengeId: string, newCoachId: string) => Promise<void>;
  deleteChallenge: (challengeId: string) => Promise<void>;
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
  updateChallengeStatus: () => {} //Added this line
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const storedUser = await AsyncStorage.getItem('user');
    if (storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
  };

  const login = async (username: string, password: string) => {
    const userInfo = USERS[username];
    if (userInfo && userInfo.password === password) {
      const user = { id: username, username };
      await AsyncStorage.setItem('user', JSON.stringify(user));
      setIsAuthenticated(true);
      setUser(user);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const TEST_USERS = {
  'user1': { id: 'user1', username: 'user1', isCoach: false },
  'user2': { id: 'user2', username: 'user2', isCoach: true }
};

const getCoaches = () => {
  return Object.entries(TEST_USERS)
    .filter(([_, user]) => user.isCoach)
    .map(([id, user]) => ({ id, username: user.username }));
};

  const addChallenge = (challenge: Challenge) => {
    const newChallenge = {
      ...challenge,
      id: Date.now().toString(), // Ensure unique ID
    };
    setChallenges(prev => [...prev, newChallenge]);
    // Add notification for the coach
    if (challenge.coachId) {
      const notification = {
        id: Date.now().toString(),
        message: `New coaching request: ${challenge.title}`,
        read: false,
        createdAt: new Date(),
        userId: challenge.coachId // Ensure notification goes to coach
      };
      setNotifications(prev => [notification, ...prev]);
    }
  };

  const addNotification = (message: string) => {
    const notification = {
      id: Date.now().toString(),
      message,
      read: false,
      createdAt: new Date()
    };
    setNotifications(prev => [notification, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const updateChallenge = (challenge: Challenge) => {
    setChallenges(prev =>
      prev.map(ch =>
        ch.createdAt.toString() === challenge.createdAt.toString() ? challenge : ch
      )
    );
  };

  const updateChallengeStatus = async (challengeId: string, status: string, reason?: string) => {
    const updatedChallenges = challenges.map(c => {
      if (c.id === challengeId) {
        return { ...c, status, rejectionReason: reason };
      }
      return c;
    });
    setChallenges(updatedChallenges);
    addNotification(`Challenge ${status === 'rejected' ? 'rejected' : 'updated to ' + status}`);
  };

  const updateChallengeCoach = async (challengeId: string, newCoachId: string) => {
    const updatedChallenges = challenges.map(c => {
      if (c.id === challengeId) {
        return { ...c, coachId: newCoachId, status: 'pending' };
      }
      return c;
    });
    setChallenges(updatedChallenges);
    addNotification('Coach updated for challenge');
  };

  const deleteChallenge = async (challengeId: string) => {
    setChallenges(challenges.filter(c => c.id !== challengeId));
    addNotification('Challenge deleted');
  };

  return (
    <AuthContext.Provider value={{
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
      deleteChallenge
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);