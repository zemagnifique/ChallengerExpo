
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AuthProvider } from '@/contexts/AuthContext';
import ChatScreen from '@/app/chat';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ challenge_id: '1' }),
  useRouter: () => ({ back: jest.fn(), push: jest.fn() })
}));

jest.mock('@/api/client', () => ({
  ApiClient: {
    getApiUrl: jest.fn(() => 'http://test.url'),
    sendMessage: jest.fn().mockResolvedValue({}),
    getMessages: jest.fn().mockResolvedValue([]),
    validateMessage: jest.fn(),
    setMessageAsProof: jest.fn(),
    markMessagesAsRead: jest.fn(),
    updateChallengeStatus: jest.fn()
  }
}));

jest.mock('socket.io-client', () => ({
  io: () => ({
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn()
  })
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends a message successfully', async () => {
    const initialChallenges = [mockChallenge];
    const mockUser = { id: '1', username: 'testuser' };

    const { getByPlaceholderText, getByText } = render(
      <AuthProvider testChallenges={initialChallenges} testUser={mockUser}>
        <ChatScreen />
      </AuthProvider>
    );

    const input = getByPlaceholderText('Type a message...');
    fireEvent.changeText(input, 'Test message');

    const sendButton = getByText('Send');
    fireEvent.press(sendButton);

    const { ApiClient } = require('@/api/client');
    expect(ApiClient.sendMessage).toHaveBeenCalledWith('1', {
      user_id: '1',
      text: 'Test message',
      imageUrl: null,
      isProof: false
    });
  });
});
