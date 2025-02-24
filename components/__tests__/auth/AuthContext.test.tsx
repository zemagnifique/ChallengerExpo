
import { render, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import React from 'react';
import { Text } from 'react-native';

const TestComponent = () => {
  const { login } = useAuth();
  return (
    <Text testID="auth-test" onPress={() => login('user1', 'pass')}>
      Test Auth
    </Text>
  );
};

describe('AuthContext', () => {
  it('should login successfully', async () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const testElement = getByTestId('auth-test');
    await act(async () => {
      testElement.props.onPress();
    });
  });
});
