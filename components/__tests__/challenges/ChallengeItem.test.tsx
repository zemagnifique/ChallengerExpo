import { render, fireEvent } from '@testing-library/react-native';
import { expect, jest, describe, it } from '@jest/globals';
import { ChallengeItem } from '@/components/ChallengeItem';

// Mock the auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '2' }
  })
}));

describe('ChallengeItem', () => {
  const mockChallenge = {
    id: '1',
    title: 'Test Challenge',
    description: 'Test Description',
    user_id: '1',
    coach_id: '2',
    status: 'pending'
  };

  const mockProps = {
    item: mockChallenge,
    getUnreadCount: jest.fn(() => 0),
    onAccept: jest.fn(),
    onReject: jest.fn()
  };

  it('renders correctly', () => {
    const { getByText } = render(<ChallengeItem {...mockProps} />);
    expect(getByText('Test Challenge')).toBeTruthy();
    expect(getByText('Test Description')).toBeTruthy();
  });

  it('shows pending badge for pending challenges', () => {
    const { getByText } = render(<ChallengeItem {...mockProps} />);
    expect(getByText('Pending')).toBeTruthy();
  });
});