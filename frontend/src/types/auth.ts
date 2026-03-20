export interface LoginPayload {
  email: string;
  password: string;
}

export interface  User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  department: string;
  is_active: boolean;
} 

export interface LoginResponse {
  token: string;
  user: User; //
}