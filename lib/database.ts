import { supabase } from './supabase';
import type {
  Challenge,
  Dream,
  EarnedBadge,
  FocusArea,
  GentleModeSettings,
  Goal,
  Habit,
  UserProfile,
  CommunityWin,
} from '@/types';

// ============================================================
// Profile
// ============================================================

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  console.log('[db] Fetching profile for:', userId);
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.log('[db] Error fetching profile:', error.message);
    return null;
  }

  return {
    name: data.name ?? '',
    focusAreas: (data.focus_areas as FocusArea[]) ?? [],
    dreamGoals: (data.dream_goals as string[]) ?? [],
    totalPoints: data.total_points ?? 0,
    currentStreak: data.current_streak ?? 0,
    bestStreak: data.best_streak ?? 0,
    habitsCompleted: data.habits_completed ?? 0,
    challengesCompleted: data.challenges_completed ?? 0,
    joinedAt: data.joined_at ?? new Date().toISOString().split('T')[0],
    hasCompletedOnboarding: data.has_completed_onboarding ?? false,
  };
}

export async function upsertProfile(userId: string, profile: UserProfile): Promise<boolean> {
  console.log('[db] Upserting profile for:', userId);
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      name: profile.name,
      focus_areas: profile.focusAreas,
      dream_goals: profile.dreamGoals,
      total_points: profile.totalPoints,
      current_streak: profile.currentStreak,
      best_streak: profile.bestStreak,
      habits_completed: profile.habitsCompleted,
      challenges_completed: profile.challengesCompleted,
      joined_at: profile.joinedAt,
      has_completed_onboarding: profile.hasCompletedOnboarding,
    }, { onConflict: 'id' });

  if (error) {
    console.log('[db] Error upserting profile:', error.message);
    return false;
  }
  return true;
}

// ============================================================
// Goals
// ============================================================

export async function fetchGoals(userId: string): Promise<Goal[]> {
  console.log('[db] Fetching goals for:', userId);
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.log('[db] Error fetching goals:', error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    color: row.color,
    emoji: row.emoji,
    createdAt: row.created_at,
  }));
}

export async function upsertGoal(userId: string, goal: Goal): Promise<boolean> {
  const { error } = await supabase
    .from('goals')
    .upsert({
      id: goal.id,
      user_id: userId,
      title: goal.title,
      description: goal.description ?? null,
      color: goal.color,
      emoji: goal.emoji,
      created_at: goal.createdAt,
    }, { onConflict: 'id' });

  if (error) {
    console.log('[db] Error upserting goal:', error.message);
    return false;
  }
  return true;
}

export async function deleteGoalDB(goalId: string): Promise<boolean> {
  const { error } = await supabase.from('goals').delete().eq('id', goalId);
  if (error) {
    console.log('[db] Error deleting goal:', error.message);
    return false;
  }
  return true;
}

// ============================================================
// Dreams
// ============================================================

export async function fetchDreams(userId: string): Promise<Dream[]> {
  console.log('[db] Fetching dreams for:', userId);
  const { data, error } = await supabase
    .from('dreams')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.log('[db] Error fetching dreams:', error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    focusArea: row.focus_area as FocusArea,
    createdAt: row.created_at,
    habits: [],
    progress: row.progress ?? 0,
  }));
}

export async function upsertDream(userId: string, dream: Dream): Promise<boolean> {
  const { error } = await supabase
    .from('dreams')
    .upsert({
      id: dream.id,
      user_id: userId,
      title: dream.title,
      description: dream.description,
      focus_area: dream.focusArea,
      progress: dream.progress,
      created_at: dream.createdAt,
    }, { onConflict: 'id' });

  if (error) {
    console.log('[db] Error upserting dream:', error.message);
    return false;
  }
  return true;
}

export async function deleteDreamDB(dreamId: string): Promise<boolean> {
  const { error } = await supabase.from('dreams').delete().eq('id', dreamId);
  if (error) {
    console.log('[db] Error deleting dream:', error.message);
    return false;
  }
  return true;
}

// ============================================================
// Habits
// ============================================================

export async function fetchHabits(userId: string): Promise<Habit[]> {
  console.log('[db] Fetching habits for:', userId);
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.log('[db] Error fetching habits:', error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    dreamId: row.dream_id ?? undefined,
    frequency: row.frequency as 'daily' | 'weekly',
    streak: row.streak ?? 0,
    bestStreak: row.best_streak ?? 0,
    completedDates: (row.completed_dates as string[]) ?? [],
    createdAt: row.created_at,
    isActive: row.is_active ?? true,
  }));
}

export async function upsertHabit(userId: string, habit: Habit): Promise<boolean> {
  const { error } = await supabase
    .from('habits')
    .upsert({
      id: habit.id,
      user_id: userId,
      title: habit.title,
      dream_id: habit.dreamId ?? null,
      frequency: habit.frequency,
      streak: habit.streak,
      best_streak: habit.bestStreak,
      completed_dates: habit.completedDates,
      created_at: habit.createdAt,
      is_active: habit.isActive,
    }, { onConflict: 'id' });

  if (error) {
    console.log('[db] Error upserting habit:', error.message);
    return false;
  }
  return true;
}

export async function deleteHabitDB(habitId: string): Promise<boolean> {
  const { error } = await supabase.from('habits').delete().eq('id', habitId);
  if (error) {
    console.log('[db] Error deleting habit:', error.message);
    return false;
  }
  return true;
}

// ============================================================
// Challenges
// ============================================================

export async function fetchChallenges(userId: string): Promise<Challenge[]> {
  console.log('[db] Fetching challenges for:', userId);
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.log('[db] Error fetching challenges:', error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    goalId: row.goal_id,
    duration: row.duration,
    isCompleted: row.is_completed ?? false,
    completedAt: row.completed_at ?? undefined,
    createdAt: row.created_at,
  }));
}

export async function upsertChallenge(userId: string, challenge: Challenge): Promise<boolean> {
  const { error } = await supabase
    .from('challenges')
    .upsert({
      id: challenge.id,
      user_id: userId,
      title: challenge.title,
      description: challenge.description,
      goal_id: challenge.goalId,
      duration: challenge.duration,
      is_completed: challenge.isCompleted,
      completed_at: challenge.completedAt ?? null,
      created_at: challenge.createdAt,
    }, { onConflict: 'id' });

  if (error) {
    console.log('[db] Error upserting challenge:', error.message);
    return false;
  }
  return true;
}

export async function deleteChallengeDB(challengeId: string): Promise<boolean> {
  const { error } = await supabase.from('challenges').delete().eq('id', challengeId);
  if (error) {
    console.log('[db] Error deleting challenge:', error.message);
    return false;
  }
  return true;
}

export async function deleteChallengesByGoalDB(goalId: string): Promise<boolean> {
  const { error } = await supabase.from('challenges').delete().eq('goal_id', goalId);
  if (error) {
    console.log('[db] Error deleting challenges by goal:', error.message);
    return false;
  }
  return true;
}

// ============================================================
// Earned Badges
// ============================================================

export async function fetchEarnedBadges(userId: string): Promise<EarnedBadge[]> {
  console.log('[db] Fetching earned badges for:', userId);
  const { data, error } = await supabase
    .from('earned_badges')
    .select('badge_id, earned_at')
    .eq('user_id', userId);

  if (error) {
    console.log('[db] Error fetching earned badges:', error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    badgeId: row.badge_id,
    earnedAt: row.earned_at,
  }));
}

export async function insertEarnedBadge(userId: string, badge: EarnedBadge): Promise<boolean> {
  const { error } = await supabase
    .from('earned_badges')
    .upsert({
      user_id: userId,
      badge_id: badge.badgeId,
      earned_at: badge.earnedAt,
    }, { onConflict: 'user_id,badge_id' });

  if (error) {
    console.log('[db] Error inserting earned badge:', error.message);
    return false;
  }
  return true;
}

// ============================================================
// Gentle Mode Settings
// ============================================================

export async function fetchGentleMode(userId: string): Promise<GentleModeSettings> {
  console.log('[db] Fetching gentle mode for:', userId);
  const { data, error } = await supabase
    .from('gentle_mode_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    console.log('[db] No gentle mode settings found, using defaults');
    return {
      gentleModeEnabled: false,
      energyState: 'normal',
      restDays: [],
    };
  }

  return {
    gentleModeEnabled: data.gentle_mode_enabled ?? false,
    gentleModeEnabledAt: data.gentle_mode_enabled_at ?? undefined,
    energyState: (data.energy_state as 'normal' | 'low') ?? 'normal',
    restDays: (data.rest_days as string[]) ?? [],
  };
}

export async function upsertGentleMode(userId: string, settings: GentleModeSettings): Promise<boolean> {
  const { error } = await supabase
    .from('gentle_mode_settings')
    .upsert({
      user_id: userId,
      gentle_mode_enabled: settings.gentleModeEnabled,
      gentle_mode_enabled_at: settings.gentleModeEnabledAt ?? null,
      energy_state: settings.energyState,
      rest_days: settings.restDays,
    }, { onConflict: 'user_id' });

  if (error) {
    console.log('[db] Error upserting gentle mode:', error.message);
    return false;
  }
  return true;
}

// ============================================================
// Community Wins
// ============================================================

export async function fetchCommunityWins(): Promise<(CommunityWin & { userName?: string })[]> {
  console.log('[db] Fetching community wins');
  const { data, error } = await supabase
    .from('community_wins')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.log('[db] Error fetching community wins:', error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const createdAt = new Date(row.created_at);
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let timeAgo = 'just now';
    if (diffDays > 0) timeAgo = `${diffDays}d ago`;
    else if (diffHours > 0) timeAgo = `${diffHours}h ago`;
    else if (diffMins > 0) timeAgo = `${diffMins}m ago`;

    return {
      id: row.id,
      message: row.message,
      focusArea: row.focus_area as FocusArea,
      cheers: row.cheers ?? 0,
      timeAgo,
      userName: row.user_name ?? 'Anonymous',
    };
  });
}

export async function insertCommunityWin(
  userId: string,
  userName: string,
  message: string,
  focusArea: string,
): Promise<CommunityWin | null> {
  const id = `cw_${Date.now()}`;
  const { data, error } = await supabase
    .from('community_wins')
    .insert({
      id,
      user_id: userId,
      user_name: userName,
      message,
      focus_area: focusArea,
    })
    .select()
    .single();

  if (error) {
    console.log('[db] Error inserting community win:', error.message);
    return null;
  }

  return {
    id: data.id,
    message: data.message,
    focusArea: data.focus_area as FocusArea,
    cheers: 0,
    timeAgo: 'just now',
  };
}

export async function cheerCommunityWin(userId: string, winId: string): Promise<boolean> {
  const { error: cheerError } = await supabase
    .from('community_cheers')
    .insert({ user_id: userId, win_id: winId });

  if (cheerError) {
    console.log('[db] Error cheering win:', cheerError.message);
    return false;
  }

  const { error: rpcError } = await supabase.rpc('increment_cheers', { win_id_input: winId });
  if (rpcError) {
    console.log('[db] Error incrementing cheers:', rpcError.message);
  }

  return true;
}

export async function uncheerCommunityWin(userId: string, winId: string): Promise<boolean> {
  const { error: cheerError } = await supabase
    .from('community_cheers')
    .delete()
    .eq('user_id', userId)
    .eq('win_id', winId);

  if (cheerError) {
    console.log('[db] Error uncheering win:', cheerError.message);
    return false;
  }

  const { error: rpcError } = await supabase.rpc('decrement_cheers', { win_id_input: winId });
  if (rpcError) {
    console.log('[db] Error decrementing cheers:', rpcError.message);
  }

  return true;
}

export async function fetchUserCheers(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('community_cheers')
    .select('win_id')
    .eq('user_id', userId);

  if (error) {
    console.log('[db] Error fetching user cheers:', error.message);
    return new Set();
  }

  return new Set((data ?? []).map((row) => row.win_id));
}

// ============================================================
// Full state load (used on app start)
// ============================================================

export async function loadFullUserData(userId: string) {
  console.log('[db] Loading full user data for:', userId);

  const [profile, goals, dreams, habits, challenges, earnedBadges, gentleMode] =
    await Promise.all([
      fetchProfile(userId),
      fetchGoals(userId),
      fetchDreams(userId),
      fetchHabits(userId),
      fetchChallenges(userId),
      fetchEarnedBadges(userId),
      fetchGentleMode(userId),
    ]);

  console.log('[db] Full data loaded:', {
    hasProfile: !!profile,
    goalsCount: goals.length,
    dreamsCount: dreams.length,
    habitsCount: habits.length,
    challengesCount: challenges.length,
    badgesCount: earnedBadges.length,
  });

  return { profile, goals, dreams, habits, challenges, earnedBadges, gentleMode };
}
