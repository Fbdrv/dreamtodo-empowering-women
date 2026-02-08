import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthProvider';
import {
  Challenge,
  CommunityWin,
  DailyProgress,
  Dream,
  FocusArea,
  Habit,
  UserProfile,
  Badge,
} from '@/types';
import {
  BADGES,
  COMMUNITY_WINS,
  DAILY_CHALLENGES,
} from '@/mocks/data';

const STORAGE_KEY_PREFIX = 'dreaming_to_doing_app_';

interface AppState {
  profile: UserProfile;
  dreams: Dream[];
  habits: Habit[];
  challenges: Challenge[];
  communityWins: CommunityWin[];
  badges: Badge[];
  dailyProgress: DailyProgress;
}

const defaultProfile: UserProfile = {
  name: '',
  focusAreas: [],
  dreamGoals: [],
  totalPoints: 245,
  currentStreak: 7,
  bestStreak: 14,
  habitsCompleted: 48,
  challengesCompleted: 23,
  joinedAt: '2026-01-15',
  hasCompletedOnboarding: false,
};

const getDefaultState = (): AppState => ({
  profile: defaultProfile,
  dreams: [],
  habits: [],
  challenges: DAILY_CHALLENGES,
  communityWins: COMMUNITY_WINS,
  badges: BADGES,
  dailyProgress: {
    date: new Date().toISOString().split('T')[0],
    habitsCompleted: 0,
    habitsTotal: 0,
    challengeCompleted: false,
    points: 0,
  },
});

export const [AppProvider, useApp] = createContextHook(() => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [state, setState] = useState<AppState>(getDefaultState());

  const storageKey = user ? `${STORAGE_KEY_PREFIX}${user.id}` : null;

  const stateQuery = useQuery({
    queryKey: ['appState', storageKey],
    queryFn: async () => {
      if (!storageKey) return getDefaultState();
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored) as Partial<AppState>;
          console.log('[app] Loaded local state for user:', user?.id);
          return { ...getDefaultState(), ...parsed };
        }
      } catch (e) {
        console.log('[app] Failed to load local state:', e);
      }
      return getDefaultState();
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (stateQuery.data) {
      setState(stateQuery.data);
    }
  }, [stateQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (newState: AppState) => {
      if (!storageKey) return newState;
      await AsyncStorage.setItem(storageKey, JSON.stringify({
        profile: newState.profile,
        dreams: newState.dreams,
        habits: newState.habits,
        badges: newState.badges,
        dailyProgress: newState.dailyProgress,
      }));
      console.log('[app] Saved state locally for user:', user?.id);
      return newState;
    },
  });

  // Reset state when user changes
  useEffect(() => {
    if (!user) {
      setState(getDefaultState());
      queryClient.removeQueries({ queryKey: ['appState'] });
    }
  }, [user, queryClient]);

  const { mutate: saveLocal } = saveMutation;

  const persist = useCallback((newState: AppState) => {
    setState(newState);
    saveLocal(newState);
  }, [saveLocal]);

  const completeOnboarding = useCallback((name: string, focusAreas: FocusArea[], dreamGoals: string[]) => {
    const updated = {
      ...state,
      profile: {
        ...state.profile,
        name,
        focusAreas,
        dreamGoals,
        hasCompletedOnboarding: true,
      },
    };
    persist(updated);
  }, [state, persist]);

  const toggleHabitComplete = useCallback((habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = {
      ...state,
      habits: state.habits.map(h => {
        if (h.id !== habitId) return h;
        const isCompleted = h.completedDates.includes(today);
        const newDates = isCompleted
          ? h.completedDates.filter(d => d !== today)
          : [...h.completedDates, today];
        return {
          ...h,
          completedDates: newDates,
          streak: isCompleted ? Math.max(0, h.streak - 1) : h.streak + 1,
          bestStreak: isCompleted ? h.bestStreak : Math.max(h.bestStreak, h.streak + 1),
        };
      }),
      dailyProgress: {
        ...state.dailyProgress,
        habitsCompleted: state.habits.filter(h => {
          if (h.id === habitId) return !h.completedDates.includes(today);
          return h.completedDates.includes(today);
        }).length,
      },
      profile: {
        ...state.profile,
        habitsCompleted: state.profile.habitsCompleted + 1,
        totalPoints: state.profile.totalPoints + 10,
      },
    };
    persist(updated);
  }, [state, persist]);

  const completeChallenge = useCallback((challengeId: string) => {
    const updated = {
      ...state,
      challenges: state.challenges.map(c =>
        c.id === challengeId ? { ...c, isCompleted: true } : c
      ),
      dailyProgress: {
        ...state.dailyProgress,
        challengeCompleted: true,
        points: state.dailyProgress.points + 25,
      },
      profile: {
        ...state.profile,
        challengesCompleted: state.profile.challengesCompleted + 1,
        totalPoints: state.profile.totalPoints + 25,
      },
    };
    persist(updated);
  }, [state, persist]);

  const cheerWin = useCallback((winId: string) => {
    const updated = {
      ...state,
      communityWins: state.communityWins.map(w =>
        w.id === winId ? { ...w, cheers: w.cheers + 1, hasCheered: true } : w
      ),
    };
    setState(updated);
  }, [state]);

  const addDream = useCallback((title: string, description: string, focusArea: FocusArea) => {
    const newDream: Dream = {
      id: `d${Date.now()}`,
      title,
      description,
      focusArea,
      createdAt: new Date().toISOString().split('T')[0],
      habits: [],
      progress: 0,
    };
    const updated = {
      ...state,
      dreams: [...state.dreams, newDream],
    };
    persist(updated);
  }, [state, persist]);

  const addHabit = useCallback((title: string, frequency: 'daily' | 'weekly', dreamId?: string) => {
    const newHabit: Habit = {
      id: `h${Date.now()}`,
      title,
      dreamId,
      frequency,
      streak: 0,
      bestStreak: 0,
      completedDates: [],
      createdAt: new Date().toISOString().split('T')[0],
      isActive: true,
    };
    const updated = {
      ...state,
      habits: [...state.habits, newHabit],
    };
    persist(updated);
  }, [state, persist]);

  const todayCompletedHabits = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return state.habits.filter(h => h.completedDates.includes(today)).length;
  }, [state.habits]);

  return {
    ...state,
    isLoading: stateQuery.isLoading,
    completeOnboarding,
    toggleHabitComplete,
    completeChallenge,
    cheerWin,
    addDream,
    addHabit,
    todayCompletedHabits,
  };
});
