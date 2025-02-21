import { Platform } from "react-native";

const getApiUrl = () => {
  const port = 3001;
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:${port}`;
  }

  return "https://137cc191-b824-40bd-89ee-eb24e7330321-00-qgvpjoy7e1af.worf.replit.dev:3001";
};

const API_URL = getApiUrl();

console.log("Current API_URL:", API_URL);

export const ApiClient = {
  getApiUrl,
  getAllUsers: async () => {
    try {
      console.log("Fetching users from:", `${API_URL}/api/users`);
      const response = await fetch(`${API_URL}/api/users`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch users: ${response.status} ${response.statusText} - ${errorText}`,
        );
      }
      return response.json();
    } catch (error) {
      console.error("API Error:", error);
      console.error("API URL:", API_URL);
      console.error("Platform:", Platform.OS);
      throw error;
    }
  },
  login: async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      return response.json();
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  getChallenges: async (user_id: string) => {
    try {
      console.log(
        "Fetching challenges from:",
        `${API_URL}/api/challenges?user_id=${user_id}`,
      );
      const response = await fetch(
        `${API_URL}/api/challenges?user_id=${user_id}`,
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch challenges: ${response.status} ${response.statusText} - ${errorText}`,
        );
      }
      const challenges = await response.json();

      // Fetch messages for each challenge
      const challengesWithMessages = await Promise.all(
        challenges.map(async (challenge) => {
          const messages = await ApiClient.getMessages(challenge.id);
          return { ...challenge, messages };
        }),
      );

      return challengesWithMessages;
    } catch (error) {
      console.error("API Error:", error);
      console.error("API URL:", API_URL);
      console.error("Platform:", Platform.OS);
      throw error;
    }
  },

  createChallenge: async (challenge: any) => {
    try {
      console.log("Creating challenge:", challenge);
      const response = await fetch(`${API_URL}/api/challenges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(challenge),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create challenge: ${response.status} ${response.statusText} - ${errorText}`,
        );
      }
      const result = await response.json();
      console.log("Challenge created:", result);
      return result;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  getMessages: async (challengeId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/challenges/${challengeId}/messages`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      return response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  sendMessage: async (
    challengeId: string,
    message: {
      user_id: string;
      text?: string;
      imageUrl?: string;
      isProof?: boolean;
    },
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/api/challenges/${challengeId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(message),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      return response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  updateChallengeStatus: async (challengeId: string, status: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/challenges/${challengeId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to update challenge status");
      }
      return response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  markMessagesAsRead: async (challengeId: string, user_id: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/challenges/${challengeId}/messages/read`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: user_id }),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to mark messages as read");
      }
      return response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  validateMessage: async (messageId: string, isValidated: boolean) => {
    try {
      const response = await fetch(
        `${API_URL}/api/messages/${messageId}/validate`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isValidated }),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to validate message");
      }
      return response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
};
