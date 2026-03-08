import { create } from 'zustand';
import { User, UserRole } from '@/lib/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  register: (email: string, name: string, role: UserRole, password: string) => boolean;
  logout: () => void;
}

const DEMO_USERS: (User & { password: string })[] = [
  { id: '1', email: 'admin@governx.io', name: 'Alex Chen', role: 'admin', created_at: '2024-01-01', password: 'admin123' },
  { id: '2', email: 'pm@governx.io', name: 'Sarah Miller', role: 'manager', created_at: '2024-01-15', password: 'manager123' },
  { id: '3', email: 'dev@governx.io', name: 'Jordan Lee', role: 'contributor', created_at: '2024-02-01', password: 'dev123' },
];

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (email, password) => {
    const found = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...user } = found;
      set({ user, isAuthenticated: true });
      return true;
    }
    return false;
  },
  register: (email, name, role, _password) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
      role,
      created_at: new Date().toISOString(),
    };
    set({ user: newUser, isAuthenticated: true });
    return true;
  },
  logout: () => set({ user: null, isAuthenticated: false }),
}));
