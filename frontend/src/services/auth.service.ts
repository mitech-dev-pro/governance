import { api } from "@/lib/api";
import { LoginPayload, LoginResponse, User } from "@/types/auth";

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post("/auth/login", payload);
  return data;
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await api.get("/auth/me");
  return data;
}

/*
What this does:

Defines two functions: loginUser and getCurrentUser.  
loginUser takes an email and password, sends a POST request to the /auth/login endpoint, and returns the token and user info on success.
getCurrentUser sends a GET request to /users/me to retrieve the current user's information based on the stored JWT token.

this assumes your backend has:

POST /api/v1/auth/login
GET /api/v1/users/me

*/