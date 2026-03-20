import axios from "axios";
import {getToken , removeToken} from "./auth-token";


export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1",
  withCredentials: true,
});

// Add a request interceptor to include the token in headers
// This will automatically attach the JWT token to every request if it exists
api.interceptors.request.use((config) => {
  const token = getToken();   // Get the token from localStorage

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
 // Add a response interceptor to handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken(); // Clear the token on unauthorized error

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);