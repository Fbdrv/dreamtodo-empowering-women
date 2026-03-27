import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

console.log('[supabase] URL configured:', supabaseUrl ? 'yes' : 'MISSING');
console.log('[supabase] Anon key configured:', supabaseAnonKey ? 'yes' : 'MISSING');

const AsyncStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const value = await AsyncStorage.getItem(key);
      console.log('[supabase] Storage getItem:', key, value ? `(${value.length} bytes)` : '(null)');
      return value;
    } catch (e) {
      console.log('[supabase] Storage getItem error:', key, e);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      console.log('[supabase] Storage setItem:', key, `(${value.length} bytes)`);
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.log('[supabase] Storage setItem error:', key, e);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      console.log('[supabase] Storage removeItem:', key);
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.log('[supabase] Storage removeItem error:', key, e);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
