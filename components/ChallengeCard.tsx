import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Check, Clock, Sparkles, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Challenge } from '@/types';

interface ChallengeCardProps {
  challenge: Challenge;
  onComplete: (id: string) => void;
  variant?: 'full' | 'compact';
}

export default function ChallengeCard({ challenge, onComplete, variant = 'full' }: ChallengeCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  const handleComplete = () => {
    if (challenge.isCompleted) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
    Animated.spring(checkAnim, { toValue: 1, useNativeDriver: true }).start();
    onComplete(challenge.id);
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        testID={`challenge-${challenge.id}`}
        style={[styles.compactCard, challenge.isCompleted && styles.completedCard]}
        onPress={handleComplete}
        activeOpacity={0.7}
      >
        <View style={styles.compactLeft}>
          <View style={styles.compactContent}>
            <Text style={[styles.compactTitle, challenge.isCompleted && styles.completedText]} numberOfLines={1}>
              {challenge.title}
            </Text>
            <View style={styles.metaRow}>
              <Clock size={12} color={Colors.textMuted} />
              <Text style={styles.duration}>{challenge.duration}</Text>
            </View>
          </View>
        </View>
        {challenge.isCompleted ? (
          <View style={styles.checkCircle}>
            <Check size={14} color={Colors.white} />
          </View>
        ) : (
          <ArrowRight size={16} color={Colors.textMuted} />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        testID={`challenge-main-${challenge.id}`}
        style={[styles.card, challenge.isCompleted && styles.completedCard]}
        onPress={handleComplete}
        activeOpacity={0.8}
      >
        <View style={styles.header}>
          <View style={styles.badge}>
            <Sparkles size={14} color={Colors.accent} />
            <Text style={styles.badgeText}>Today&apos;s Challenge</Text>
          </View>
          <View style={styles.durationBadge}>
            <Clock size={12} color={Colors.textSecondary} />
            <Text style={styles.durationText}>{challenge.duration}</Text>
          </View>
        </View>
        <Text style={[styles.title, challenge.isCompleted && styles.completedText]}>{challenge.title}</Text>
        {challenge.description ? <Text style={styles.description}>{challenge.description}</Text> : null}
        {challenge.isCompleted ? (
          <View style={styles.completedBanner}>
            <Check size={16} color={Colors.success} />
            <Text style={styles.completedBannerText}>Completed! Great job!</Text>
          </View>
        ) : (
          <View style={styles.actionRow}>
            <View style={styles.completeBtn}>
              <Text style={styles.completeBtnText}>Mark Complete</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  completedCard: {
    backgroundColor: Colors.secondaryLight,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 14,
  },
  badge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  durationBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  completedText: {
    textDecorationLine: 'line-through' as const,
    color: Colors.textMuted,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
  },
  completeBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  completeBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  completedBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    backgroundColor: 'rgba(126, 176, 122, 0.15)',
    padding: 12,
    borderRadius: 12,
  },
  completedBannerText: {
    fontSize: 13,
    color: Colors.secondary,
    fontStyle: 'italic' as const,
    flex: 1,
  },
  compactCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  compactLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    flex: 1,
  },
  compactEmoji: {
    fontSize: 22,
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  duration: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.success,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});
