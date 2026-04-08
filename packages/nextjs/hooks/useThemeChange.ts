"use client";

import { useCallback, useEffect, useState } from "react";
import { useTheme } from "next-themes";

export const useThemeChange = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = resolvedTheme === "dark";

  const toggleTheme = useCallback(() => {
    setTheme(isDarkMode ? "light" : "dark");
  }, [isDarkMode, setTheme]);

  return {
    isDarkMode,
    mounted,
    toggleTheme,
  };
};
