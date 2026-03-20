const TOKEN_KEY = "isms_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}


/*
What this does:

Stores the JWT token in localStorage under the key "isms_token".
Provides functions to get, set, and remove the token.
Checks for window to ensure it only runs in the browser (not during SSR).
Usage:

After login, call setToken(token).
For authenticated API calls, use getToken() to retrieve the token and set it in the Authorization header.
On logout, call removeToken().

*/