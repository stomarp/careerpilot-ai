import axios from "axios";

const FALLBACK_API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://careercopilot-api.onrender.com"
    : "http://127.0.0.1:8000";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || FALLBACK_API_BASE_URL;

const AUTH_TOKEN_KEY = "careercopilot_token";
const LEGACY_AUTH_TOKEN_KEY = "token";

function readStoredAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem(AUTH_TOKEN_KEY) ||
    localStorage.getItem(LEGACY_AUTH_TOKEN_KEY)
  );
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = readStoredAuthToken();

  if (
    token &&
    token !== "undefined" &&
    token !== "null" &&
    token.trim().length > 10
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (config.headers) {
    delete config.headers.Authorization;
  }

  return config;
});

export function saveAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
  }
}

export function getAuthToken() {
  return readStoredAuthToken();
}

export function clearAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
  }
}
