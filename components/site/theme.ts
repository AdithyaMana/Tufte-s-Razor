import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'tufte_theme';

function readSaved(): 'light' | 'dark' | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : null;
  } catch {
    return null;
  }
}

/** Theme state: a saved choice wins, otherwise follow the system setting. */
export function useThemeState() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => {
      if (!readSaved()) setIsDark(event.matches);
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const toggle = useCallback(() => {
    const next = !isDark;
    setIsDark(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    } catch {
      // Storage can be blocked; the toggle still works for this visit.
    }
  }, [isDark]);

  return { isDark, toggle };
}

export const ThemeContext = createContext(false);

export function useIsDark() {
  return useContext(ThemeContext);
}
