import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("careercopilot_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export function saveAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("careercopilot_token", token);
  }
}

export function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("careercopilot_token");
}

export function clearAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("careercopilot_token");
  }
}
