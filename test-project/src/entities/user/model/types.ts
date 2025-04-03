export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface UserState {
  data: User | null;
  loading: boolean;
  error: string | null;
}
