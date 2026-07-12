"use client";

import {
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { type JSX, useEffect } from "react";

export type ThemePreference = "light" | "dark" | "system";

const PREFERENCE_ORDER: ThemePreference[] = ["light", "dark", "system"];

function applyResolvedTheme(dark: boolean): void {
  document.documentElement.classList.toggle("dark", dark);
}

function applyPreference(preference: ThemePreference): void {
  const dark =
    preference === "dark" ||
    (preference === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  applyResolvedTheme(dark);
  document.documentElement.setAttribute("data-theme-pref", preference);
}

function getStoredTheme(): string | null {
  try {
    return localStorage.getItem("theme");
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
  const stored = getStoredTheme();
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

function nextPreference(current: ThemePreference): ThemePreference {
  const index = PREFERENCE_ORDER.indexOf(current);
  return PREFERENCE_ORDER[(index + 1) % PREFERENCE_ORDER.length];
}

/**
 * Cycles light → dark → system. Icons follow data-theme-pref on <html>
 * (set by the pre-paint script and kept in sync here) so there is no
 * preference state to hydrate.
 */
export function ThemeToggle(): JSX.Element {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    // Re-assert after hydration: React can reset <html> attributes while
    // reconciling server markup, undoing the pre-paint theme script.
    applyPreference(readPreference());

    const onMediaChange = (event: MediaQueryListEvent) => {
      if (readPreference() === "system") {
        applyResolvedTheme(event.matches);
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === "theme") {
        applyPreference(
          event.newValue === "light" ||
            event.newValue === "dark" ||
            event.newValue === "system"
            ? event.newValue
            : "system",
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

  const cycleTheme = () => {
    const next = nextPreference(readPreference());
    applyPreference(next);
    setStoredTheme(next);
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label="Cycle color theme (light, dark, or system)"
      title="Cycle color theme (light, dark, or system)"
      className="rounded-full p-1 text-gray-400 hover:text-gray-500 focus:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden dark:text-gray-300 dark:hover:text-gray-100 dark:focus:ring-offset-gray-900"
    >
      <SunIcon
        className="theme-pref-icon theme-pref-icon--light h-6 w-6"
        aria-hidden="true"
      />
      <MoonIcon
        className="theme-pref-icon theme-pref-icon--dark h-6 w-6"
        aria-hidden="true"
      />
      <ComputerDesktopIcon
        className="theme-pref-icon theme-pref-icon--system h-6 w-6"
        aria-hidden="true"
      />
    </button>
  );
}
