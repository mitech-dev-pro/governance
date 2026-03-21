export interface UserRole {
  id: number;
  name: string;
  type: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name?: string;
  department?: string;
  is_active?: boolean;
  roles?: UserRole[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}