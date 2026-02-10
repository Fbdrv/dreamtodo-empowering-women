-- ============================================================
-- Supabase Migration: Full app data schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  focus_areas jsonb not null default '[]'::jsonb,
  dream_goals jsonb not null default '[]'::jsonb,
  total_points integer not null default 0,
  current_streak integer not null default 0,
  best_streak integer not null default 0,
  habits_completed integer not null default 0,
  challenges_completed integer not null default 0,
  joined_at text not null default to_char(now(), 'YYYY-MM-DD'),
  has_completed_onboarding boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Goals
create table if not exists public.goals (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  color text not null default '#C67C4E',
  emoji text not null default '🎯',
  created_at text not null default to_char(now(), 'YYYY-MM-DD')
);

-- 3. Dreams
create table if not exists public.dreams (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  focus_area text not null,
  progress real not null default 0,
  created_at text not null default to_char(now(), 'YYYY-MM-DD')
);

-- 4. Habits
create table if not exists public.habits (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  dream_id text,
  frequency text not null default 'daily',
  streak integer not null default 0,
  best_streak integer not null default 0,
  completed_dates jsonb not null default '[]'::jsonb,
  created_at text not null default to_char(now(), 'YYYY-MM-DD'),
  is_active boolean not null default true
);

-- 5. Challenges
create table if not exists public.challenges (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  goal_id text not null,
  duration text not null default '1 week',
  is_completed boolean not null default false,
  completed_at text,
  created_at text not null default to_char(now(), 'YYYY-MM-DD')
);

-- 6. Earned Badges
create table if not exists public.earned_badges (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id text not null,
  earned_at text not null,
  unique(user_id, badge_id)
);

-- 7. Gentle Mode Settings
create table if not exists public.gentle_mode_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  gentle_mode_enabled boolean not null default false,
  gentle_mode_enabled_at text,
  energy_state text not null default 'normal',
  rest_days jsonb not null default '[]'::jsonb
);

-- 8. Community Wins
create table if not exists public.community_wins (
  id text primary key default 'cw_' || gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_name text not null default 'Anonymous',
  message text not null,
  focus_area text not null,
  cheers integer not null default 0,
  created_at timestamptz not null default now()
);

-- 9. Community Win Cheers (track who cheered what)
create table if not exists public.community_cheers (
  user_id uuid not null references auth.users(id) on delete cascade,
  win_id text not null references public.community_wins(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, win_id)
);

-- ============================================================
-- Indexes
-- ============================================================
create index if not exists idx_goals_user_id on public.goals(user_id);
create index if not exists idx_dreams_user_id on public.dreams(user_id);
create index if not exists idx_habits_user_id on public.habits(user_id);
create index if not exists idx_challenges_user_id on public.challenges(user_id);
create index if not exists idx_earned_badges_user_id on public.earned_badges(user_id);
create index if not exists idx_community_wins_created on public.community_wins(created_at desc);
create index if not exists idx_community_cheers_win on public.community_cheers(win_id);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.dreams enable row level security;
alter table public.habits enable row level security;
alter table public.challenges enable row level security;
alter table public.earned_badges enable row level security;
alter table public.gentle_mode_settings enable row level security;
alter table public.community_wins enable row level security;
alter table public.community_cheers enable row level security;

-- Profiles: users can only read/write their own
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Goals: users can only read/write their own
create policy "Users can view own goals" on public.goals for select using (auth.uid() = user_id);
create policy "Users can insert own goals" on public.goals for insert with check (auth.uid() = user_id);
create policy "Users can update own goals" on public.goals for update using (auth.uid() = user_id);
create policy "Users can delete own goals" on public.goals for delete using (auth.uid() = user_id);

-- Dreams: users can only read/write their own
create policy "Users can view own dreams" on public.dreams for select using (auth.uid() = user_id);
create policy "Users can insert own dreams" on public.dreams for insert with check (auth.uid() = user_id);
create policy "Users can update own dreams" on public.dreams for update using (auth.uid() = user_id);
create policy "Users can delete own dreams" on public.dreams for delete using (auth.uid() = user_id);

-- Habits: users can only read/write their own
create policy "Users can view own habits" on public.habits for select using (auth.uid() = user_id);
create policy "Users can insert own habits" on public.habits for insert with check (auth.uid() = user_id);
create policy "Users can update own habits" on public.habits for update using (auth.uid() = user_id);
create policy "Users can delete own habits" on public.habits for delete using (auth.uid() = user_id);

-- Challenges: users can only read/write their own
create policy "Users can view own challenges" on public.challenges for select using (auth.uid() = user_id);
create policy "Users can insert own challenges" on public.challenges for insert with check (auth.uid() = user_id);
create policy "Users can update own challenges" on public.challenges for update using (auth.uid() = user_id);
create policy "Users can delete own challenges" on public.challenges for delete using (auth.uid() = user_id);

-- Earned Badges: users can only read/write their own
create policy "Users can view own badges" on public.earned_badges for select using (auth.uid() = user_id);
create policy "Users can insert own badges" on public.earned_badges for insert with check (auth.uid() = user_id);

-- Gentle Mode: users can only read/write their own
create policy "Users can view own gentle mode" on public.gentle_mode_settings for select using (auth.uid() = user_id);
create policy "Users can insert own gentle mode" on public.gentle_mode_settings for insert with check (auth.uid() = user_id);
create policy "Users can update own gentle mode" on public.gentle_mode_settings for update using (auth.uid() = user_id);

-- Community Wins: everyone can read, only owner can write
create policy "Anyone can view community wins" on public.community_wins for select using (true);
create policy "Users can insert own wins" on public.community_wins for insert with check (auth.uid() = user_id);
create policy "Users can update own wins" on public.community_wins for update using (auth.uid() = user_id);
create policy "Users can delete own wins" on public.community_wins for delete using (auth.uid() = user_id);

-- Community Cheers: everyone can read, users manage their own
create policy "Anyone can view cheers" on public.community_cheers for select using (true);
create policy "Users can insert own cheers" on public.community_cheers for insert with check (auth.uid() = user_id);
create policy "Users can delete own cheers" on public.community_cheers for delete using (auth.uid() = user_id);

-- ============================================================
-- Auto-create profile on signup trigger
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, joined_at)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', ''), to_char(now(), 'YYYY-MM-DD'));

  insert into public.gentle_mode_settings (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Function to increment cheers atomically
-- ============================================================
create or replace function public.increment_cheers(win_id_input text)
returns void as $$
begin
  update public.community_wins
  set cheers = cheers + 1
  where id = win_id_input;
end;
$$ language plpgsql security definer;

create or replace function public.decrement_cheers(win_id_input text)
returns void as $$
begin
  update public.community_wins
  set cheers = greatest(0, cheers - 1)
  where id = win_id_input;
end;
$$ language plpgsql security definer;

-- ============================================================
-- Updated_at trigger for profiles
-- ============================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();
