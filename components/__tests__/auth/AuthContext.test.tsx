
import { render, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ApiClient } from '@/api/client';

jest.mock('@/api/client');

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should login successfully', async () => {
    const mockLogin = jest.spyOn(ApiClient, 'login');
    mockLogin.mockResolvedValue({ id: '1', username: 'testuser' });

    const TestComponent = () => {
      const { login } = useAuth();
      return null;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      const result = await useAuth().login('testuser', 'password');
      expect(result).toBe(true);
    });
  });

  it('should handle login failure', async () => {
    const mockLogin = jest.spyOn(ApiClient, 'login');
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));

    const TestComponent = () => {
      const { login } = useAuth();
      return null;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      const result = await useAuth().login('testuser', 'wrongpassword');
      expect(result).toBe(false);
    });
  });
});
