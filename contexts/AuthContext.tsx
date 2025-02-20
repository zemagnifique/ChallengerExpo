import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  id: string;
  username: string;
};

import { DatabaseModels } from '../models/database';

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
  updateChallengeStatus: (challengeId: string, status: string) => void;
  updateChallengeCoach: (challengeId: string, newCoachId: string) => Promise<void>;
  deleteChallenge: (challengeId: string) => Promise<void>;
  archiveChallenge: (challengeId: string) => void; // Added archiveChallenge method
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
  deleteChallenge: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    console.log('AuthProvider mounted');
    const initialize = async () => {
      try {
        await checkAuth();
        await loadChallenges();
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  if (isLoading) {
    return null;
  }

  const checkAuth = async () => {
    console.log('AuthContext: Checking authentication');
    try {
      const storedUser = await AsyncStorage.getItem('user');
      console.log('AuthContext: Stored user:', storedUser);
      if (storedUser) {
        setIsAuthenticated(true);
        setUser(JSON.parse(storedUser));
        console.log('AuthContext: User authenticated');
      } else {
        console.log('AuthContext: No stored user found');
      }
    } catch (error) {
      console.error('AuthContext: Error checking auth:', error);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      // Try database first
      const userInfo = await DatabaseModels.getUser(username);
      if (userInfo && userInfo.password === password) {
        const user = { id: userInfo.id, username: userInfo.username };
        await AsyncStorage.setItem('user', JSON.stringify(user));
        setIsAuthenticated(true);
        setUser(user);
        await loadChallenges();
        return true;
      }
      
      // Fallback to AsyncStorage for development
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setIsAuthenticated(true);
        setUser(user);
        await loadChallenges();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      // Fallback to AsyncStorage on error
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setIsAuthenticated(true);
        setUser(user);
        await loadChallenges();
        return true;
      }
      return false;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setChallenges([]);
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
    setChallenges(prev => {
      const updatedChallenges = [...prev, newChallenge];
      saveChallenges(updatedChallenges);
      return updatedChallenges;
    });
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

  const updateChallenge = async (challenge: Challenge) => {
    const updatedChallenges = challenges.map(ch =>
      ch.id === challenge.id ? challenge : ch
    );
    setChallenges(updatedChallenges);
    await AsyncStorage.setItem('challenges', JSON.stringify(updatedChallenges));
  };

  const updateChallengeStatus = async (challengeId: string, status: string, reason?: string) => {
    const updatedChallenges = challenges.map(c => {
      if (c.id === challengeId) {
        return { ...c, status, rejectionReason: reason };
      }
      return c;
    });
    setChallenges(updatedChallenges);
    await AsyncStorage.setItem('challenges', JSON.stringify(updatedChallenges));
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
    saveChallenges(updatedChallenges);
    addNotification('Coach updated for challenge');
  };

  const deleteChallenge = async (challengeId: string) => {
    const updatedChallenges = challenges.filter(c => c.id !== challengeId);
    setChallenges(updatedChallenges);
    saveChallenges(updatedChallenges);
    addNotification('Challenge deleted');
  };

  const archiveChallenge = async (challengeId: string) => {
    const updatedChallenges = challenges.map(c => {
      if (c.id === challengeId) {
        return { ...c, archived: true };
      }
      return c;
    });
    setChallenges(updatedChallenges);
    await AsyncStorage.setItem('challenges', JSON.stringify(updatedChallenges));
    addNotification('Challenge archived');
  };

  const saveChallenges = async (challengesToSave: Challenge[]) => {
    try {
      const storedChallenges = await AsyncStorage.getItem('challenges');
      const existingChallenges = storedChallenges ? JSON.parse(storedChallenges) : [];
      const mergedChallenges = [...existingChallenges, ...challengesToSave.filter(c => !existingChallenges.find(ec => ec.id === c.id))];
      await AsyncStorage.setItem('challenges', JSON.stringify(mergedChallenges));
    } catch (e) {
      console.error("Error saving challenges:", e);
    }
  };

  const loadChallenges = async () => {
    console.log('AuthContext: Loading challenges');
    try {
      const challengesJson = await AsyncStorage.getItem('challenges');
      console.log('AuthContext: Challenges from storage:', challengesJson);
      if (challengesJson !== null) {
        const parsedChallenges = JSON.parse(challengesJson);
        setChallenges(parsedChallenges);
        console.log('AuthContext: Challenges loaded successfully');
      } else {
        console.log('AuthContext: No challenges found in storage');
      }
    } catch (e) {
      console.error("AuthContext: Error loading challenges:", e);
    }
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
      deleteChallenge,
      archiveChallenge
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);