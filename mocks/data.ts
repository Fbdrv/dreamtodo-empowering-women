import { Badge, Challenge, CommunityWin, Dream, FocusAreaItem, Habit } from '@/types';

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

export const SAMPLE_DREAMS: Dream[] = [
  {
    id: 'd1',
    title: 'Solo trip to Bali',
    description: 'Plan and take my first solo international trip',
    focusArea: 'travel',
    createdAt: '2026-01-15',
    habits: [],
    progress: 0.35,
  },
  {
    id: 'd2',
    title: 'Save $10K emergency fund',
    description: 'Build financial security one step at a time',
    focusArea: 'money',
    createdAt: '2026-01-20',
    habits: [],
    progress: 0.6,
  },
];

export const SAMPLE_HABITS: Habit[] = [
  {
    id: 'h1',
    title: 'Save $50 this week',
    dreamId: 'd2',
    frequency: 'weekly',
    streak: 4,
    bestStreak: 6,
    completedDates: ['2026-02-01', '2026-02-02', '2026-02-03', '2026-02-04'],
    createdAt: '2026-01-20',
    isActive: true,
  },
  {
    id: 'h2',
    title: 'Research one destination',
    dreamId: 'd1',
    frequency: 'daily',
    streak: 7,
    bestStreak: 7,
    completedDates: ['2026-02-01', '2026-02-02', '2026-02-03', '2026-02-04', '2026-02-05', '2026-02-06', '2026-02-07'],
    createdAt: '2026-01-15',
    isActive: true,
  },
  {
    id: 'h3',
    title: 'Journal for 5 minutes',
    frequency: 'daily',
    streak: 3,
    bestStreak: 12,
    completedDates: ['2026-02-05', '2026-02-06', '2026-02-07'],
    createdAt: '2026-01-10',
    isActive: true,
  },
  {
    id: 'h4',
    title: 'One confidence affirmation',
    frequency: 'daily',
    streak: 10,
    bestStreak: 10,
    completedDates: [],
    createdAt: '2026-01-28',
    isActive: true,
  },
];

export const DAILY_CHALLENGES: Challenge[] = [
  {
    id: 'c1',
    title: 'Write down 3 things you\'re proud of',
    description: 'Take a moment to acknowledge your wins — big or small. Write them down and sit with that feeling.',
    duration: '5 min',
    focusArea: 'confidence',
    type: 'main',
    isCompleted: false,
    affirmation: 'You showed up for yourself today. That matters.',
  },
  {
    id: 'c2',
    title: 'Transfer $5 to savings',
    description: 'Even the smallest amount builds momentum. Move $5 to your savings right now.',
    duration: '2 min',
    focusArea: 'money',
    type: 'bonus',
    isCompleted: false,
    affirmation: 'Every dollar you save is a vote for your future freedom.',
  },
  {
    id: 'c3',
    title: 'Text someone who inspires you',
    description: 'Reach out to someone you admire. Tell them why. Connection fuels courage.',
    duration: '5 min',
    focusArea: 'confidence',
    type: 'bonus',
    isCompleted: false,
    affirmation: 'Reaching out takes courage. You just did something brave.',
  },
  {
    id: 'c4',
    title: 'Research one dream destination',
    description: 'Spend 10 minutes exploring a place you\'ve always wanted to visit. Save one image that excites you.',
    duration: '10 min',
    focusArea: 'travel',
    type: 'bonus',
    isCompleted: false,
    affirmation: 'Your dream trip is getting closer, one step at a time.',
  },
];

export const BADGES: Badge[] = [
  { id: 'b1', title: 'First Brave Step', description: 'Completed your first challenge', emoji: '🌱', isEarned: true, earnedAt: '2026-01-15' },
  { id: 'b2', title: 'Momentum Builder', description: '7-day streak', emoji: '🔥', isEarned: true, earnedAt: '2026-01-22' },
  { id: 'b3', title: 'Dreamweaver', description: 'Created 3 dream goals', emoji: '🌙', isEarned: false },
  { id: 'b4', title: 'Consistency Queen', description: '30-day streak', emoji: '👑', isEarned: false },
  { id: 'b5', title: 'Brave Explorer', description: 'Completed a travel challenge', emoji: '🗺️', isEarned: true, earnedAt: '2026-02-01' },
  { id: 'b6', title: 'Money Moves', description: 'Saved consistently for 4 weeks', emoji: '💎', isEarned: false },
  { id: 'b7', title: 'Self-Trust', description: 'Completed 10 confidence challenges', emoji: '🦋', isEarned: false },
  { id: 'b8', title: 'Unstoppable', description: '100 habits completed', emoji: '⚡', isEarned: false },
];

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
