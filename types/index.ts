export type FocusArea = 
  | 'travel'
  | 'career'
  | 'money'
  | 'confidence'
  | 'lifestyle';

export interface FocusAreaItem {
  id: FocusArea;
  label: string;
  emoji: string;
  description: string;
}

export interface Dream {
  id: string;
  title: string;
  description: string;
  focusArea: FocusArea;
  createdAt: string;
  habits: Habit[];
  progress: number;
}

export interface Habit {
  id: string;
  title: string;
  dreamId?: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  bestStreak: number;
  completedDates: string[];
  createdAt: string;
  isActive: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  color: string;
  emoji: string;
  createdAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  goalId: string;
  duration: string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  emoji: string;
  condition: BadgeCondition;
}

export type BadgeCondition = 
  | { type: 'first_challenge' }
  | { type: 'challenges_completed'; count: number }
  | { type: 'streak'; days: number }
  | { type: 'goals_created'; count: number }
  | { type: 'habits_completed'; count: number };

export interface EarnedBadge {
  badgeId: string;
  earnedAt: string;
}

export interface CommunityWin {
  id: string;
  message: string;
  focusArea: FocusArea;
  cheers: number;
  timeAgo: string;
  hasCheered?: boolean;
}

export interface UserProfile {
  name: string;
  focusAreas: FocusArea[];
  dreamGoals: string[];
  totalPoints: number;
  currentStreak: number;
  bestStreak: number;
  habitsCompleted: number;
  challengesCompleted: number;
  joinedAt: string;
  hasCompletedOnboarding: boolean;
}

export interface DailyProgress {
  date: string;
  habitsCompleted: number;
  habitsTotal: number;
  challengeCompleted: boolean;
  points: number;
}
