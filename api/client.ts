
import { Platform } from 'react-native';

const getApiUrl = () => {
  const port = 3001;
  // Check if we're in a React Native environment
  if (typeof Platform !== 'undefined' && Platform.OS === 'web') {
    // For web browser
    return `${typeof window !== 'undefined' ? window.location.origin : `http://0.0.0.0:${port}`}/api`;
  }
  // For mobile, use the Replit dev domain
  return `https://${process.env.REPLIT_DEV_DOMAIN}/api`;
};

const API_URL = getApiUrl();

export const ApiClient = {
  getChallenges: async () => {
    const response = await fetch(`${API_URL}/challenges`);
    if (!response.ok) throw new Error('Failed to fetch challenges');
    return response.json();
  },

  createChallenge: async (challenge: any) => {
    const response = await fetch(`${API_URL}/challenges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(challenge)
    });
    if (!response.ok) throw new Error('Failed to create challenge');
    return response.json();
  }
};
