
import { ApiClient } from './client';

export const UsersService = {
  getAllUsers: async () => {
    try {
      const response = await fetch(`${ApiClient.getApiUrl()}/api/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
};
