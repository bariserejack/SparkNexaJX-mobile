import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '../constants/Theme';

type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  activeTheme: typeof Theme.light;
  isDark: boolean;
  isReady: boolean;
};

const STORAGE_KEY = 'sparknexajx_theme_mode';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadThemePreference = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (mounted && (stored === 'light' || stored === 'dark')) {
          setThemeModeState(stored);
        }
      } catch (error) {
        console.warn('Failed to read theme mode from storage:', error);
      } finally {
        if (mounted) {
          setIsReady(true);
        }
      }
    };

    loadThemePreference();

    return () => {
      mounted = false;
    };
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(STORAGE_KEY, mode).catch((error) => {
      console.warn('Failed to save theme mode:', error);
    });
  }, []);

  const value = useMemo(
    () => ({
      themeMode,
      setThemeMode,
      activeTheme: themeMode === 'dark' ? Theme.dark : Theme.light,
      isDark: themeMode === 'dark',
      isReady,
    }),
    [themeMode, setThemeMode, isReady]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used inside ThemeProvider');
  }
  return context;
}
