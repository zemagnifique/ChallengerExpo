export type User = {
  id: string;
  username: string;
};

export type Challenge = {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  frequency: string;
  proofRequirements: string;
  status: string;
  user_id: string;
  coachId: string;
  createdAt: Date;
  messages?: Array<{
    text: string;
    user_id: string;
    timestamp: Date;
  }>;
  archived?: boolean;
};

export type Notification = {
  id: string;
  message: string;
  read: boolean;
  createdAt: Date;
  user_id?: string;
};
