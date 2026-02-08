import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { trpc } from '@/lib/trpc';
import { setTrpcAuthToken } from '@/lib/trpc';

const TOKEN_KEY = 'auth_token';

interface AuthUser {
  id: string;
  email: string;
  username: string;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const tokenQuery = useQuery({
    queryKey: ['authToken'],
    queryFn: async () => {
      try {
        const stored = await SecureStore.getItemAsync(TOKEN_KEY);
        console.log('[auth] Loaded stored token:', stored ? 'exists' : 'none');
        return stored;
      } catch (e) {
        console.log('[auth] Failed to load token:', e);
        return null;
      }
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    if (tokenQuery.data !== undefined) {
      const storedToken = tokenQuery.data ?? null;
      setToken(storedToken);
      setTrpcAuthToken(storedToken);
      if (!storedToken) {
        setIsReady(true);
      }
    } else if (!tokenQuery.isLoading) {
      setIsReady(true);
    }
  }, [tokenQuery.data, tokenQuery.isLoading]);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (meQuery.data) {
      setUser(meQuery.data);
      setIsReady(true);
      console.log('[auth] User verified:', meQuery.data.email);
    } else if (meQuery.error && token) {
      console.log('[auth] Token invalid, clearing');
      setToken(null);
      setUser(null);
      setTrpcAuthToken(null);
      SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
      setIsReady(true);
    }
  }, [meQuery.data, meQuery.error, token]);

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async (data) => {
      console.log('[auth] Register success:', data.user.email);
      setToken(data.token);
      setUser(data.user);
      setTrpcAuthToken(data.token);
      await SecureStore.setItemAsync(TOKEN_KEY, data.token);
      queryClient.invalidateQueries({ queryKey: ['authToken'] });
    },
    onError: (error) => {
      console.log('[auth] Register error:', error.message);
    },
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data) => {
      console.log('[auth] Login success:', data.user.email);
      setToken(data.token);
      setUser(data.user);
      setTrpcAuthToken(data.token);
      await SecureStore.setItemAsync(TOKEN_KEY, data.token);
      queryClient.invalidateQueries({ queryKey: ['authToken'] });
    },
    onError: (error) => {
      console.log('[auth] Login error:', error.message);
    },
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      console.log('[auth] Logout success');
    },
    onSettled: async () => {
      setToken(null);
      setUser(null);
      setTrpcAuthToken(null);
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      queryClient.clear();
    },
  });

  const register = useCallback(
    (email: string, username: string, password: string) => {
      return registerMutation.mutateAsync({ email, username, password });
    },
    [registerMutation]
  );

  const login = useCallback(
    (email: string, password: string) => {
      return loginMutation.mutateAsync({ email, password });
    },
    [loginMutation]
  );

  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  return {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isReady,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error?.message ?? null,
    registerError: registerMutation.error?.message ?? null,
    register,
    login,
    logout,
  };
});
