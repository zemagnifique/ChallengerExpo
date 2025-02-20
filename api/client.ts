
import { Platform } from 'react-native';

const getApiUrl = () => {
  const port = 3001;
  
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:${port}`;
  }
  
  // For mobile, use the Replit domain
  return `${process.env.REPLIT_DEV_DOMAIN || window?.location?.origin || `http://0.0.0.0:${port}`}`;
};

const API_URL = getApiUrl();

export const ApiClient = {
  getChallenges: async () => {
    try {
      console.log('Fetching challenges from:', `${API_URL}/api/challenges`);
      const response = await fetch(`${API_URL}/api/challenges`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch challenges: ${response.status} ${response.statusText} - ${errorText}`);
      }
      return response.json();
    } catch (error) {
      console.error('API Error:', error);
      console.error('API URL:', API_URL);
      console.error('Platform:', Platform.OS);
      throw error;
    }
  },

  createChallenge: async (challenge: any) => {
    try {
      const response = await fetch(`${API_URL}/challenges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(challenge)
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create challenge: ${response.status} ${response.statusText} - ${errorText}`);
      }
      return response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};
