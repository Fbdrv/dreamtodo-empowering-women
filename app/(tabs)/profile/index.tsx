import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flame, Award, Calendar, TrendingUp, Star, LogOut } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import { useAuth } from '@/providers/AuthProvider';
import { FOCUS_AREAS } from '@/mocks/data';

export default function ProfileScreen() {
  const { profile, badges } = useApp();
  const { user, logout } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const earnedBadges = badges.filter(b => b.isEarned);
  const lockedBadges = badges.filter(b => !b.isEarned);
  const displayName = profile.name || 'Friend';
  const selectedAreas = FOCUS_AREAS.filter(f => profile.focusAreas.includes(f.id));

  const daysSinceJoined = Math.max(1, Math.floor(
    (Date.now() - new Date(profile.joinedAt).getTime()) / (1000 * 60 * 60 * 24)
  ));

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.nameText}>{displayName}</Text>
              {user?.email && (
                <Text style={styles.emailText}>{user.email}</Text>
              )}
              <Text style={styles.memberSince}>On this journey for {daysSinceJoined} days</Text>
              {selectedAreas.length > 0 && (
                <View style={styles.focusRow}>
                  {selectedAreas.map(area => (
                    <View key={area.id} style={styles.focusPill}>
                      <Text style={styles.focusPillEmoji}>{area.emoji}</Text>
                      <Text style={styles.focusPillText}>{area.label}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: Colors.accentLight }]}>
                  <Flame size={18} color={Colors.accent} />
                </View>
                <Text style={styles.statValue}>{profile.currentStreak}</Text>
                <Text style={styles.statLabel}>Current Streak</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: Colors.primarySoft }]}>
                  <TrendingUp size={18} color={Colors.primary} />
                </View>
                <Text style={styles.statValue}>{profile.bestStreak}</Text>
                <Text style={styles.statLabel}>Best Streak</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: Colors.secondaryLight }]}>
                  <Star size={18} color={Colors.secondary} />
                </View>
                <Text style={styles.statValue}>{profile.totalPoints}</Text>
                <Text style={styles.statLabel}>Total Points</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: '#F0E8F5' }]}>
                  <Calendar size={18} color="#9B7DB8" />
                </View>
                <Text style={styles.statValue}>{profile.habitsCompleted}</Text>
                <Text style={styles.statLabel}>Habits Done</Text>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Award size={18} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Earned Badges</Text>
                <Text style={styles.badgeCount}>{earnedBadges.length}/{badges.length}</Text>
              </View>
              {earnedBadges.length > 0 ? (
                <View style={styles.badgeGrid}>
                  {earnedBadges.map(badge => (
                    <View key={badge.id} style={styles.badgeCard}>
                      <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                      <Text style={styles.badgeTitle}>{badge.title}</Text>
                      <Text style={styles.badgeDesc} numberOfLines={2}>{badge.description}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyBadges}>
                  <Text style={styles.emptyText}>Complete challenges to earn your first badge!</Text>
                </View>
              )}
            </View>

            {lockedBadges.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Up Next</Text>
                <View style={styles.lockedGrid}>
                  {lockedBadges.slice(0, 4).map(badge => (
                    <View key={badge.id} style={styles.lockedBadge}>
                      <Text style={styles.lockedEmoji}>{badge.emoji}</Text>
                      <View style={styles.lockedInfo}>
                        <Text style={styles.lockedTitle}>{badge.title}</Text>
                        <Text style={styles.lockedDesc} numberOfLines={1}>{badge.description}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.weeklyCard}>
              <Text style={styles.weeklyTitle}>This Week&apos;s Momentum</Text>
              <View style={styles.weekDays}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                  const isActive = i < new Date().getDay() || (i === 0 && new Date().getDay() === 0);
                  const isToday = i === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
                  return (
                    <View key={i} style={styles.weekDayCol}>
                      <Text style={[styles.weekDayLabel, isToday && styles.weekDayLabelToday]}>{day}</Text>
                      <View style={[
                        styles.weekDayDot,
                        isActive && styles.weekDayDotActive,
                        isToday && styles.weekDayDotToday,
                      ]} />
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.quoteCard}>
              <Text style={styles.quoteText}>
                {"The woman who moves mountains begins by carrying small stones."}
              </Text>
              <Text style={styles.quoteAuthor}>— Chinese Proverb</Text>
            </View>

            <TouchableOpacity
              testID="logout-btn"
              style={styles.logoutBtn}
              onPress={logout}
              activeOpacity={0.7}
            >
              <LogOut size={18} color={Colors.error} />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>

            <View style={{ height: 30 }} />
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
  profileHeader: {
    alignItems: 'center' as const,
    paddingTop: 20,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: '800' as const,
    color: Colors.white,
  },
  nameText: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  focusRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'center' as const,
    gap: 8,
  },
  focusPill: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  focusPillEmoji: {
    fontSize: 12,
  },
  focusPillText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  statsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 20,
  },
  statCard: {
    width: '48%' as any,
    flexGrow: 1,
    flexBasis: '45%' as any,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center' as const,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    flex: 1,
  },
  badgeCount: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  badgeGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 10,
  },
  badgeCard: {
    flexGrow: 1,
    flexBasis: '45%' as any,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  badgeEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center' as const,
    marginBottom: 3,
  },
  badgeDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center' as const,
    lineHeight: 15,
  },
  emptyBadges: {
    backgroundColor: Colors.cardAlt,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center' as const,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
  lockedGrid: {
    gap: 10,
    marginTop: 10,
  },
  lockedBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 14,
    backgroundColor: Colors.cardAlt,
    borderRadius: 14,
    padding: 14,
    opacity: 0.7,
  },
  lockedEmoji: {
    fontSize: 24,
  },
  lockedInfo: {
    flex: 1,
  },
  lockedTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  lockedDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  weeklyCard: {
    marginHorizontal: 20,
    marginTop: 28,
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  weeklyTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  weekDays: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  weekDayCol: {
    alignItems: 'center' as const,
    gap: 8,
  },
  weekDayLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  weekDayLabelToday: {
    color: Colors.primary,
  },
  weekDayDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.borderLight,
  },
  weekDayDotActive: {
    backgroundColor: Colors.secondaryLight,
  },
  weekDayDotToday: {
    backgroundColor: Colors.primary,
  },
  quoteCard: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: Colors.primarySoft,
    borderRadius: 18,
    padding: 22,
  },
  quoteText: {
    fontSize: 15,
    color: Colors.text,
    fontStyle: 'italic' as const,
    lineHeight: 23,
    marginBottom: 8,
  },
  quoteAuthor: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  emailText: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  logoutBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    marginHorizontal: 20,
    marginTop: 28,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.error,
  },
});
