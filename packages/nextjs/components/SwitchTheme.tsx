"use client";

import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useThemeChange } from "~~/hooks/useThemeChange";

const SwitchTheme = ({ className }: { className?: string }) => {
  const { isDarkMode, mounted, toggleTheme } = useThemeChange();

  if (!mounted) {
    return (
      <button
        type="button"
        className={`flex h-10 w-10 items-center justify-center invisible ${className ?? ""}`}
        aria-hidden
        tabIndex={-1}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`flex h-10 w-10 items-center justify-center rounded-full hover:bg-base-content/5 transition-colors hover:cursor-pointer ${className ?? ""}`}
      aria-label="Toggle theme"
    >
      {isDarkMode ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
    </button>
  );
};

export default SwitchTheme;
