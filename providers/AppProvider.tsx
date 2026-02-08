import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthProvider';
import {
  Challenge,
  DailyProgress,
  Dream,
  FocusArea,
  Goal,
  Habit,
  UserProfile,
  EarnedBadge,
  BadgeDefinition,
} from '@/types';
import { BADGE_DEFINITIONS } from '@/mocks/data';

const STORAGE_KEY_PREFIX = 'dreaming_to_doing_app_';

interface AppState {
  profile: UserProfile;
  goals: Goal[];
  dreams: Dream[];
  habits: Habit[];
  challenges: Challenge[];
  earnedBadges: EarnedBadge[];
  dailyProgress: DailyProgress;
}

const defaultProfile: UserProfile = {
  name: '',
  focusAreas: [],
  dreamGoals: [],
  totalPoints: 0,
  currentStreak: 0,
  bestStreak: 0,
  habitsCompleted: 0,
  challengesCompleted: 0,
  joinedAt: new Date().toISOString().split('T')[0],
  hasCompletedOnboarding: false,
};

const getDefaultState = (): AppState => ({
  profile: defaultProfile,
  goals: [],
  dreams: [],
  habits: [],
  challenges: [],
  earnedBadges: [],
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
  const [newlyEarnedBadge, setNewlyEarnedBadge] = useState<BadgeDefinition | null>(null);

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
          const defaultState = getDefaultState();

          const migratedChallenges = (parsed.challenges ?? []).filter(
            (c: any) => c.goalId && typeof c.goalId === 'string' && !c.type
          ) as Challenge[];
          if (migratedChallenges.length !== (parsed.challenges ?? []).length) {
            console.log('[app] Migrated out', (parsed.challenges ?? []).length - migratedChallenges.length, 'old-format challenges');
          }

          return {
            ...defaultState,
            ...parsed,
            challenges: migratedChallenges,
            profile: { ...defaultState.profile, ...parsed.profile },
          };
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
        goals: newState.goals,
        dreams: newState.dreams,
        habits: newState.habits,
        challenges: newState.challenges,
        earnedBadges: newState.earnedBadges,
        dailyProgress: newState.dailyProgress,
      }));
      console.log('[app] Saved state locally for user:', user?.id);
      return newState;
    },
  });

  useEffect(() => {
    if (!user) {
      setState(getDefaultState());
      queryClient.removeQueries({ queryKey: ['appState'] });
    }
  }, [user, queryClient]);

  const { mutate: saveLocal } = saveMutation;

  const checkAndAwardBadges = useCallback((currentState: AppState): EarnedBadge[] => {
    const newBadges: EarnedBadge[] = [...currentState.earnedBadges];
    const earnedIds = new Set(newBadges.map(b => b.badgeId));
    
    for (const badge of BADGE_DEFINITIONS) {
      if (earnedIds.has(badge.id)) continue;
      
      let earned = false;
      const { condition } = badge;
      
      switch (condition.type) {
        case 'first_challenge':
          earned = currentState.profile.challengesCompleted >= 1;
          break;
        case 'challenges_completed':
          earned = currentState.profile.challengesCompleted >= condition.count;
          break;
        case 'streak':
          earned = currentState.profile.currentStreak >= condition.days || 
                   currentState.profile.bestStreak >= condition.days;
          break;
        case 'goals_created':
          earned = currentState.goals.length >= condition.count;
          break;
        case 'habits_completed':
          earned = currentState.profile.habitsCompleted >= condition.count;
          break;
      }
      
      if (earned) {
        newBadges.push({ badgeId: badge.id, earnedAt: new Date().toISOString() });
        setNewlyEarnedBadge(badge);
      }
    }
    
    return newBadges;
  }, []);

  const persist = useCallback((newState: AppState, skipBadgeCheck = false) => {
    let finalState = newState;
    if (!skipBadgeCheck) {
      const updatedBadges = checkAndAwardBadges(newState);
      finalState = { ...newState, earnedBadges: updatedBadges };
    }
    setState(finalState);
    saveLocal(finalState);
  }, [saveLocal, checkAndAwardBadges]);

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

  const addGoal = useCallback((title: string, description: string, color: string, emoji: string) => {
    if (state.goals.length >= 4) {
      console.log('[app] Maximum 4 goals allowed');
      return;
    }
    const newGoal: Goal = {
      id: `g${Date.now()}`,
      title,
      description: description || undefined,
      color,
      emoji,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = {
      ...state,
      goals: [...state.goals, newGoal],
    };
    persist(updated);
  }, [state, persist]);

  const updateGoal = useCallback((goalId: string, title: string, description: string, color: string, emoji: string) => {
    const updated = {
      ...state,
      goals: state.goals.map(g => 
        g.id === goalId ? { ...g, title, description: description || undefined, color, emoji } : g
      ),
    };
    persist(updated, true);
  }, [state, persist]);

  const deleteGoal = useCallback((goalId: string) => {
    const updated = {
      ...state,
      goals: state.goals.filter(g => g.id !== goalId),
      challenges: state.challenges.filter(c => c.goalId !== goalId),
    };
    persist(updated, true);
  }, [state, persist]);

  const addChallenge = useCallback((title: string, description: string, goalId: string, duration: string) => {
    const newChallenge: Challenge = {
      id: `c${Date.now()}`,
      title,
      description,
      goalId,
      duration,
      isCompleted: false,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = {
      ...state,
      challenges: [...state.challenges, newChallenge],
    };
    persist(updated, true);
  }, [state, persist]);

  const updateChallenge = useCallback((challengeId: string, title: string, description: string, goalId: string, duration: string) => {
    const updated = {
      ...state,
      challenges: state.challenges.map(c =>
        c.id === challengeId ? { ...c, title, description, goalId, duration } : c
      ),
    };
    persist(updated, true);
  }, [state, persist]);

  const deleteChallenge = useCallback((challengeId: string) => {
    const updated = {
      ...state,
      challenges: state.challenges.filter(c => c.id !== challengeId),
    };
    persist(updated, true);
  }, [state, persist]);

  const completeChallenge = useCallback((challengeId: string) => {
    const updated = {
      ...state,
      challenges: state.challenges.map(c =>
        c.id === challengeId ? { ...c, isCompleted: true, completedAt: new Date().toISOString() } : c
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

  const toggleHabitComplete = useCallback((habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const isCompleted = habit.completedDates.includes(today);
    const newHabitsCompleted = isCompleted 
      ? state.profile.habitsCompleted 
      : state.profile.habitsCompleted + 1;
    
    const updated = {
      ...state,
      habits: state.habits.map(h => {
        if (h.id !== habitId) return h;
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
        habitsCompleted: newHabitsCompleted,
        totalPoints: isCompleted ? state.profile.totalPoints : state.profile.totalPoints + 10,
      },
    };
    persist(updated);
  }, [state, persist]);

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
    persist(updated, true);
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
    persist(updated, true);
  }, [state, persist]);

  const clearNewlyEarnedBadge = useCallback(() => {
    setNewlyEarnedBadge(null);
  }, []);

  const todayCompletedHabits = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return state.habits.filter(h => h.completedDates.includes(today)).length;
  }, [state.habits]);

  const badges = useMemo(() => {
    return BADGE_DEFINITIONS.map(def => {
      const earned = state.earnedBadges.find(e => e.badgeId === def.id);
      return {
        ...def,
        isEarned: !!earned,
        earnedAt: earned?.earnedAt,
      };
    });
  }, [state.earnedBadges]);

  const getChallengesByGoal = useCallback((goalId: string) => {
    return state.challenges.filter(c => c.goalId === goalId);
  }, [state.challenges]);

  return {
    profile: state.profile,
    goals: state.goals,
    dreams: state.dreams,
    habits: state.habits,
    challenges: state.challenges,
    earnedBadges: state.earnedBadges,
    dailyProgress: state.dailyProgress,
    badges,
    isLoading: stateQuery.isLoading,
    newlyEarnedBadge,
    clearNewlyEarnedBadge,
    completeOnboarding,
    addGoal,
    updateGoal,
    deleteGoal,
    addChallenge,
    updateChallenge,
    deleteChallenge,
    completeChallenge,
    toggleHabitComplete,
    addDream,
    addHabit,
    todayCompletedHabits,
    getChallengesByGoal,
  };
});
