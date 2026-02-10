import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flame, Award, Calendar, TrendingUp, Star, LogOut, X, Settings, Check, Sun, Moon, Smartphone, Bell, Clock, ChevronUp, ChevronDown, Heart, Crown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useColors, useTheme, ThemePreference } from '@/providers/ThemeProvider';
import { useApp } from '@/providers/AppProvider';
import { useAuth } from '@/providers/AuthProvider';

import { FOCUS_AREAS } from '@/mocks/data';
import { ThemeColors } from '@/constants/colors';
import PaywallModal from '@/components/PaywallModal';

export default function ProfileScreen() {
  const { profile, badges, newlyEarnedBadge, clearNewlyEarnedBadge, updateProfileName, notificationSettings, updateNotificationSettings, gentleMode, setGentleMode, setPremium, premium } = useApp();
  const isPremium = premium.isPremium;
  const { user, logout } = useAuth();
  const colors = useColors();
  const { themePreference, setTheme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [showSettings, setShowSettings] = useState(false);
  const [editName, setEditName] = useState('');
  const [localHour, setLocalHour] = useState(notificationSettings.reminderHour);
  const [localMinute, setLocalMinute] = useState(notificationSettings.reminderMinute);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (newlyEarnedBadge) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [newlyEarnedBadge]);

  const earnedBadges = badges.filter(b => b.isEarned);
  const lockedBadges = badges.filter(b => !b.isEarned);
  const displayName = profile.name || 'Friend';
  const selectedAreas = FOCUS_AREAS.filter(f => profile.focusAreas.includes(f.id));

  const daysSinceJoined = Math.max(1, Math.floor(
    (Date.now() - new Date(profile.joinedAt).getTime()) / (1000 * 60 * 60 * 24)
  ));

  const handleOpenSettings = () => {
    setEditName(profile.name || '');
    setLocalHour(notificationSettings.reminderHour);
    setLocalMinute(notificationSettings.reminderMinute);
    setShowSettings(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSaveName = () => {
    if (editName.trim()) {
      updateProfileName(editName.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleSetTheme = (pref: ThemePreference) => {
    setTheme(pref);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleToggleReminder = useCallback((value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateNotificationSettings({
      dailyReminderEnabled: value,
      reminderHour: localHour,
      reminderMinute: localMinute,
    });
  }, [updateNotificationSettings, localHour, localMinute]);

  const adjustHour = useCallback((delta: number) => {
    const newHour = (localHour + delta + 24) % 24;
    setLocalHour(newHour);
    if (notificationSettings.dailyReminderEnabled) {
      updateNotificationSettings({ reminderHour: newHour });
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [localHour, notificationSettings.dailyReminderEnabled, updateNotificationSettings]);

  const adjustMinute = useCallback((delta: number) => {
    const newMinute = (localMinute + delta + 60) % 60;
    setLocalMinute(newMinute);
    if (notificationSettings.dailyReminderEnabled) {
      updateNotificationSettings({ reminderMinute: newMinute });
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [localMinute, notificationSettings.dailyReminderEnabled, updateNotificationSettings]);

  const handleToggleGentleMode = useCallback((value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setGentleMode(value);
  }, [setGentleMode]);

  const handlePurchaseSuccess = useCallback(() => {
    setPremium(true);
    setShowPaywall(false);
    setGentleMode(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [setPremium, setGentleMode]);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const themeOptions: { key: ThemePreference; label: string; icon: React.ReactNode }[] = [
    { key: 'system', label: 'System', icon: <Smartphone size={18} color={themePreference === 'system' ? colors.primary : colors.textMuted} /> },
    { key: 'light', label: 'Light', icon: <Sun size={18} color={themePreference === 'light' ? colors.primary : colors.textMuted} /> },
    { key: 'dark', label: 'Dark', icon: <Moon size={18} color={themePreference === 'dark' ? colors.primary : colors.textMuted} /> },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.settingsRow}>
              <TouchableOpacity
                testID="settings-btn"
                style={styles.settingsBtn}
                onPress={handleOpenSettings}
                activeOpacity={0.7}
              >
                <Settings size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

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
                <View style={[styles.statIcon, { backgroundColor: colors.accentLight }]}>
                  <Flame size={18} color={colors.accent} />
                </View>
                <Text style={styles.statValue}>{profile.currentStreak}</Text>
                <Text style={styles.statLabel}>Current Streak</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: colors.primarySoft }]}>
                  <TrendingUp size={18} color={colors.primary} />
                </View>
                <Text style={styles.statValue}>{profile.bestStreak}</Text>
                <Text style={styles.statLabel}>Best Streak</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: colors.secondaryLight }]}>
                  <Star size={18} color={colors.secondary} />
                </View>
                <Text style={styles.statValue}>{profile.totalPoints}</Text>
                <Text style={styles.statLabel}>Total Points</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: colors.primaryLight }]}>
                  <Calendar size={18} color={colors.primary} />
                </View>
                <Text style={styles.statValue}>{profile.habitsCompleted}</Text>
                <Text style={styles.statLabel}>Habits Done</Text>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Award size={18} color={colors.primary} />
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
              <LogOut size={18} color={colors.error} />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>

            <View style={{ height: 30 }} />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={!!newlyEarnedBadge} transparent animationType="fade">
        <View style={styles.badgeModalOverlay}>
          <View style={styles.badgeModalContent}>
            <TouchableOpacity style={styles.badgeModalClose} onPress={clearNewlyEarnedBadge}>
              <X size={20} color={colors.textMuted} />
            </TouchableOpacity>
            <Text style={styles.badgeModalEmoji}>{newlyEarnedBadge?.emoji}</Text>
            <Text style={styles.badgeModalTitle}>Badge Earned!</Text>
            <Text style={styles.badgeModalName}>{newlyEarnedBadge?.title}</Text>
            <Text style={styles.badgeModalDesc}>{newlyEarnedBadge?.description}</Text>
            <TouchableOpacity style={styles.badgeModalBtn} onPress={clearNewlyEarnedBadge}>
              <Text style={styles.badgeModalBtnText}>Awesome!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showSettings} animationType="slide" transparent>
        <Pressable style={styles.settingsOverlay} onPress={() => setShowSettings(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.settingsContainer}
          >
            <Pressable style={styles.settingsContent} onPress={() => {}}>
              <View style={styles.settingsHandle} />
              <View style={styles.settingsHeader}>
                <Text style={styles.settingsTitle}>Settings</Text>
                <TouchableOpacity onPress={() => setShowSettings(false)}>
                  <X size={22} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.settingsSectionLabel}>Profile</Text>
                <View style={styles.settingsCard}>
                  <Text style={styles.settingsFieldLabel}>First Name</Text>
                  <View style={styles.nameEditRow}>
                    <TextInput
                      testID="settings-name-input"
                      style={styles.settingsInput}
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="Your name"
                      placeholderTextColor={colors.textMuted}
                      maxLength={30}
                      autoCapitalize="words"
                    />
                    <TouchableOpacity
                      style={[styles.saveNameBtn, !editName.trim() && styles.saveNameBtnDisabled]}
                      onPress={handleSaveName}
                      disabled={!editName.trim()}
                      activeOpacity={0.7}
                    >
                      <Check size={18} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.settingsSectionLabel}>Wellness</Text>
                <View style={styles.settingsCard}>
                  <View style={styles.reminderToggleRow}>
                    <View style={styles.reminderLabelRow}>
                      <Heart size={18} color={colors.secondary} />
                      <View style={styles.gentleLabelWrap}>
                        <Text style={styles.settingsFieldLabel}>Gentle Mode</Text>
                        <Text style={styles.gentleSubLabel}>Low energy / rest days</Text>
                      </View>
                    </View>
                    <View style={styles.gentleToggleRow}>
                      {!isPremium && (
                        <View style={styles.premiumBadge}>
                          <Crown size={11} color={colors.accent} />
                          <Text style={styles.premiumBadgeText}>PRO</Text>
                        </View>
                      )}
                      <Switch
                        testID="gentle-mode-toggle"
                        value={gentleMode.gentleModeEnabled}
                        onValueChange={handleToggleGentleMode}
                        trackColor={{ false: colors.borderLight, true: colors.secondaryLight }}
                        thumbColor={gentleMode.gentleModeEnabled ? colors.secondary : colors.textMuted}
                      />
                    </View>
                  </View>
                  {gentleMode.gentleModeEnabled && (
                    <View style={styles.gentleInfoSection}>
                      <Text style={styles.gentleInfoText}>
                        When enabled, the app uses supportive language and lets you take rest days without breaking streaks.
                      </Text>
                      <Text style={styles.gentlePrivacy}>
                        Privacy: only the toggle state is stored locally on your device.
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.settingsSectionLabel}>Notifications</Text>
                <View style={styles.settingsCard}>
                  <View style={styles.reminderToggleRow}>
                    <View style={styles.reminderLabelRow}>
                      <Bell size={18} color={colors.primary} />
                      <Text style={styles.settingsFieldLabel}>Daily Reminder</Text>
                    </View>
                    <Switch
                      testID="reminder-toggle"
                      value={notificationSettings.dailyReminderEnabled}
                      onValueChange={handleToggleReminder}
                      trackColor={{ false: colors.borderLight, true: colors.primaryLight }}
                      thumbColor={notificationSettings.dailyReminderEnabled ? colors.primary : colors.textMuted}
                    />
                  </View>
                  {notificationSettings.dailyReminderEnabled && (
                    <View style={styles.timePickerSection}>
                      <View style={styles.timePickerLabelRow}>
                        <Clock size={16} color={colors.textSecondary} />
                        <Text style={styles.timePickerLabel}>Remind me at</Text>
                      </View>
                      <View style={styles.timePickerRow}>
                        <View style={styles.timeSpinner}>
                          <TouchableOpacity
                            style={styles.spinnerBtn}
                            onPress={() => adjustHour(1)}
                            activeOpacity={0.6}
                          >
                            <ChevronUp size={18} color={colors.textSecondary} />
                          </TouchableOpacity>
                          <Text style={styles.timeDigit}>{(localHour === 0 ? 12 : localHour > 12 ? localHour - 12 : localHour).toString().padStart(2, '0')}</Text>
                          <TouchableOpacity
                            style={styles.spinnerBtn}
                            onPress={() => adjustHour(-1)}
                            activeOpacity={0.6}
                          >
                            <ChevronDown size={18} color={colors.textSecondary} />
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.timeSeparator}>:</Text>
                        <View style={styles.timeSpinner}>
                          <TouchableOpacity
                            style={styles.spinnerBtn}
                            onPress={() => adjustMinute(5)}
                            activeOpacity={0.6}
                          >
                            <ChevronUp size={18} color={colors.textSecondary} />
                          </TouchableOpacity>
                          <Text style={styles.timeDigit}>{localMinute.toString().padStart(2, '0')}</Text>
                          <TouchableOpacity
                            style={styles.spinnerBtn}
                            onPress={() => adjustMinute(-5)}
                            activeOpacity={0.6}
                          >
                            <ChevronDown size={18} color={colors.textSecondary} />
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                          style={styles.amPmBtn}
                          onPress={() => adjustHour(localHour >= 12 ? -12 : 12)}
                          activeOpacity={0.6}
                        >
                          <Text style={styles.amPmText}>{localHour >= 12 ? 'PM' : 'AM'}</Text>
                        </TouchableOpacity>
                      </View>
                      {Platform.OS === 'web' && (
                        <Text style={styles.webNote}>Notifications work on mobile devices only</Text>
                      )}
                    </View>
                  )}
                </View>

                <Text style={styles.settingsSectionLabel}>Appearance</Text>
                <View style={styles.settingsCard}>
                  <Text style={styles.settingsFieldLabel}>Theme</Text>
                  <View style={styles.themeRow}>
                    {themeOptions.map(option => (
                      <TouchableOpacity
                        key={option.key}
                        testID={`theme-${option.key}`}
                        style={[
                          styles.themeOption,
                          themePreference === option.key && styles.themeOptionActive,
                        ]}
                        onPress={() => handleSetTheme(option.key)}
                        activeOpacity={0.7}
                      >
                        {option.icon}
                        <Text style={[
                          styles.themeOptionText,
                          themePreference === option.key && styles.themeOptionTextActive,
                        ]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={{ height: 40 }} />
              </ScrollView>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchaseSuccess={handlePurchaseSuccess}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  settingsRow: {
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardAlt,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  profileHeader: {
    alignItems: 'center' as const,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: '800' as const,
    color: colors.white,
  },
  nameText: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: colors.text,
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: colors.textSecondary,
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
    backgroundColor: colors.primarySoft,
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
    color: colors.primary,
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
    backgroundColor: colors.card,
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
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
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
    color: colors.text,
    flex: 1,
  },
  badgeCount: {
    fontSize: 13,
    color: colors.textMuted,
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
    backgroundColor: colors.card,
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
    color: colors.text,
    textAlign: 'center' as const,
    marginBottom: 3,
  },
  badgeDesc: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center' as const,
    lineHeight: 15,
  },
  emptyBadges: {
    backgroundColor: colors.cardAlt,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center' as const,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
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
    backgroundColor: colors.cardAlt,
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
    color: colors.textSecondary,
  },
  lockedDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  weeklyCard: {
    marginHorizontal: 20,
    marginTop: 28,
    backgroundColor: colors.card,
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
    color: colors.text,
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
    color: colors.textMuted,
  },
  weekDayLabelToday: {
    color: colors.primary,
  },
  weekDayDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.borderLight,
  },
  weekDayDotActive: {
    backgroundColor: colors.secondaryLight,
  },
  weekDayDotToday: {
    backgroundColor: colors.primary,
  },
  quoteCard: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: colors.primarySoft,
    borderRadius: 18,
    padding: 22,
  },
  quoteText: {
    fontSize: 15,
    color: colors.text,
    fontStyle: 'italic' as const,
    lineHeight: 23,
    marginBottom: 8,
  },
  quoteAuthor: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  emailText: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4,
  },
  logoutBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    marginHorizontal: 20,
    marginTop: 28,
    backgroundColor: colors.cardAlt,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.error,
  },
  badgeModalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 40,
  },
  badgeModalContent: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center' as const,
    width: '100%',
    maxWidth: 320,
  },
  badgeModalClose: {
    position: 'absolute' as const,
    top: 16,
    right: 16,
  },
  badgeModalEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  badgeModalTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 8,
  },
  badgeModalName: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  badgeModalDesc: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  badgeModalBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  badgeModalBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.white,
  },
  settingsOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end' as const,
  },
  settingsContainer: {
    justifyContent: 'flex-end' as const,
  },
  settingsContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  settingsHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center' as const,
    marginBottom: 16,
  },
  settingsHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 24,
  },
  settingsTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: colors.text,
  },
  settingsSectionLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 4,
  },
  settingsCard: {
    backgroundColor: colors.cardAlt,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  settingsFieldLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: 0,
  },
  nameEditRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  settingsInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.text,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  saveNameBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  saveNameBtnDisabled: {
    opacity: 0.4,
  },
  themeRow: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  themeOptionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textMuted,
  },
  themeOptionTextActive: {
    color: colors.primary,
  },
  reminderToggleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  reminderLabelRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    flex: 1,
    marginRight: 12,
  },
  timePickerSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  timePickerLabelRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginBottom: 12,
  },
  timePickerLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  timePickerRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
  },
  timeSpinner: {
    alignItems: 'center' as const,
    gap: 2,
  },
  spinnerBtn: {
    width: 40,
    height: 32,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  timeDigit: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    minWidth: 50,
    textAlign: 'center' as const,
    fontVariant: ['tabular-nums' as const],
  },
  timeSeparator: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.textMuted,
    marginHorizontal: 2,
  },
  amPmBtn: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 8,
  },
  amPmText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  webNote: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center' as const,
    marginTop: 10,
    fontStyle: 'italic' as const,
  },
  gentleLabelWrap: {
    flex: 1,
  },
  gentleSubLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  gentleToggleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  premiumBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 3,
    backgroundColor: colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: colors.accent,
    letterSpacing: 0.5,
  },
  gentleInfoSection: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  gentleInfoText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 8,
  },
  gentlePrivacy: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic' as const,
  },
});
