
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  id: string;
  username: string;
  role: 'user' | 'coach';
};

const USERS: Record<string, { password: string; role: 'user' | 'coach' }> = {
  'user1': { password: 'user1', role: 'user' },
  'user2': { password: 'user2', role: 'coach' },
  'coach1': { password: 'coach1', role: 'coach' }
};

type Challenge = {
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
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  challenges: Challenge[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  getCoaches: () => User[];
  addChallenge: (challenge: Challenge) => void;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => false,
  logout: async () => {},
  getCoaches: () => [],
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

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
      const user = { id: username, username, role: userInfo.role };
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

  const getCoaches = () => {
    return Object.entries(USERS)
      .filter(([_, info]) => info.role === 'coach')
      .map(([id]) => ({ id, username: id, role: 'coach' as const }));
  };

  const addChallenge = (challenge: Challenge) => {
    setChallenges(prev => [...prev, challenge]);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, challenges, login, logout, getCoaches, addChallenge }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
