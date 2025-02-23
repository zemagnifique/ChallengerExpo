
import { StorageAPI } from '@/api/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');

describe('StorageAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('saves and retrieves user data', async () => {
    const mockUser = { id: '1', username: 'testuser' };
    
    await StorageAPI.setUser(mockUser);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));

    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockUser));
    const retrievedUser = await StorageAPI.getUser();
    expect(retrievedUser).toEqual(mockUser);
  });

  it('handles missing user data', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    const result = await StorageAPI.getUser();
    expect(result).toBeNull();
  });
});
