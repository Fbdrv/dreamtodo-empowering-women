import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Users } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { COMMUNITY_WINS } from '@/mocks/data';
import WinCard from '@/components/WinCard';
import { CommunityWin } from '@/types';

export default function CommunityScreen() {
  const [communityWins, setCommunityWins] = useState<CommunityWin[]>(COMMUNITY_WINS);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const cheerWin = (winId: string) => {
    setCommunityWins(prev => 
      prev.map(w => w.id === winId ? { ...w, cheers: w.cheers + 1, hasCheered: true } : w)
    );
  };

  const totalCheers = communityWins.reduce((sum, w) => sum + w.cheers, 0);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>Community</Text>
                <View style={styles.comingSoonPill}>
                  <Text style={styles.comingSoonText}>Coming soon</Text>
                </View>
              </View>
              <Text style={styles.subtitle}>Preview — full Community features ship after MVP</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Users size={20} color={Colors.primary} />
                <Text style={styles.statNumber}>{communityWins.length}</Text>
                <Text style={styles.statLabel}>wins shared</Text>
              </View>
              <View style={styles.statCard}>
                <Heart size={20} color={Colors.error} />
                <Text style={styles.statNumber}>{totalCheers}</Text>
                <Text style={styles.statLabel}>total cheers</Text>
              </View>
            </View>

            <View style={styles.feedHeader}>
              <Text style={styles.feedTitle}>Recent Wins</Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live</Text>
              </View>
            </View>

            <View style={styles.winsList}>
              {communityWins.map(win => (
                <WinCard key={win.id} win={win} onCheer={cheerWin} />
              ))}
            </View>

            <View style={styles.encourageCard}>
              <Text style={styles.encourageEmoji}>🌟</Text>
              <Text style={styles.encourageTitle}>Share Your Win</Text>
              <Text style={styles.encourageText}>
                When you complete a challenge or habit,{'\n'}your win can inspire someone else.
              </Text>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  titleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  comingSoonPill: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row' as const,
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
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
  statNumber: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  feedHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 14,
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  liveBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  liveText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600' as const,
  },
  winsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  encourageCard: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: Colors.accentLight,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center' as const,
  },
  encourageEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  encourageTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  encourageText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 19,
  },
});
