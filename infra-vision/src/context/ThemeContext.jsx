import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

const STORAGE_KEY = 'infravision-theme';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  const salvo = window.localStorage.getItem(STORAGE_KEY);
  if (salvo === 'light' || salvo === 'dark') return salvo;
  return 'dark'; // tema padrão: o "Tradicional" (escuro)
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme precisa ser usado dentro de um <ThemeProvider>');
  return ctx;
}
