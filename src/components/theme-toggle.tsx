"use client";

import {
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { type JSX, useEffect, useState } from "react";

const THEME_PREFERENCES = ["light", "dark", "system"] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

const THEME_TO_NEXT_THEME: Record<ThemePreference, ThemePreference> = {
  light: "dark",
  dark: "system",
  system: "light",
};

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonIcon,
  system: ComputerDesktopIcon,
} as const;

function isThemePreference(value: string | null): value is ThemePreference {
  return (
    value !== null &&
    (THEME_PREFERENCES as readonly string[]).includes(value)
  );
}

function applyResolvedTheme(dark: boolean): void {
  document.documentElement.classList.toggle("dark", dark);
}

function applyPreference(preference: ThemePreference): void {
  const dark =
    preference === "dark" ||
    (preference === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  applyResolvedTheme(dark);
}

function getStoredTheme(): ThemePreference | null {
  try {
    const stored = localStorage.getItem("theme");
    return isThemePreference(stored) ? stored : null;
  } catch {
    return null;
  }
}

function setStoredTheme(theme: ThemePreference): void {
  try {
    localStorage.setItem("theme", theme);
  } catch {
    /* Safari private mode / blocked storage — theme still applies for this session */
  }
}

function readPreference(): ThemePreference {
  if (typeof window === "undefined") {
    return "system";
  }
  return getStoredTheme() ?? "system";
}

/**
 * Cycles light → dark → system. Preference lives in React state (synced from
 * localStorage after mount) so icon/label rendering stays in one place.
 */
export function ThemeToggle(): JSX.Element {
  const [themePreference, setThemePreference] =
    useState<ThemePreference>("system");

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const preference = readPreference();

    // Re-assert after hydration: React can reset <html> attributes while
    // reconciling server markup, undoing the pre-paint theme script.
    setThemePreference(preference);
    applyPreference(preference);

    const onMediaChange = (event: MediaQueryListEvent) => {
      if (readPreference() === "system") {
        applyResolvedTheme(event.matches);
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === "theme") {
        const next = isThemePreference(event.newValue)
          ? event.newValue
          : "system";
        setThemePreference(next);
        applyPreference(next);
      }
    };

    media.addEventListener("change", onMediaChange);
    window.addEventListener("storage", onStorage);

    return () => {
      media.removeEventListener("change", onMediaChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const nextTheme = THEME_TO_NEXT_THEME[themePreference];
  const ThemeIcon = THEME_ICONS[themePreference];

  const cycleTheme = () => {
    applyPreference(nextTheme);
    setStoredTheme(nextTheme);
    setThemePreference(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={`Current theme: ${themePreference}. Click to switch to ${nextTheme}`}
      title={`Current theme: ${themePreference}. Click to switch to ${nextTheme}`}
      className="rounded-full p-1 text-gray-400 hover:text-gray-500 focus:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden dark:text-gray-300 dark:hover:text-gray-100 dark:focus:ring-offset-gray-900"
    >
      <ThemeIcon className="h-6 w-6" aria-hidden="true" />
    </button>
  );
}
