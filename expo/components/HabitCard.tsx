import React, { useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Check, Flame, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/providers/ThemeProvider';
import { Habit } from '@/types';
import { ThemeColors } from '@/constants/colors';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
}

export default function HabitCard({ habit, onToggle }: HabitCardProps) {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = habit.completedDates.includes(today);

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onToggle(habit.id);
  };

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        testID={`habit-${habit.id}`}
        style={[styles.card, isCompletedToday && styles.completedCard]}
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        <View style={styles.left}>
          <View style={[styles.checkbox, isCompletedToday && styles.checkboxActive]}>
            {isCompletedToday && <Check size={14} color={colors.white} />}
          </View>
          <View style={styles.content}>
            <Text style={[styles.title, isCompletedToday && styles.titleCompleted]} numberOfLines={1}>
              {habit.title}
            </Text>
            <View style={styles.meta}>
              {habit.streak > 0 && (
                <View style={styles.streakBadge}>
                  <Flame size={12} color={colors.accent} />
                  <Text style={styles.streakText}>{habit.streak} day streak</Text>
                </View>
              )}
              <Text style={styles.frequency}>{habit.frequency}</Text>
            </View>
          </View>
        </View>
        {isCompletedToday ? (
          <RotateCcw size={16} color={colors.textMuted} />
        ) : null}
      </TouchableOpacity>
    </Animated.View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  card: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  completedCard: {
    backgroundColor: colors.secondaryLight,
  },
  left: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 14,
    flex: 1,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  checkboxActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  titleCompleted: {
    color: colors.textMuted,
    textDecorationLine: 'line-through' as const,
  },
  meta: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  streakBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 3,
  },
  streakText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '500' as const,
  },
  frequency: {
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'capitalize' as const,
  },
});
