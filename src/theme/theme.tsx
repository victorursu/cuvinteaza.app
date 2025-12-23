import type React from "react";
import { createContext, useContext, useMemo, useState } from "react";

export type ThemeMode = "dark" | "light";

export type Theme = {
  mode: ThemeMode;
  colors: {
    background: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    tabBarBg: string;
    tabActiveBg: string;
    tabDivider: string;
    iconActive: string;
    iconInactive: string;
    headerIconBg: string;
  };
};

const DARK: Theme = {
  mode: "dark",
  colors: {
    background: "#0B1220",
    textPrimary: "#EEF3FF",
    textSecondary: "#AAB6D6",
    border: "rgba(255,255,255,0.10)",
    tabBarBg: "rgba(11, 18, 32, 0.92)",
    tabActiveBg: "rgba(34, 48, 92, 0.85)",
    tabDivider: "rgba(255,255,255,0.12)",
    iconActive: "#EEF3FF",
    iconInactive: "#9FB0DA",
    headerIconBg: "#22305C",
  },
};

const LIGHT: Theme = {
  mode: "light",
  colors: {
    background: "#F5F7FF",
    textPrimary: "#0B1220",
    textSecondary: "rgba(11, 18, 32, 0.70)",
    border: "rgba(11, 18, 32, 0.10)",
    tabBarBg: "rgba(245, 247, 255, 0.92)",
    tabActiveBg: "rgba(11, 18, 32, 0.08)",
    tabDivider: "rgba(11, 18, 32, 0.12)",
    iconActive: "#0B1220",
    iconInactive: "rgba(11, 18, 32, 0.55)",
    headerIconBg: "rgba(11, 18, 32, 0.08)",
  },
};

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const value = useMemo(() => {
    const theme = mode === "dark" ? DARK : LIGHT;
    return {
      theme,
      toggle: () => setMode((m) => (m === "dark" ? "light" : "dark")),
    };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}





