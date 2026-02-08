import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Heart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { CommunityWin } from '@/types';
import { FOCUS_AREAS } from '@/mocks/data';

interface WinCardProps {
  win: CommunityWin;
  onCheer: (id: string) => void;
}

export default function WinCard({ win, onCheer }: WinCardProps) {
  const heartScale = useRef(new Animated.Value(1)).current;
  const focusArea = FOCUS_AREAS.find(f => f.id === win.focusArea);

  const handleCheer = () => {
    if (win.hasCheered) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.4, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onCheer(win.id);
  };

  return (
    <View style={styles.card} testID={`win-${win.id}`}>
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>{focusArea?.emoji}</Text>
        </View>
        <View style={styles.headerMeta}>
          <Text style={styles.focusLabel}>{focusArea?.label}</Text>
          <Text style={styles.timeAgo}>{win.timeAgo}</Text>
        </View>
      </View>
      <Text style={styles.message}>{win.message}</Text>
      <TouchableOpacity style={styles.cheerRow} onPress={handleCheer} activeOpacity={0.7}>
        <Animated.View style={{ transform: [{ scale: heartScale }] }}>
          <Heart
            size={18}
            color={win.hasCheered ? Colors.error : Colors.textMuted}
            fill={win.hasCheered ? Colors.error : 'none'}
          />
        </Animated.View>
        <Text style={[styles.cheerCount, win.hasCheered && styles.cheeredText]}>
          {win.cheers}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardAlt,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  avatarEmoji: {
    fontSize: 18,
  },
  headerMeta: {
    flex: 1,
  },
  focusLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  timeAgo: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  message: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 14,
  },
  cheerRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  cheerCount: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  cheeredText: {
    color: Colors.error,
  },
});
