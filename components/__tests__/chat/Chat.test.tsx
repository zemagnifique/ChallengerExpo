
import { render, fireEvent, act } from '@testing-library/react-native';
import ChatScreen from '@/app/chat';
import { ApiClient } from '@/api/client';

jest.mock('@/api/client');
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn() }),
  useLocalSearchParams: () => ({ challenge_id: '1' }),
}));

describe('ChatScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends a message successfully', async () => {
    const mockSendMessage = jest.spyOn(ApiClient, 'sendMessage');
    mockSendMessage.mockResolvedValue({ id: '1', text: 'Test message' });

    const { getByPlaceholderText, getByText } = render(<ChatScreen />);

    const input = getByPlaceholderText('Type a message...');
    fireEvent.changeText(input, 'Test message');

    const sendButton = getByText('Send');
    await act(async () => {
      fireEvent.press(sendButton);
    });

    expect(mockSendMessage).toHaveBeenCalledWith('1', {
      text: 'Test message',
      user_id: expect.any(String),
      imageUrl: null,
      isProof: false,
    });
  });
});
