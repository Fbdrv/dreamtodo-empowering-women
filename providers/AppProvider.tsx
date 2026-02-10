import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  GentleModeSettings,
  PremiumStatus,
} from '@/types';
import { BADGE_DEFINITIONS } from '@/mocks/data';
import {
  NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
  requestNotificationPermissions,
  scheduleDailyReminder,
  cancelDailyReminder,
} from '@/lib/notifications';
import {
  loadFullUserData,
  upsertProfile,
  upsertGoal,
  deleteGoalDB,
  upsertDream,
  upsertHabit,
  upsertChallenge,
  deleteChallengeDB,
  deleteChallengesByGoalDB,
  insertEarnedBadge,
  upsertGentleMode,
} from '@/lib/database';

const NOTIF_SETTINGS_KEY = 'dreaming_notif_settings_';

interface AppState {
  profile: UserProfile;
  goals: Goal[];
  dreams: Dream[];
  habits: Habit[];
  challenges: Challenge[];
  earnedBadges: EarnedBadge[];
  dailyProgress: DailyProgress;
  notificationSettings: NotificationSettings;
  gentleMode: GentleModeSettings;
  premium: PremiumStatus;
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

const defaultGentleMode: GentleModeSettings = {
  gentleModeEnabled: false,
  energyState: 'normal',
  restDays: [],
};

const defaultPremium: PremiumStatus = {
  isPremium: false,
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
  notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
  gentleMode: defaultGentleMode,
  premium: defaultPremium,
});

export const [AppProvider, useApp] = createContextHook(() => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [state, setState] = useState<AppState>(getDefaultState());
  const [newlyEarnedBadge, setNewlyEarnedBadge] = useState<BadgeDefinition | null>(null);

  const userId = user?.id ?? null;

  const stateQuery = useQuery({
    queryKey: ['appState', userId],
    queryFn: async () => {
      if (!userId) return getDefaultState();

      try {
        console.log('[app] Loading data from Supabase for user:', userId);
        const dbData = await loadFullUserData(userId);

        const notifKey = `${NOTIF_SETTINGS_KEY}${userId}`;
        let notifSettings = DEFAULT_NOTIFICATION_SETTINGS;
        try {
          const stored = await AsyncStorage.getItem(notifKey);
          if (stored) notifSettings = JSON.parse(stored);
        } catch (e) {
          console.log('[app] Failed to load notification settings:', e);
        }

        const today = new Date().toISOString().split('T')[0];
        const habits = dbData.habits ?? [];
        const todayCompleted = habits.filter(h => h.completedDates.includes(today)).length;

        const profile = dbData.profile ?? defaultProfile;
        const gentleMode = dbData.gentleMode ?? defaultGentleMode;

        const result: AppState = {
          profile,
          goals: dbData.goals ?? [],
          dreams: dbData.dreams ?? [],
          habits,
          challenges: dbData.challenges ?? [],
          earnedBadges: dbData.earnedBadges ?? [],
          dailyProgress: {
            date: today,
            habitsCompleted: todayCompleted,
            habitsTotal: habits.filter(h => h.isActive).length,
            challengeCompleted: false,
            points: 0,
          },
          notificationSettings: notifSettings,
          gentleMode,
          premium: defaultPremium,
        };

        console.log('[app] Supabase data loaded successfully');
        return result;
      } catch (e) {
        console.log('[app] Failed to load from Supabase:', e);
        return getDefaultState();
      }
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (stateQuery.data) {
      setState(stateQuery.data);
    }
  }, [stateQuery.data]);

  useEffect(() => {
    if (!user) {
      setState(getDefaultState());
      queryClient.removeQueries({ queryKey: ['appState'] });
    }
  }, [user, queryClient]);

  const saveNotifSettings = useCallback(async (settings: NotificationSettings) => {
    if (!userId) return;
    try {
      await AsyncStorage.setItem(`${NOTIF_SETTINGS_KEY}${userId}`, JSON.stringify(settings));
    } catch (e) {
      console.log('[app] Failed to save notification settings:', e);
    }
  }, [userId]);

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
        const newBadge: EarnedBadge = { badgeId: badge.id, earnedAt: new Date().toISOString() };
        newBadges.push(newBadge);
        setNewlyEarnedBadge(badge);
        if (userId) {
          insertEarnedBadge(userId, newBadge).catch(e =>
            console.log('[app] Failed to persist badge:', e)
          );
        }
      }
    }

    return newBadges;
  }, [userId]);

  const persist = useCallback((newState: AppState, skipBadgeCheck = false) => {
    let finalState = newState;
    if (!skipBadgeCheck) {
      const updatedBadges = checkAndAwardBadges(newState);
      finalState = { ...newState, earnedBadges: updatedBadges };
    }
    setState(finalState);
  }, [checkAndAwardBadges]);

  const completeOnboarding = useCallback((name: string, focusAreas: FocusArea[], dreamGoals: string[]) => {
    const updatedProfile: UserProfile = {
      ...state.profile,
      name,
      focusAreas,
      dreamGoals,
      hasCompletedOnboarding: true,
    };
    const updated = { ...state, profile: updatedProfile };
    persist(updated);

    if (userId) {
      upsertProfile(userId, updatedProfile).catch(e =>
        console.log('[app] Failed to persist profile on onboarding:', e)
      );
    }
  }, [state, persist, userId]);

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
    const updated = { ...state, goals: [...state.goals, newGoal] };
    persist(updated);

    if (userId) {
      upsertGoal(userId, newGoal).catch(e =>
        console.log('[app] Failed to persist goal:', e)
      );
    }
  }, [state, persist, userId]);

  const updateGoal = useCallback((goalId: string, title: string, description: string, color: string, emoji: string) => {
    const updatedGoal = state.goals.find(g => g.id === goalId);
    if (!updatedGoal) return;

    const newGoal: Goal = { ...updatedGoal, title, description: description || undefined, color, emoji };
    const updated = {
      ...state,
      goals: state.goals.map(g => g.id === goalId ? newGoal : g),
    };
    persist(updated, true);

    if (userId) {
      upsertGoal(userId, newGoal).catch(e =>
        console.log('[app] Failed to persist goal update:', e)
      );
    }
  }, [state, persist, userId]);

  const deleteGoal = useCallback((goalId: string) => {
    const updated = {
      ...state,
      goals: state.goals.filter(g => g.id !== goalId),
      challenges: state.challenges.filter(c => c.goalId !== goalId),
    };
    persist(updated, true);

    if (userId) {
      deleteChallengesByGoalDB(goalId).catch(e =>
        console.log('[app] Failed to delete challenges by goal:', e)
      );
      deleteGoalDB(goalId).catch(e =>
        console.log('[app] Failed to delete goal:', e)
      );
    }
  }, [state, persist, userId]);

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
    const updated = { ...state, challenges: [...state.challenges, newChallenge] };
    persist(updated, true);

    if (userId) {
      upsertChallenge(userId, newChallenge).catch(e =>
        console.log('[app] Failed to persist challenge:', e)
      );
    }
  }, [state, persist, userId]);

  const updateChallenge = useCallback((challengeId: string, title: string, description: string, goalId: string, duration: string) => {
    const existing = state.challenges.find(c => c.id === challengeId);
    if (!existing) return;

    const updatedChallenge: Challenge = { ...existing, title, description, goalId, duration };
    const updated = {
      ...state,
      challenges: state.challenges.map(c => c.id === challengeId ? updatedChallenge : c),
    };
    persist(updated, true);

    if (userId) {
      upsertChallenge(userId, updatedChallenge).catch(e =>
        console.log('[app] Failed to persist challenge update:', e)
      );
    }
  }, [state, persist, userId]);

  const deleteChallenge = useCallback((challengeId: string) => {
    const updated = {
      ...state,
      challenges: state.challenges.filter(c => c.id !== challengeId),
    };
    persist(updated, true);

    if (userId) {
      deleteChallengeDB(challengeId).catch(e =>
        console.log('[app] Failed to delete challenge:', e)
      );
    }
  }, [state, persist, userId]);

  const completeChallenge = useCallback((challengeId: string) => {
    const existing = state.challenges.find(c => c.id === challengeId);
    if (!existing) return;

    const completedChallenge: Challenge = {
      ...existing,
      isCompleted: true,
      completedAt: new Date().toISOString(),
    };

    const updatedProfile: UserProfile = {
      ...state.profile,
      challengesCompleted: state.profile.challengesCompleted + 1,
      totalPoints: state.profile.totalPoints + 25,
    };

    const updated: AppState = {
      ...state,
      challenges: state.challenges.map(c => c.id === challengeId ? completedChallenge : c),
      dailyProgress: {
        ...state.dailyProgress,
        challengeCompleted: true,
        points: state.dailyProgress.points + 25,
      },
      profile: updatedProfile,
    };
    persist(updated);

    if (userId) {
      upsertChallenge(userId, completedChallenge).catch(e =>
        console.log('[app] Failed to persist challenge completion:', e)
      );
      upsertProfile(userId, updatedProfile).catch(e =>
        console.log('[app] Failed to persist profile after challenge:', e)
      );
    }
  }, [state, persist, userId]);

  const toggleHabitComplete = useCallback((habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;

    const isCompleted = habit.completedDates.includes(today);
    const restDays = state.gentleMode.restDays;

    const computeStreak = (dates: string[]): number => {
      if (dates.length === 0) return 0;
      const sorted = [...dates].sort().reverse();
      if (sorted[0] !== today) return 0;
      let streak = 1;
      const current = new Date(today);
      for (let i = 1; i < 365; i++) {
        current.setDate(current.getDate() - 1);
        const prev = current.toISOString().split('T')[0];
        if (sorted.includes(prev)) {
          streak++;
        } else if (restDays.includes(prev)) {
          continue;
        } else {
          break;
        }
      }
      return streak;
    };

    let updatedHabit: Habit | null = null;

    const newHabits = state.habits.map(h => {
      if (h.id !== habitId) return h;
      const newDates = isCompleted
        ? h.completedDates.filter(d => d !== today)
        : [...h.completedDates, today];
      const newStreak = computeStreak(newDates);
      updatedHabit = {
        ...h,
        completedDates: newDates,
        streak: newStreak,
        bestStreak: Math.max(h.bestStreak, newStreak),
      };
      return updatedHabit;
    });

    const dailyHabitsCompleted = newHabits.filter(h => h.completedDates.includes(today)).length;

    const updatedProfile: UserProfile = {
      ...state.profile,
      habitsCompleted: isCompleted
        ? Math.max(0, state.profile.habitsCompleted - 1)
        : state.profile.habitsCompleted + 1,
      totalPoints: isCompleted
        ? Math.max(0, state.profile.totalPoints - 10)
        : state.profile.totalPoints + 10,
    };

    const updated: AppState = {
      ...state,
      habits: newHabits,
      dailyProgress: {
        ...state.dailyProgress,
        habitsCompleted: dailyHabitsCompleted,
      },
      profile: updatedProfile,
    };
    persist(updated);

    if (userId && updatedHabit) {
      upsertHabit(userId, updatedHabit).catch(e =>
        console.log('[app] Failed to persist habit toggle:', e)
      );
      upsertProfile(userId, updatedProfile).catch(e =>
        console.log('[app] Failed to persist profile after habit:', e)
      );
    }
  }, [state, persist, userId]);

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
    const updated = { ...state, dreams: [...state.dreams, newDream] };
    persist(updated, true);

    if (userId) {
      upsertDream(userId, newDream).catch(e =>
        console.log('[app] Failed to persist dream:', e)
      );
    }
  }, [state, persist, userId]);

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
    const updated = { ...state, habits: [...state.habits, newHabit] };
    persist(updated, true);

    if (userId) {
      upsertHabit(userId, newHabit).catch(e =>
        console.log('[app] Failed to persist habit:', e)
      );
    }
  }, [state, persist, userId]);

  const updateProfileName = useCallback((name: string) => {
    const updatedProfile = { ...state.profile, name };
    const updated = { ...state, profile: updatedProfile };
    persist(updated, true);

    if (userId) {
      upsertProfile(userId, updatedProfile).catch(e =>
        console.log('[app] Failed to persist profile name:', e)
      );
    }
  }, [state, persist, userId]);

  const setGentleMode = useCallback((enabled: boolean) => {
    const newGentleMode: GentleModeSettings = {
      ...state.gentleMode,
      gentleModeEnabled: enabled,
      gentleModeEnabledAt: enabled ? new Date().toISOString() : state.gentleMode.gentleModeEnabledAt,
      energyState: enabled ? 'low' : 'normal',
    };
    console.log('[app] Gentle mode:', enabled ? 'enabled' : 'disabled');
    const updated = { ...state, gentleMode: newGentleMode };
    persist(updated, true);

    if (userId) {
      upsertGentleMode(userId, newGentleMode).catch(e =>
        console.log('[app] Failed to persist gentle mode:', e)
      );
    }
  }, [state, persist, userId]);

  const markRestDay = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    if (state.gentleMode.restDays.includes(today)) return;
    const newGentleMode = {
      ...state.gentleMode,
      restDays: [...state.gentleMode.restDays, today],
    };
    console.log('[app] Marked rest day:', today);
    const updated = { ...state, gentleMode: newGentleMode };
    persist(updated, true);

    if (userId) {
      upsertGentleMode(userId, newGentleMode).catch(e =>
        console.log('[app] Failed to persist rest day:', e)
      );
    }
  }, [state, persist, userId]);

  const setPremium = useCallback((isPremium: boolean) => {
    console.log('[app] Premium status:', isPremium);
    const updated = { ...state, premium: { isPremium } };
    persist(updated, true);
  }, [state, persist]);

  const isRestDay = useCallback((date?: string) => {
    const d = date ?? new Date().toISOString().split('T')[0];
    return state.gentleMode.restDays.includes(d);
  }, [state.gentleMode.restDays]);

  const updateNotificationSettings = useCallback(async (settings: Partial<NotificationSettings>) => {
    const newSettings = { ...state.notificationSettings, ...settings };
    const updated = { ...state, notificationSettings: newSettings };
    persist(updated, true);
    saveNotifSettings(newSettings);

    if (newSettings.dailyReminderEnabled) {
      const granted = await requestNotificationPermissions();
      if (granted) {
        await scheduleDailyReminder(newSettings.reminderHour, newSettings.reminderMinute);
      } else {
        console.log('[app] Notification permission denied, disabling reminder');
        const revertedSettings = { ...newSettings, dailyReminderEnabled: false };
        const reverted = { ...updated, notificationSettings: revertedSettings };
        persist(reverted, true);
        saveNotifSettings(revertedSettings);
      }
    } else {
      await cancelDailyReminder();
    }
  }, [state, persist, saveNotifSettings]);

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
    updateProfileName,
    notificationSettings: state.notificationSettings,
    updateNotificationSettings,
    gentleMode: state.gentleMode,
    premium: state.premium,
    setGentleMode,
    markRestDay,
    setPremium,
    isRestDay,
  };
});
