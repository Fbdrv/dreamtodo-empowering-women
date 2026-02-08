import { BadgeDefinition, CommunityWin, FocusAreaItem } from '@/types';

export const FOCUS_AREAS: FocusAreaItem[] = [
  {
    id: 'travel',
    label: 'Travel & Adventure',
    emoji: '✈️',
    description: 'Explore the world, plan trips, build travel confidence',
  },
  {
    id: 'career',
    label: 'Career & Salary',
    emoji: '💼',
    description: 'Level up professionally, negotiate boldly, grow your skills',
  },
  {
    id: 'money',
    label: 'Money & Freedom',
    emoji: '💰',
    description: 'Build wealth, save smarter, create financial independence',
  },
  {
    id: 'confidence',
    label: 'Confidence & Mindset',
    emoji: '✨',
    description: 'Strengthen your inner voice, show up boldly, trust yourself',
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle & Habits',
    emoji: '🌿',
    description: 'Design your days intentionally, build routines that stick',
  },
];

export const DREAM_SUGGESTIONS: Record<string, string[]> = {
  travel: ['Solo trip to Bali', 'Road trip across Europe', 'Visit 10 countries this year'],
  career: ['Get promoted this year', 'Start a side business', 'Land my dream job'],
  money: ['Save $10K emergency fund', 'Pay off all debt', 'Start investing monthly'],
  confidence: ['Speak at a public event', 'Set firm boundaries', 'Trust my decisions fully'],
  lifestyle: ['Morning routine I love', 'Read 24 books this year', 'Run a half marathon'],
};

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { id: 'b1', title: 'First Brave Step', description: 'Completed your first challenge', emoji: '🌱', condition: { type: 'first_challenge' } },
  { id: 'b2', title: 'Momentum Builder', description: '7-day streak', emoji: '🔥', condition: { type: 'streak', days: 7 } },
  { id: 'b3', title: 'Goal Setter', description: 'Created 3 goals', emoji: '🎯', condition: { type: 'goals_created', count: 3 } },
  { id: 'b4', title: 'Consistency Queen', description: '30-day streak', emoji: '👑', condition: { type: 'streak', days: 30 } },
  { id: 'b5', title: 'Challenge Champion', description: 'Completed 10 challenges', emoji: '🏆', condition: { type: 'challenges_completed', count: 10 } },
  { id: 'b6', title: 'Habit Hero', description: 'Completed 50 habits', emoji: '💎', condition: { type: 'habits_completed', count: 50 } },
  { id: 'b7', title: 'Rising Star', description: 'Completed 5 challenges', emoji: '⭐', condition: { type: 'challenges_completed', count: 5 } },
  { id: 'b8', title: 'Unstoppable', description: 'Completed 100 habits', emoji: '⚡', condition: { type: 'habits_completed', count: 100 } },
];

export const GOAL_COLORS = [
  '#C67C4E',
  '#8B9E7E', 
  '#E8B86D',
  '#9B7DB8',
  '#6B9BD1',
  '#D4726A',
];

export const GOAL_EMOJIS = ['🎯', '💪', '🌟', '🚀', '💡', '🔥', '✨', '🌱', '💎', '🏆'];

export const COMMUNITY_WINS: CommunityWin[] = [
  { id: 'w1', message: 'Just booked my first solo trip! 3 months of small steps led here.', focusArea: 'travel', cheers: 47, timeAgo: '2h ago' },
  { id: 'w2', message: 'Hit my savings goal a month early. Micro-actions really work!', focusArea: 'money', cheers: 32, timeAgo: '4h ago' },
  { id: 'w3', message: 'Asked for a raise today. Heart was pounding but I did it.', focusArea: 'career', cheers: 89, timeAgo: '6h ago' },
  { id: 'w4', message: '14-day streak of morning journaling. Starting to feel different.', focusArea: 'confidence', cheers: 24, timeAgo: '8h ago' },
  { id: 'w5', message: 'Said no to something that didn\'t serve me. It felt powerful.', focusArea: 'confidence', cheers: 56, timeAgo: '12h ago' },
  { id: 'w6', message: 'Woke up at 6am for the 10th day in a row. Who am I becoming?!', focusArea: 'lifestyle', cheers: 41, timeAgo: '1d ago' },
  { id: 'w7', message: 'Finished planning my budget for the year. Feels like freedom.', focusArea: 'money', cheers: 28, timeAgo: '1d ago' },
  { id: 'w8', message: 'My habit buddy and I just hit 21 days together!', focusArea: 'lifestyle', cheers: 63, timeAgo: '2d ago' },
];

export const AFFIRMATIONS = [
  "You don't need confidence to start — you need to start to build confidence.",
  "One small step today still counts.",
  "You are closer than you think.",
  "Progress, not perfection.",
  "Showing up is the hardest part. You did it.",
  "Your future self is cheering you on.",
  "Consistency is a superpower. You have it.",
  "Every brave step builds the next one.",
  "You are allowed to take up space.",
  "The only way to get there is to start here.",
];

export const REFLECTION_PROMPTS = [
  "What did this action prove to you today?",
  "How does showing up feel?",
  "What's one thing you're grateful for right now?",
  "What would your future self say about today?",
  "What small win are you most proud of this week?",
];
