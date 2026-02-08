import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flame, Sparkles, TrendingUp } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import { AFFIRMATIONS } from '@/mocks/data';
import ProgressRing from '@/components/ProgressRing';
import ChallengeCard from '@/components/ChallengeCard';
import HabitCard from '@/components/HabitCard';
import DreamCard from '@/components/DreamCard';

export default function HomeScreen() {
  const {
    profile,
    habits,
    challenges,
    dreams,
    todayCompletedHabits,
    toggleHabitComplete,
    completeChallenge,
  } = useApp();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const todayAffirmation = useMemo(() => {
    const dayIndex = new Date().getDate() % AFFIRMATIONS.length;
    return AFFIRMATIONS[dayIndex];
  }, []);

  const pendingChallenge = challenges.find(c => !c.isCompleted);
  const habitProgress = habits.length > 0 ? todayCompletedHabits / habits.length : 0;
  const displayName = profile.name || 'Friend';

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.greetingSection}>
              <View style={styles.greetingRow}>
                <View style={styles.greetingText}>
                  <Text style={styles.greeting}>{greeting},</Text>
                  <Text style={styles.name}>{displayName} ✨</Text>
                </View>
                <View style={styles.streakBadge}>
                  <Flame size={18} color={Colors.accent} />
                  <Text style={styles.streakNumber}>{profile.currentStreak}</Text>
                </View>
              </View>
              <View style={styles.affirmationCard}>
                <Sparkles size={16} color={Colors.primary} />
                <Text style={styles.affirmationText}>{todayAffirmation}</Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <Text style={styles.sectionTitle}>Today&apos;s Progress</Text>
              <View style={styles.progressRow}>
                <ProgressRing
                  progress={habitProgress}
                  size={90}
                  strokeWidth={7}
                  color={Colors.primary}
                  label={`${todayCompletedHabits}`}
                  sublabel={`of ${habits.length}`}
                />
                <View style={styles.statsColumn}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{profile.totalPoints}</Text>
                    <Text style={styles.statLabel}>points</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{profile.currentStreak}</Text>
                    <Text style={styles.statLabel}>day streak</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{profile.habitsCompleted}</Text>
                    <Text style={styles.statLabel}>total wins</Text>
                  </View>
                </View>
              </View>
            </View>

            {pendingChallenge && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Next Challenge</Text>
                <View style={styles.challengeCardWrapper}>
                  <ChallengeCard challenge={pendingChallenge} onComplete={completeChallenge} />
                </View>
              </View>
            )}

            {dreams.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Your Dreams</Text>
                  <TrendingUp size={18} color={Colors.primary} />
                </View>
                <FlatList
                  data={dreams}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={item => item.id}
                  contentContainerStyle={styles.dreamList}
                  renderItem={({ item }) => <DreamCard dream={item} />}
                  ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                />
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Today&apos;s Habits</Text>
              <View style={styles.habitsList}>
                {habits.filter(h => h.isActive).map(habit => (
                  <HabitCard key={habit.id} habit={habit} onToggle={toggleHabitComplete} />
                ))}
              </View>
            </View>

            <View style={{ height: 20 }} />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  greetingSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  greetingRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 16,
  },
  greetingText: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  name: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  streakNumber: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.accent,
  },
  affirmationCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    backgroundColor: Colors.primarySoft,
    padding: 14,
    borderRadius: 14,
  },
  affirmationText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500' as const,
    fontStyle: 'italic' as const,
    flex: 1,
    lineHeight: 20,
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 4,
  },
  progressRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginTop: 12,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statsColumn: {
    flex: 1,
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    alignItems: 'center' as const,
  },
  statItem: {
    alignItems: 'center' as const,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.borderLight,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  dreamList: {
    paddingTop: 12,
    paddingBottom: 4,
  },
  habitsList: {
    gap: 10,
    marginTop: 12,
  },
  challengeCardWrapper: {
    marginTop: 12,
  },
});
