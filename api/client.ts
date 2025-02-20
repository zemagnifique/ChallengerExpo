
const getApiUrl = () => {
  const port = 3001;
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:${port}/api`;
  }
  return `http://0.0.0.0:${port}/api`;
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
