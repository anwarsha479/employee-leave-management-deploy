import { createContext, useContext, useMemo, useState, useEffect } from "react";

// Context to track the current theme mode (light/dark)
const ThemeContext = createContext<any>(null);

export function ThemeProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize theme mode from localStorage, defaulting to dark mode
  const [mode, setMode] = useState(localStorage.getItem("theme") || "dark");

  // Synchronize theme state with the html root tag to support global CSS styling targeting
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  // Toggle active theme and save configuration changes to local browser storage
  const toggleTheme = () => {
    const newMode = mode === "dark" ? "light" : "dark";

    setMode(newMode);
    localStorage.setItem("theme", newMode);
  };

  const value = useMemo(
    () => ({
      mode,
      toggleTheme,
    }),
    [mode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// Custom hook to consume the active theme context values
export const useThemeContext = () => useContext(ThemeContext);
