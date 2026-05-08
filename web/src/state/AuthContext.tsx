import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@streak/shared";
import { fetchMe } from "../api/auth";
import { setToken, getToken, ApiError } from "../api/client";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  setSession: (token: string, user: User) => void;
  setUser: (user: User) => void;
  signOut: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

const USER_KEY = "streak.user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tok = getToken();
    if (!tok) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then(({ user: u }) => {
        setUser(u);
        localStorage.setItem(USER_KEY, JSON.stringify(u));
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          setToken(null);
          localStorage.removeItem(USER_KEY);
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const setSession = (token: string, u: User) => {
    setToken(token);
    setUser(u);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  };

  const updateUser = (u: User) => {
    setUser(u);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  };

  const signOut = () => {
    setToken(null);
    localStorage.removeItem(USER_KEY);
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
