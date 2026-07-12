import { type JSX } from "react";

const themeScript = `(function () {
  try {
    var stored = localStorage.getItem("theme");
    var pref =
      stored === "light" || stored === "dark" || stored === "system"
        ? stored
        : "system";
    var dark =
      pref === "dark" ||
      (pref === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.setAttribute("data-theme-pref", pref);
  } catch (e) {
    /* no-op */
  }
})();`;

/**
 * Applies the saved (or system) theme before first paint to avoid a flash
 * of the wrong theme. Rendered in <head> so it is not part of the hydrated
 * body tree (a body <script> shifts React useId slots used by Headless UI).
 */
export function ThemeScript(): JSX.Element {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      suppressHydrationWarning
    />
  );
}
