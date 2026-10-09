import { useEffect } from "react";
import { useStore } from "../store/store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useStore((state) => state.themeStore);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
}