import { useCallback, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { lightColors, darkColors, ThemeColors } from '@/constants/colors';

export type ThemePreference = 'system' | 'light' | 'dark';
export type EffectiveTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'app_theme_preference';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const systemScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then(val => {
      if (val === 'light' || val === 'dark' || val === 'system') {
        setThemePreference(val);
      }
      setIsLoaded(true);
    }).catch(() => {
      setIsLoaded(true);
    });
  }, []);

  const effectiveTheme: EffectiveTheme = themePreference === 'system'
    ? (systemScheme ?? 'light')
    : themePreference;

  const colors: ThemeColors = effectiveTheme === 'dark' ? darkColors : lightColors;

  const setTheme = useCallback((pref: ThemePreference) => {
    setThemePreference(pref);
    AsyncStorage.setItem(THEME_STORAGE_KEY, pref).catch(e => {
      console.log('[theme] Failed to save preference:', e);
    });
  }, []);

  return { themePreference, effectiveTheme, colors, setTheme, isLoaded };
});

export function useColors(): ThemeColors {
  const { colors } = useTheme();
  return colors;
}
