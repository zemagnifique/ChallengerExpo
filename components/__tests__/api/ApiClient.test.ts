
import { ApiClient } from '@/api/client';
import fetch from 'jest-fetch-mock';

describe('ApiClient', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('fetches challenges successfully', async () => {
    const mockChallenges = [
      { id: 1, title: 'Challenge 1' },
      { id: 2, title: 'Challenge 2' },
    ];

    const mockMessages = [
      { id: 1, challenge_id: 1, text: 'Test message' }
    ];

    // Mock challenges response
    fetch.mockResponseOnce(JSON.stringify(mockChallenges));
    // Mock messages response for each challenge
    fetch.mockResponseOnce(JSON.stringify(mockMessages));
    fetch.mockResponseOnce(JSON.stringify(mockMessages));

    const result = await ApiClient.getChallenges('1');
    expect(result[0].messages).toBeDefined();
    expect(result[0].title).toBe('Challenge 1');
  });

  it('handles failed challenge fetch', async () => {
    fetch.mockRejectOnce(new Error('Network error'));
    await expect(ApiClient.getChallenges('1')).rejects.toThrow('Network error');
  });
});
