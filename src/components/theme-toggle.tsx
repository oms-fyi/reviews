"use client";

import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { type JSX, useEffect } from "react";

function applyTheme(dark: boolean): void {
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

/**
 * Toggles the `dark` class on <html> and persists the choice. Both icons are
 * rendered and CSS decides which one is visible, so there is no client state
 * to hydrate and no flash of the wrong icon.
 */
export function ThemeToggle(): JSX.Element {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    // Re-assert the theme after hydration: React can reset the class
    // attribute on <html> while reconciling server markup, undoing the
    // pre-paint theme script.
    const theme = localStorage.getItem("theme");
    applyTheme(theme === "dark" || (theme !== "light" && media.matches));

    // Follow system preference changes while the user has no explicit choice.
    const onMediaChange = (event: MediaQueryListEvent) => {
      if (localStorage.getItem("theme") === null) {
        applyTheme(event.matches);
      }
    };

    // Keep multiple open tabs in sync.
    const onStorage = (event: StorageEvent) => {
      if (event.key === "theme") {
        applyTheme(
          event.newValue === "dark" ||
            (event.newValue === null && media.matches),
        );
      }
    };

    media.addEventListener("change", onMediaChange);
    window.addEventListener("storage", onStorage);

    return () => {
      media.removeEventListener("change", onMediaChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const toggleTheme = () => {
    const dark = !document.documentElement.classList.contains("dark");
    applyTheme(dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="rounded-full p-1 text-gray-400 hover:text-gray-500 focus:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden dark:text-gray-300 dark:hover:text-gray-100 dark:focus:ring-offset-gray-900"
    >
      <MoonIcon className="h-6 w-6 dark:hidden" aria-hidden="true" />
      <SunIcon className="hidden h-6 w-6 dark:block" aria-hidden="true" />
    </button>
  );
}
