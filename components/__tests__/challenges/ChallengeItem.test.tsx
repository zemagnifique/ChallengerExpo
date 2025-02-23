
import { render, fireEvent } from '@testing-library/react-native';
import { ChallengeItem } from '@/components/ChallengeItem';

describe('ChallengeItem', () => {
  const mockChallenge = {
    id: '1',
    title: 'Test Challenge',
    description: 'Test Description',
    user_id: '1',
    coach_id: '2',
    status: 'pending',
  };

  const mockGetUnreadCount = jest.fn(() => 0);
  const mockOnAccept = jest.fn();
  const mockOnReject = jest.fn();

  it('renders challenge details correctly', () => {
    const { getByText } = render(
      <ChallengeItem
        item={mockChallenge}
        getUnreadCount={mockGetUnreadCount}
        onAccept={mockOnAccept}
        onReject={mockOnReject}
      />
    );

    expect(getByText('Test Challenge')).toBeTruthy();
    expect(getByText('Test Description')).toBeTruthy();
  });

  it('shows pending badge for pending challenges', () => {
    const { getByText } = render(
      <ChallengeItem
        item={mockChallenge}
        getUnreadCount={mockGetUnreadCount}
        onAccept={mockOnAccept}
        onReject={mockOnReject}
      />
    );

    expect(getByText('Pending')).toBeTruthy();
  });
});
