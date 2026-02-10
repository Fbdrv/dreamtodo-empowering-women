import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  email: string;
  username: string;
}

function mapSupabaseUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email ?? '',
    username: user.user_metadata?.username ?? user.email?.split('@')[0] ?? '',
  };
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('[auth] Initial session:', currentSession ? 'exists' : 'none');
      setSession(currentSession);
      if (currentSession?.user) {
        setUser(mapSupabaseUser(currentSession.user));
      }
      setIsReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      console.log('[auth] Auth state changed:', _event);
      setSession(newSession);
      if (newSession?.user) {
        setUser(mapSupabaseUser(newSession.user));
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const registerMutation = useMutation({
    mutationFn: async ({ email, username, password }: { email: string; username: string; password: string }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });

      if (error) {
        console.log('[auth] Register error from Supabase:', error.message);
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Registration failed. Please try again.');
      }

      console.log('[auth] Register success:', data.user.email);
      return mapSupabaseUser(data.user);
    },
    onSuccess: (newUser) => {
      setUser(newUser);
    },
    onError: (error) => {
      console.log('[auth] Register error:', error.message);
    },
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log('[auth] Login error from Supabase:', error.message);
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Login failed. Please try again.');
      }

      console.log('[auth] Login success:', data.user.email);
      return mapSupabaseUser(data.user);
    },
    onSuccess: (loggedInUser) => {
      setUser(loggedInUser);
    },
    onError: (error) => {
      console.log('[auth] Login error:', error.message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.log('[auth] Logout error from Supabase:', error.message);
        throw new Error(error.message);
      }
      console.log('[auth] Logout success');
    },
    onSettled: () => {
      setUser(null);
      setSession(null);
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
    session,
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
