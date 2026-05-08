import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL =
  (typeof process !== "undefined" && process.env.EXPO_PUBLIC_API_URL) ||
  "http://localhost:4000";

const TOKEN_KEY = "streak.token";

let cachedToken: string | null = null;

export async function loadToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  cachedToken = await AsyncStorage.getItem(TOKEN_KEY);
  return cachedToken;
}
export async function saveToken(t: string | null): Promise<void> {
  cachedToken = t;
  if (t) await AsyncStorage.setItem(TOKEN_KEY, t);
  else await AsyncStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export async function api<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init.headers as Record<string, string>) ?? {}),
  };
  const tok = await loadToken();
  if (tok) headers.Authorization = `Bearer ${tok}`;
  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  let body: unknown = null;
  try { body = await res.json(); } catch { /* empty */ }
  if (!res.ok) {
    const msg =
      (body && typeof body === "object" && "error" in body && typeof (body as { error: unknown }).error === "string"
        ? (body as { error: string }).error
        : null) ?? `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, body);
  }
  return body as T;
}

export const API_BASE_URL = BASE_URL;
