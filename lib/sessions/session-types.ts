export type Session = {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt?: string;
};

export interface SessionManager {
  create(userId: string): Promise<Session>;
  get(id: string): Promise<Session | null>;
  destroy(id: string): Promise<void>;
}
