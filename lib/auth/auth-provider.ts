export type AuthUser = {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
};

export interface AuthProvider {
  getCurrentUser(): Promise<AuthUser | null>;
  signOut(): Promise<void>;
}
