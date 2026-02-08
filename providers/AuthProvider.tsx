import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

const USER_KEY = 'local_user';

interface AuthUser {
  id: string;
  email: string;
  username: string;
}

interface StoredAuth {
  user: AuthUser;
  password: string;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ['localUser'],
    queryFn: async () => {
      try {
        const stored = await SecureStore.getItemAsync(USER_KEY);
        console.log('[auth] Loaded stored user:', stored ? 'exists' : 'none');
        if (stored) {
          const parsed = JSON.parse(stored) as StoredAuth;
          return parsed.user;
        }
        return null;
      } catch (e) {
        console.log('[auth] Failed to load user:', e);
        return null;
      }
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    if (userQuery.data !== undefined) {
      setUser(userQuery.data);
      setIsReady(true);
    } else if (!userQuery.isLoading) {
      setIsReady(true);
    }
  }, [userQuery.data, userQuery.isLoading]);

  const registerMutation = useMutation({
    mutationFn: async ({ email, username, password }: { email: string; username: string; password: string }) => {
      const existing = await SecureStore.getItemAsync(USER_KEY);
      if (existing) {
        const parsed = JSON.parse(existing) as StoredAuth;
        if (parsed.user.email === email) {
          throw new Error('An account with this email already exists');
        }
      }

      const newUser: AuthUser = {
        id: `user_${Date.now()}`,
        email,
        username,
      };

      const authData: StoredAuth = { user: newUser, password };
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(authData));
      console.log('[auth] Register success:', newUser.email);
      return newUser;
    },
    onSuccess: (newUser) => {
      setUser(newUser);
      queryClient.invalidateQueries({ queryKey: ['localUser'] });
    },
    onError: (error) => {
      console.log('[auth] Register error:', error.message);
    },
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const stored = await SecureStore.getItemAsync(USER_KEY);
      if (!stored) {
        throw new Error('No account found. Please create an account first.');
      }

      const parsed = JSON.parse(stored) as StoredAuth;
      if (parsed.user.email !== email) {
        throw new Error('No account found with this email');
      }
      if (parsed.password !== password) {
        throw new Error('Incorrect password');
      }

      console.log('[auth] Login success:', parsed.user.email);
      return parsed.user;
    },
    onSuccess: (loggedInUser) => {
      setUser(loggedInUser);
      queryClient.invalidateQueries({ queryKey: ['localUser'] });
    },
    onError: (error) => {
      console.log('[auth] Login error:', error.message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await SecureStore.deleteItemAsync(USER_KEY);
      console.log('[auth] Logout success');
    },
    onSettled: () => {
      setUser(null);
      queryClient.clear();
    },
  });

  const { mutateAsync: registerAsync } = registerMutation;
  const { mutateAsync: loginAsync } = loginMutation;
  const { mutate: logoutMutate } = logoutMutation;

  const register = useCallback(
    (email: string, username: string, password: string) => {
      return registerAsync({ email, username, password });
    },
    [registerAsync]
  );

  const login = useCallback(
    (email: string, password: string) => {
      return loginAsync({ email, password });
    },
    [loginAsync]
  );

  const logout = useCallback(() => {
    logoutMutate();
  }, [logoutMutate]);

  return {
    user,
    isAuthenticated: !!user,
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
