export type UserRole = 'admin' | 'manager' | 'contributor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}
