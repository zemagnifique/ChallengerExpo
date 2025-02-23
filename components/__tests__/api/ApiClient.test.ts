
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

    fetch.mockResponseOnce(JSON.stringify(mockChallenges));

    const result = await ApiClient.getChallenges('1');
    expect(result).toEqual(mockChallenges);
  });

  it('handles failed challenge fetch', async () => {
    fetch.mockRejectOnce(new Error('Network error'));

    await expect(ApiClient.getChallenges('1')).rejects.toThrow('Network error');
  });
});
