export interface AuthContextType {
  // ... existing properties ...
  setMessageAsProof: (messageId: string, isProof: boolean) => Promise<void>;
} 