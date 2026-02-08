import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flame, Zap } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import ChallengeCard from '@/components/ChallengeCard';
import { REFLECTION_PROMPTS } from '@/mocks/data';

export default function ChallengesScreen() {
  const { challenges, completeChallenge, profile } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const mainChallenge = challenges.find(c => c.type === 'main');
  const bonusChallenges = challenges.filter(c => c.type === 'bonus');
  const completedCount = challenges.filter(c => c.isCompleted).length;
  const todayPrompt = REFLECTION_PROMPTS[new Date().getDate() % REFLECTION_PROMPTS.length];

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Daily Challenges</Text>
                <Text style={styles.subtitle}>{completedCount} of {challenges.length} completed today</Text>
              </View>
              <View style={styles.pointsBadge}>
                <Zap size={14} color={Colors.accent} />
                <Text style={styles.pointsText}>{profile.totalPoints} pts</Text>
              </View>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${challenges.length > 0 ? (completedCount / challenges.length) * 100 : 0}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressLabel}>
                {completedCount === challenges.length && completedCount > 0
                  ? '🎉 All done! You showed up today.'
                  : `${challenges.length - completedCount} remaining — you've got this!`}
              </Text>
            </View>

            {mainChallenge && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Flame size={18} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>Main Challenge</Text>
                </View>
                <ChallengeCard challenge={mainChallenge} onComplete={completeChallenge} />
              </View>
            )}

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Zap size={18} color={Colors.accent} />
                <Text style={styles.sectionTitle}>Bonus Challenges</Text>
              </View>
              <View style={styles.bonusList}>
                {bonusChallenges.map(challenge => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onComplete={completeChallenge}
                    variant="compact"
                  />
                ))}
              </View>
            </View>

            <View style={styles.reflectionCard}>
              <Text style={styles.reflectionLabel}>Reflection Prompt</Text>
              <Text style={styles.reflectionText}>{todayPrompt}</Text>
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
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  pointsBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  pointsText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  progressBarContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.borderLight,
    overflow: 'hidden' as const,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  progressLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 8,
    fontWeight: '500' as const,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  bonusList: {
    gap: 10,
  },
  reflectionCard: {
    marginHorizontal: 20,
    marginTop: 28,
    backgroundColor: Colors.secondaryLight,
    borderRadius: 18,
    padding: 20,
  },
  reflectionLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.secondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 8,
  },
  reflectionText: {
    fontSize: 17,
    color: Colors.text,
    fontStyle: 'italic' as const,
    lineHeight: 24,
    fontWeight: '500' as const,
  },
});
