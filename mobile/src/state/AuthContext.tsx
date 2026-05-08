import {
  createContext, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User } from "@streak/shared";
import { fetchMe } from "../api";
import { saveToken, loadToken, ApiError } from "../api/client";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  setSession: (token: string, user: User) => Promise<void>;
  setUser: (user: User) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);
const USER_KEY = "streak.user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(USER_KEY);
        if (raw) setUser(JSON.parse(raw) as User);
        const tok = await loadToken();
        if (tok) {
          try {
            const { user: u } = await fetchMe();
            setUser(u);
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
          } catch (e) {
            if (e instanceof ApiError && e.status === 401) {
              await saveToken(null);
              await AsyncStorage.removeItem(USER_KEY);
              setUser(null);
            }
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setSession = async (token: string, u: User) => {
    await saveToken(token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  };

  const updateUser = async (u: User) => {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  };

  const signOut = async () => {
    await saveToken(null);
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, setSession, setUser: updateUser, signOut }),
    [user, loading],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
