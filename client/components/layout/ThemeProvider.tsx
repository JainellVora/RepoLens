import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ThemeMode = "dark" | "light" | "system";

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "repolens-theme";

function getInitialMode(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === "dark" || saved === "light" || saved === "system" ? saved : "system";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const isDark = mode === "dark" || (mode === "system" && media.matches);
      root.classList.toggle("dark", isDark);
      root.classList.toggle("light", !isDark);
      root.style.colorScheme = isDark ? "dark" : "light";
    };
    apply();
    window.localStorage.setItem(STORAGE_KEY, mode);
    if (mode === "system") {
      media.addEventListener("change", apply);
      return () => media.removeEventListener("change", apply);
    }
  }, [mode]);

  const value = useMemo(() => ({ mode, setMode }), [mode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
