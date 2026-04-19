'use client';

import { useEffect, useState } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';

const THEME_KEY = 'streetbounty-theme';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const saved = localStorage.getItem(THEME_KEY) as Theme | null;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return saved ?? (prefersDark ? 'dark' : 'light');
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300/80 text-slate-700 transition-all duration-200 hover:scale-105 hover:text-sky-600 dark:border-slate-700 dark:text-slate-200 dark:hover:text-sky-300 sb-glass"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label="Toggle theme"
      type="button"
    >
      {theme === 'dark' ? <FaSun /> : <FaMoon />}
    </button>
  );
}
