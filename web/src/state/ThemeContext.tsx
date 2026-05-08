import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { THEMES, DEFAULT_THEME, findTheme, type Theme } from "../theme/themes";

interface ThemeCtx {
  theme: Theme;
  themes: Theme[];
  setTheme: (theme: Theme) => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

const THEME_KEY = "streak.theme";

function applyTheme(theme: Theme) {
  const root = document.documentElement.style;
  root.setProperty("--bg", theme.bg);
  root.setProperty("--sage-deep", theme.accent);
  if (theme.mode === "dark") {
    root.setProperty("--bg-text", "#FBF8F2");
    root.setProperty("--bg-text-soft", "rgba(251,248,242,0.82)");
    root.setProperty("--bg-text-mute", "rgba(251,248,242,0.62)");
    root.setProperty("--bg-line", "rgba(251,248,242,0.22)");
    root.setProperty("--bg-line-strong", "rgba(251,248,242,0.42)");
  } else {
    root.setProperty("--bg-text", "#1B1A16");
    root.setProperty("--bg-text-soft", "#4A4640");
    root.setProperty("--bg-text-mute", "#8A857C");
    root.setProperty("--bg-line", "#E2DACA");
    root.setProperty("--bg-line-strong", "#C9BFA9");
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      return findTheme(localStorage.getItem(THEME_KEY));
    } catch {
      return DEFAULT_THEME;
    }
  });

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_KEY, theme.id);
    } catch {
      // localStorage unavailable; ignore
    }
  }, [theme]);

  const value = useMemo(
    () => ({ theme, themes: THEMES, setTheme: setThemeState }),
    [theme],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
