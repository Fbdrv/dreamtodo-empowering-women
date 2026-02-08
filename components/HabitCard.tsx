import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Check, Flame, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Habit } from '@/types';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
}

export default function HabitCard({ habit, onToggle }: HabitCardProps) {
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
            {isCompletedToday && <Check size={14} color={Colors.white} />}
          </View>
          <View style={styles.content}>
            <Text style={[styles.title, isCompletedToday && styles.titleCompleted]} numberOfLines={1}>
              {habit.title}
            </Text>
            <View style={styles.meta}>
              {habit.streak > 0 && (
                <View style={styles.streakBadge}>
                  <Flame size={12} color={Colors.accent} />
                  <Text style={styles.streakText}>{habit.streak} day streak</Text>
                </View>
              )}
              <Text style={styles.frequency}>{habit.frequency}</Text>
            </View>
          </View>
        </View>
        {isCompletedToday ? (
          <RotateCcw size={16} color={Colors.textMuted} />
        ) : null}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  completedCard: {
    backgroundColor: Colors.secondaryLight,
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
    borderColor: Colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  checkboxActive: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  titleCompleted: {
    color: Colors.textMuted,
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
    color: Colors.accent,
    fontWeight: '500' as const,
  },
  frequency: {
    fontSize: 12,
    color: Colors.textMuted,
    textTransform: 'capitalize' as const,
  },
});
