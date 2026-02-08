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

export interface Challenge {
  id: string;
  title: string;
  description: string;
  duration: string;
  focusArea: FocusArea;
  type: 'main' | 'bonus';
  isCompleted: boolean;
  affirmation: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  earnedAt?: string;
  isEarned: boolean;
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
