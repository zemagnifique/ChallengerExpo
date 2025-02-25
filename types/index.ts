// -----------------------
// Type Definitions
// -----------------------

export type User = {
  id: string;
  username: string;
};

export type Message = {
  id?: string;
  text: string;
  user_id: string;
  timestamp: Date;
  is_read: boolean; // using API field directly
  isProof?: boolean;
  isValidated?: boolean;
  imageUrl?: string; // Added for image support
};

export type Challenge = {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  frequency: string;
  proofRequirements: string;
  status: string;
  user_id: string;
  coach_id: number;
  createdAt: Date;
  messages?: Message[];
  archived?: boolean;
  // These fields are cached locally
  username?: string;
  coachUsername?: string;
};

export type Notification = {
  id: string;
  message: string;
  read: boolean;
  createdAt: Date;
};

export type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  challenges: Challenge[];
  notifications: Notification[];
  setChallenges: (challenges: Challenge[]) => void;
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
  validateMessage: (messageId: string, isValidated: boolean) => Promise<void>;
  setMessageAsProof: (messageId: string, isProof: boolean) => Promise<void>;
  // Legacy functions to maintain compatibility - these are aliases
  validateProof: (messageId: string, isValidated: boolean, challengeId: string) => Promise<void>;
  sendProofMessage: (challengeId: string, message: Partial<Message>) => Promise<void>;
};
