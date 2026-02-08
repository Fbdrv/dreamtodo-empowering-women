import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';
import { Dream } from '@/types';
import { FOCUS_AREAS } from '@/mocks/data';

interface DreamCardProps {
  dream: Dream;
}

export default function DreamCard({ dream }: DreamCardProps) {
  const focusArea = FOCUS_AREAS.find(f => f.id === dream.focusArea);
  const progressPercent = Math.round(dream.progress * 100);

  return (
    <View style={styles.card} testID={`dream-${dream.id}`}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{focusArea?.emoji}</Text>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>{progressPercent}%</Text>
        </View>
      </View>
      <Text style={styles.title}>{dream.title}</Text>
      <Text style={styles.description} numberOfLines={2}>{dream.description}</Text>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  emoji: {
    fontSize: 28,
  },
  progressBadge: {
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  title: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.borderLight,
    overflow: 'hidden' as const,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
});
