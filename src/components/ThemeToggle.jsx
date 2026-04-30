import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";
  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
      <span>{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
