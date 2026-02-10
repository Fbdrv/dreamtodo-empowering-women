import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Heart, Moon } from 'lucide-react-native';
import { useColors } from '@/providers/ThemeProvider';
import { ThemeColors } from '@/constants/colors';

interface GentleModeBannerProps {
  variant?: 'full' | 'compact';
  onRestDay?: () => void;
  isRestDay?: boolean;
}

export default function GentleModeBanner({ variant = 'full', onRestDay, isRestDay }: GentleModeBannerProps) {
  const colors = useColors();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fadeAnim]);

  if (variant === 'compact') {
    return (
      <Animated.View style={[styles.compactBanner, { opacity: fadeAnim }]}>
        <Heart size={14} color={colors.secondary} />
        <Text style={styles.compactText}>Gentle Mode is on</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.banner, { opacity: fadeAnim }]}>
      <View style={styles.bannerTop}>
        <View style={styles.iconCircle}>
          <Moon size={18} color={colors.secondary} />
        </View>
        <View style={styles.bannerTextWrap}>
          <Text style={styles.bannerTitle}>Gentle Mode is on</Text>
          <Text style={styles.bannerSubtitle}>
            {"It's okay to do less today. One tiny step is enough."}
          </Text>
        </View>
      </View>
      {onRestDay && !isRestDay && (
        <TouchableOpacity style={styles.restDayBtn} onPress={onRestDay} activeOpacity={0.7}>
          <Heart size={14} color={colors.white} />
          <Text style={styles.restDayBtnText}>Take a rest day</Text>
        </TouchableOpacity>
      )}
      {isRestDay && (
        <View style={styles.restDayActive}>
          <Text style={styles.restDayActiveText}>Rest day active — your streaks are safe</Text>
        </View>
      )}
    </Animated.View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  banner: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: colors.secondaryLight,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.secondary + '30',
  },
  bannerTop: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondary + '25',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 2,
  },
  bannerTextWrap: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 3,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  restDayBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
    backgroundColor: colors.secondary,
    borderRadius: 14,
    paddingVertical: 10,
    marginTop: 12,
  },
  restDayBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.white,
  },
  restDayActive: {
    backgroundColor: colors.secondary + '20',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    alignItems: 'center' as const,
  },
  restDayActiveText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.secondary,
    fontStyle: 'italic' as const,
  },
  compactBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    alignSelf: 'flex-start' as const,
  },
  compactText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.secondary,
  },
});
