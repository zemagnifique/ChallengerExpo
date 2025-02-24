
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ChatScreen from '@/app/chat';
import { AuthProvider } from '@/contexts/AuthContext';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ challenge_id: '1' }),
  useRouter: () => ({ push: jest.fn() })
}));

describe('ChatScreen', () => {
  it('sends a message successfully', async () => {
    const mockChallenge = {
      id: 1,
      title: 'Test Challenge',
      messages: []
    };

    const { getByPlaceholderText, getByText } = render(
      <AuthProvider initialChallenges={[mockChallenge]}>
        <ChatScreen />
      </AuthProvider>
    );

    const input = getByPlaceholderText('Type a message...');
    fireEvent.changeText(input, 'Test message');

    const sendButton = getByText('Send');
    fireEvent.press(sendButton);

    expect(input.props.value).toBe('');
  });
});
