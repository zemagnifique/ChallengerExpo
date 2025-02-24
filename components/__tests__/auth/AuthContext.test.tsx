import { render, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import React from 'react';
import { Text } from 'react-native';

// Create a test component that uses the hook
const TestComponent = () => {
  const { login, isAuthenticated } = useAuth();
  return <Text testID="auth-status">{isAuthenticated ? 'logged-in' : 'logged-out'}</Text>;
};

describe('AuthContext', () => {
  it('should login successfully', async () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Verify initial state
    expect(getByTestId('auth-status').props.children).toBe('logged-out');

    // Attempt login
    await act(async () => {
      const { login } = useAuth();
      await login('testuser', 'password');
    });

    // Verify logged in state
    expect(getByTestId('auth-status').props.children).toBe('logged-in');
  });
});