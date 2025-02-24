
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ChatScreen from '@/app/chat';
import { AuthProvider } from '@/contexts/AuthContext';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ challenge_id: '1' }),
  useRouter: () => ({ back: jest.fn(), push: jest.fn() })
}));

const mockChallenge = {
  id: '1',
  title: 'Test Challenge',
  status: 'active',
  messages: [],
  user_id: '1',
  coach_id: '2',
  username: 'testuser',
  coachUsername: 'testcoach'
};

describe('ChatScreen', () => {
  it('sends a message successfully', async () => {
    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <ChatScreen />
      </AuthProvider>
    );

    // Set challenges in auth context
    const authContext = AuthContext._currentValue;
    authContext.challenges = [mockChallenge];
    authContext.user = { id: '1', username: 'testuser' };

    const input = getByPlaceholderText('Type a message...');
    fireEvent.changeText(input, 'Test message');

    const sendButton = getByText('Send');
    fireEvent.press(sendButton);

    expect(input.props.value).toBe('');
  });
});
