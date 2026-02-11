import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform,
  Modal,
  Pressable,
  Animated,
} from 'react-native';
import { Stack } from 'expo-router';
import {
  Check,
  Sun,
  Moon,
  Smartphone,
  Bell,
  Clock,
  ChevronUp,
  ChevronDown,
  Heart,
  Crown,
  Shield,
  Sparkles,
  Zap,
  Leaf,
  X,
  RotateCcw,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useColors, useTheme, ThemePreference } from '@/providers/ThemeProvider';
import { useApp } from '@/providers/AppProvider';
import { ThemeColors } from '@/constants/colors';

export default function SettingsScreen() {
  const {
    profile,
    updateProfileName,
    notificationSettings,
    updateNotificationSettings,
    gentleMode,
    setGentleMode,
    premium,
  } = useApp();
  const isPremium = premium.isPremium;
  const colors = useColors();
  const { themePreference, setTheme } = useTheme();

  const [editName, setEditName] = useState(profile.name || '');
  const [localHour, setLocalHour] = useState(notificationSettings.reminderHour);
  const [localMinute, setLocalMinute] = useState(notificationSettings.reminderMinute);
  const [showGentlePaywall, setShowGentlePaywall] = useState(false);
  const paywallFade = useState(new Animated.Value(0))[0];
  const paywallScale = useState(new Animated.Value(0.9))[0];

  useEffect(() => {
    if (showGentlePaywall) {
      Animated.parallel([
        Animated.timing(paywallFade, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(paywallScale, { toValue: 1, friction: 8, useNativeDriver: true }),
      ]).start();
    } else {
      paywallFade.setValue(0);
      paywallScale.setValue(0.9);
    }
  }, [showGentlePaywall, paywallFade, paywallScale]);

  const handleSaveName = useCallback(() => {
    if (editName.trim()) {
      updateProfileName(editName.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [editName, updateProfileName]);

  const handleSetTheme = useCallback((pref: ThemePreference) => {
    setTheme(pref);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [setTheme]);

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
    if (value && !isPremium) {
      setShowGentlePaywall(true);
      return;
    }
    setGentleMode(value);
  }, [isPremium, setGentleMode]);

  const onUnlockGentleMode = useCallback(() => {
    // TODO: Connect to RevenueCat purchase flow here
    // For now, this is a placeholder that logs the intent
    console.log('[settings] onUnlockGentleMode triggered — connect RevenueCat purchase here');
    setShowGentlePaywall(false);
  }, []);

  const handleRestorePurchases = useCallback(() => {
    // TODO: Connect to RevenueCat restore flow here
    console.log('[settings] handleRestorePurchases triggered — connect RevenueCat restore here');
  }, []);

  const handleDismissPaywall = useCallback(() => {
    setShowGentlePaywall(false);
  }, []);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const themeOptions: { key: ThemePreference; label: string; icon: React.ReactNode }[] = [
    { key: 'system', label: 'System', icon: <Smartphone size={18} color={themePreference === 'system' ? colors.primary : colors.textMuted} /> },
    { key: 'light', label: 'Light', icon: <Sun size={18} color={themePreference === 'light' ? colors.primary : colors.textMuted} /> },
    { key: 'dark', label: 'Dark', icon: <Moon size={18} color={themePreference === 'dark' ? colors.primary : colors.textMuted} /> },
  ];

  const gentleBenefits = [
    { icon: <Heart size={20} color={colors.secondary} />, label: 'Supportive language on low-energy days' },
    { icon: <Shield size={20} color={colors.primary} />, label: 'Rest days that protect your streaks' },
    { icon: <Sparkles size={20} color={colors.accent} />, label: 'Personalized wellness check-ins' },
    { icon: <Zap size={20} color={colors.warning} />, label: 'Flexible habit goals when you need it' },
    { icon: <Leaf size={20} color={colors.success} />, label: 'Mindful progress tracking' },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>Profile</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>First Name</Text>
          <View style={styles.nameEditRow}>
            <TextInput
              testID="settings-name-input"
              style={styles.input}
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

        <Text style={styles.sectionLabel}>Wellness</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.labelRow}>
              <Heart size={18} color={colors.secondary} />
              <View style={styles.gentleLabelWrap}>
                <Text style={styles.fieldLabel}>Gentle Mode</Text>
                <Text style={styles.subLabel}>Low energy / rest days</Text>
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

        <Text style={styles.sectionLabel}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.labelRow}>
              <Bell size={18} color={colors.primary} />
              <Text style={styles.fieldLabel}>Daily Reminder</Text>
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
                  <Text style={styles.timeDigit}>
                    {(localHour === 0 ? 12 : localHour > 12 ? localHour - 12 : localHour).toString().padStart(2, '0')}
                  </Text>
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

        <Text style={styles.sectionLabel}>Appearance</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Theme</Text>
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

        <View style={{ height: 50 }} />
      </ScrollView>

      <Modal visible={showGentlePaywall} transparent animationType="none">
        <Animated.View style={[styles.paywallOverlay, { opacity: paywallFade }]}>
          <Pressable style={styles.paywallOverlayPress} onPress={handleDismissPaywall}>
            <Animated.View style={[styles.paywallContent, { transform: [{ scale: paywallScale }] }]}>
              <Pressable onPress={() => {}}>
                <TouchableOpacity style={styles.paywallCloseBtn} onPress={handleDismissPaywall}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>

                <View style={styles.paywallIconCircle}>
                  <Heart size={32} color={colors.secondary} />
                </View>

                <Text style={styles.paywallTitle}>Unlock Gentle Mode</Text>
                <Text style={styles.paywallSubtitle}>
                  A premium feature designed for your wellbeing on low-energy days.
                </Text>

                <View style={styles.paywallBenefits}>
                  {gentleBenefits.map((b, i) => (
                    <View key={i} style={styles.paywallBenefitRow}>
                      <View style={styles.paywallBenefitIcon}>{b.icon}</View>
                      <Text style={styles.paywallBenefitText}>{b.label}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  testID="unlock-gentle-mode-btn"
                  style={styles.paywallCta}
                  onPress={onUnlockGentleMode}
                  activeOpacity={0.8}
                >
                  <Crown size={18} color={colors.white} />
                  <Text style={styles.paywallCtaText}>Unlock Gentle Mode</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  testID="not-now-btn"
                  style={styles.paywallSecondary}
                  onPress={handleDismissPaywall}
                  activeOpacity={0.7}
                >
                  <Text style={styles.paywallSecondaryText}>Not now</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  testID="restore-purchases-btn"
                  style={styles.paywallRestore}
                  onPress={handleRestorePurchases}
                >
                  <RotateCcw size={13} color={colors.textMuted} />
                  <Text style={styles.paywallRestoreText}>Restore purchases</Text>
                </TouchableOpacity>
              </Pressable>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: 0,
  },
  nameEditRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    marginTop: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.text,
    backgroundColor: colors.cardAlt,
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
  toggleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  labelRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    flex: 1,
    marginRight: 12,
  },
  gentleLabelWrap: {
    flex: 1,
  },
  subLabel: {
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
    backgroundColor: colors.cardAlt,
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
  themeRow: {
    flexDirection: 'row' as const,
    gap: 8,
    marginTop: 10,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.cardAlt,
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
  paywallOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  paywallOverlayPress: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    width: '100%',
    padding: 24,
  },
  paywallContent: {
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 28,
    width: '100%',
    maxWidth: 360,
  },
  paywallCloseBtn: {
    position: 'absolute' as const,
    top: -8,
    right: -8,
    zIndex: 1,
    width: 32,
    height: 32,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  paywallIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    alignSelf: 'center' as const,
    marginBottom: 16,
    marginTop: 8,
  },
  paywallTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: colors.text,
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  paywallSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  paywallBenefits: {
    gap: 14,
    marginBottom: 28,
  },
  paywallBenefitRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 14,
  },
  paywallBenefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.cardAlt,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  paywallBenefitText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.text,
    flex: 1,
  },
  paywallCta: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: 16,
    marginBottom: 12,
  },
  paywallCtaText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.white,
  },
  paywallSecondary: {
    alignItems: 'center' as const,
    paddingVertical: 12,
    marginBottom: 8,
  },
  paywallSecondaryText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  paywallRestore: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
    paddingVertical: 6,
  },
  paywallRestoreText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.textMuted,
  },
});
