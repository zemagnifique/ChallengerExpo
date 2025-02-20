
import { Platform } from 'react-native';

const getApiUrl = () => {
  const port = 3001;
  const hostname = window?.location?.hostname || '';
  
  if (Platform.OS === 'web') {
    return `${window.location.protocol}//${hostname}:${port}`;
  }
  
  return `https://${hostname}:${port}`;
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
