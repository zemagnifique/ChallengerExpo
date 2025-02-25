import { Platform } from "react-native";

const getApiUrl = () => {
  const port = 3001;
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:${port}`;
  }
  
  // For React Native, we need to detect the right host IP
  // Development: Use localhost for iOS simulator or Metro bundler host for Android
  if (__DEV__) {
    // iOS simulator can use localhost
    if (Platform.OS === 'ios') {
      return "http://10.0.0.234:3001";
      return "http://localhost:3001";
    }
    // Android needs the Metro bundler IP
    return "http://10.0.0.234:3001"; // Android emulator default - change if needed
  }
  // Production environment
  // This would typically be your deployed server URL
  return "https://your-production-api.com";
};

const API_URL = getApiUrl();

console.log("Current API_URL:", API_URL);

export const ApiClient = {
  getApiUrl,
  getUsername: async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/users/username?user_id=${userId}`);
      console.log(response);
      if (!response.ok) {
        return "Unknown User";
      }
      const data = await response.json();
      return data.username;
    } catch (error) {
      console.error("Error fetching username:", error);
      return "Unknown User";
    }
  },
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
        challenges.map(async (challenge: any) => {
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
      const { status, createdAt, ...challengeData } = challenge;
      console.log("Creating challenge:", challengeData);
      const response = await fetch(`${API_URL}/api/challenges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(challengeData),
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

  getMessages: async (challenge_id: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/challenges/${challenge_id}/messages`,
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
    challenge_id: string,
    message: {
      user_id: string;
      text?: string;
      imageUrl?: string;
      isProof?: boolean;
    },
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/api/challenges/${challenge_id}/messages`,
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

  updateChallengeStatus: async (challenge_id: string, status: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/challenges/${challenge_id}/status`,
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

  markMessagesAsRead: async (challenge_id: string, user_id: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/challenges/${challenge_id}/messages/read`,
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

  uploadImage: async (uri: string): Promise<string> => {
    try {
      console.log("Starting image upload with URI:", uri);
      
      // Extract filename from URI
      const uriParts = uri.split('/');
      const fileName = uriParts[uriParts.length - 1];
      
      // Create a new FormData instance
      const formData = new FormData();
      
      // The key problem is that React Native requires a very specific format for file objects
      // We need to create the object with EXACTLY these properties - no more, no less
      
      if (Platform.OS === 'web') {
        // For web, we'll use a different approach
        // Fetch the file as a blob
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('image', blob, fileName || 'image.jpg');
      } else {
        // For React Native, we need this VERY specific structure
        const fileObject = {
          uri: uri,
          type: 'image/jpeg', 
          name: fileName || 'image.jpg'
        };
        
        console.log("File object:", JSON.stringify(fileObject));
        
        // Append to FormData - the type casting is crucial here
        formData.append('image', fileObject as any);
      }
      
      console.log("FormData created, sending to server...");
      
      // CRITICAL: Do NOT set any Content-Type header - let the browser/RN set it
      // This is essential for the multipart boundary to be correctly set
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });
      
      console.log(`Upload response status: ${response.status}`);
      
      const responseText = await response.text();
      console.log(`Raw response: ${responseText}`);
      
      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}: ${responseText}`);
      }
      
      // Parse response
      const result = JSON.parse(responseText);
      
      // Log success and return the URL
      console.log(`Upload successful, image URL: ${result.imageUrl}`);
      return result.imageUrl;
    } catch (error) {
      console.error(`Error in uploadImage: ${error}`);
      throw error;
    }
  },

  setMessageAsProof: async (messageId: string, isProof: boolean): Promise<any> => {
    const response = await fetch(`${API_URL}/api/messages/${messageId}/set-proof`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isProof }),
    });

    if (!response.ok) {
      throw new Error('Failed to set message as proof');
    }

    return response.json();
  },
};
