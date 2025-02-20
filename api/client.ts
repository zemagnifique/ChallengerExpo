
import { Platform } from 'react-native';

const getApiUrl = () => {
  const port = 3001;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:${port}`;
  }
  // For mobile, use the Replit domain
  return `https://${process.env.REPLIT_SLUG}.${process.env.REPLIT_OWNER}.repl.co`;
};

const API_URL = getApiUrl();

export const ApiClient = {
  getChallenges: async () => {
    const response = await fetch(`${API_URL}/api/challenges`);
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
