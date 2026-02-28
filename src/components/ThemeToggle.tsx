"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const THEME_KEY = "theme";

function applyTheme(isDark: boolean) {
  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";
}

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const darkEnabled = savedTheme ? savedTheme === "dark" : prefersDark;

    applyTheme(darkEnabled);
    setIsDark(darkEnabled);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextIsDark = !isDark;
    applyTheme(nextIsDark);
    localStorage.setItem(THEME_KEY, nextIsDark ? "dark" : "light");
    setIsDark(nextIsDark);
  };

  if (!mounted) {
    return (
      <Button variant="outline" size="icon-sm" disabled aria-label="Cambiar tema">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon-sm"
      onClick={toggleTheme}
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
