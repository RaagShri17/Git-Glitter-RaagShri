import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  blue: {
    name: 'Blue',
    dotClass: 'bg-blue-600',
    bannerBg: 'bg-blue-50/70',
    bannerBorder: 'bg-blue-100',
    textColor: 'text-blue-600',
    primaryBg: 'bg-blue-600 hover:bg-blue-700 text-white',
    accentLight: 'bg-blue-50 text-blue-700',
  },
  emerald: {
    name: 'Emerald',
    dotClass: 'bg-emerald-600',
    bannerBg: 'bg-emerald-50/70',
    bannerBorder: 'bg-emerald-100',
    textColor: 'text-emerald-600',
    primaryBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    accentLight: 'bg-emerald-50 text-emerald-700',
  },
  purple: {
    name: 'Purple',
    dotClass: 'bg-purple-600',
    bannerBg: 'bg-purple-50/70',
    bannerBorder: 'bg-purple-100',
    textColor: 'text-purple-600',
    primaryBg: 'bg-purple-600 hover:bg-purple-700 text-white',
    accentLight: 'bg-purple-50 text-purple-700',
  },
  rose: {
    name: 'Rose',
    dotClass: 'bg-rose-500',
    bannerBg: 'bg-rose-50/70',
    bannerBorder: 'bg-rose-100',
    textColor: 'text-rose-500',
    primaryBg: 'bg-rose-500 hover:bg-rose-600 text-white',
    accentLight: 'bg-rose-50 text-rose-700',
  },
  amber: {
    name: 'Amber',
    dotClass: 'bg-amber-500',
    bannerBg: 'bg-amber-50/70',
    bannerBorder: 'bg-amber-100',
    textColor: 'text-amber-600',
    primaryBg: 'bg-amber-500 hover:bg-amber-600 text-white',
    accentLight: 'bg-amber-50 text-amber-700',
  },
  slate: {
    name: 'Slate',
    dotClass: 'bg-slate-700',
    bannerBg: 'bg-slate-100/70',
    bannerBorder: 'bg-slate-200',
    textColor: 'text-slate-700',
    primaryBg: 'bg-slate-700 hover:bg-slate-800 text-white',
    accentLight: 'bg-slate-100 text-slate-800',
  }
};

export function ThemeProvider({ children }) {
  const [currentTheme, setThemeState] = useState(() => {
    return localStorage.getItem('studiora_theme') || 'blue';
  });

  const setTheme = (themeKey) => {
    if (themes[themeKey]) {
      setThemeState(themeKey);
      localStorage.setItem('studiora_theme', themeKey);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
