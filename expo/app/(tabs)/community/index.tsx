import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Users, Send, X } from 'lucide-react-native';
import { useColors } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useApp } from '@/providers/AppProvider';
import { COMMUNITY_WINS, FOCUS_AREAS } from '@/mocks/data';
import WinCard from '@/components/WinCard';
import { CommunityWin, FocusArea } from '@/types';
import { ThemeColors } from '@/constants/colors';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCommunityWins,
  insertCommunityWin,
  cheerCommunityWin,
  fetchUserCheers,
} from '@/lib/database';

export default function CommunityScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const { profile } = useApp();
  const queryClient = useQueryClient();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showCompose, setShowCompose] = useState<boolean>(false);
  const [newMessage, setNewMessage] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<FocusArea>('lifestyle');

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const winsQuery = useQuery({
    queryKey: ['communityWins'],
    queryFn: async () => {
      const dbWins = await fetchCommunityWins();
      if (dbWins.length > 0) return dbWins;
      return COMMUNITY_WINS;
    },
    staleTime: 30000,
  });

  const cheersQuery = useQuery({
    queryKey: ['userCheers', user?.id],
    queryFn: async () => {
      if (!user?.id) return new Set<string>();
      return fetchUserCheers(user.id);
    },
    enabled: !!user?.id,
  });

  const communityWins: CommunityWin[] = useMemo(() => {
    const wins = winsQuery.data ?? COMMUNITY_WINS;
    const cheeredSet = cheersQuery.data ?? new Set<string>();
    return wins.map(w => ({ ...w, hasCheered: cheeredSet.has(w.id) }));
  }, [winsQuery.data, cheersQuery.data]);

  const cheerMutation = useMutation({
    mutationFn: async (winId: string) => {
      if (!user?.id) return;
      await cheerCommunityWin(user.id, winId);
    },
    onMutate: async (winId: string) => {
      await queryClient.cancelQueries({ queryKey: ['communityWins'] });
      await queryClient.cancelQueries({ queryKey: ['userCheers', user?.id] });

      const previousWins = queryClient.getQueryData<CommunityWin[]>(['communityWins']);
      const previousCheers = queryClient.getQueryData<Set<string>>(['userCheers', user?.id]);

      queryClient.setQueryData<CommunityWin[]>(['communityWins'], (old) =>
        (old ?? []).map(w => w.id === winId ? { ...w, cheers: w.cheers + 1 } : w)
      );
      queryClient.setQueryData<Set<string>>(['userCheers', user?.id], (old) => {
        const newSet = new Set(old);
        newSet.add(winId);
        return newSet;
      });

      return { previousWins, previousCheers };
    },
    onError: (_err, _winId, context) => {
      if (context?.previousWins) {
        queryClient.setQueryData(['communityWins'], context.previousWins);
      }
      if (context?.previousCheers) {
        queryClient.setQueryData(['userCheers', user?.id], context.previousCheers);
      }
    },
  });

  const postMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !newMessage.trim()) return;
      await insertCommunityWin(user.id, profile.name || 'Anonymous', newMessage.trim(), selectedArea);
    },
    onSuccess: () => {
      setNewMessage('');
      setShowCompose(false);
      queryClient.invalidateQueries({ queryKey: ['communityWins'] });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to post your win. Please try again.');
    },
  });

  const { mutate: cheerMutate } = cheerMutation;
  const cheerWin = useCallback((winId: string) => {
    const cheeredSet = cheersQuery.data ?? new Set<string>();
    if (cheeredSet.has(winId)) return;
    cheerMutate(winId);
  }, [cheersQuery.data, cheerMutate]);

  const totalCheers = communityWins.reduce((sum, w) => sum + w.cheers, 0);

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={winsQuery.isRefetching}
              onRefresh={() => {
                queryClient.invalidateQueries({ queryKey: ['communityWins'] });
                queryClient.invalidateQueries({ queryKey: ['userCheers', user?.id] });
              }}
              tintColor={colors.primary}
            />
          }
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>Community</Text>
              </View>
              <Text style={styles.subtitle}>Celebrate wins together</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Users size={20} color={colors.primary} />
                <Text style={styles.statNumber}>{communityWins.length}</Text>
                <Text style={styles.statLabel}>wins shared</Text>
              </View>
              <View style={styles.statCard}>
                <Heart size={20} color={colors.error} />
                <Text style={styles.statNumber}>{totalCheers}</Text>
                <Text style={styles.statLabel}>total cheers</Text>
              </View>
            </View>

            {showCompose ? (
              <View style={styles.composeCard}>
                <View style={styles.composeHeader}>
                  <Text style={styles.composeTitle}>Share Your Win</Text>
                  <TouchableOpacity onPress={() => setShowCompose(false)}>
                    <X size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.composeInput}
                  placeholder="What did you accomplish today?"
                  placeholderTextColor={colors.textMuted}
                  value={newMessage}
                  onChangeText={setNewMessage}
                  multiline
                  maxLength={280}
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.areaSelector}>
                  {FOCUS_AREAS.map(area => (
                    <TouchableOpacity
                      key={area.id}
                      style={[styles.areaPill, selectedArea === area.id && styles.areaPillActive]}
                      onPress={() => setSelectedArea(area.id)}
                    >
                      <Text style={styles.areaPillEmoji}>{area.emoji}</Text>
                      <Text style={[styles.areaPillText, selectedArea === area.id && styles.areaPillTextActive]}>
                        {area.label.split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={[styles.postButton, (!newMessage.trim() || postMutation.isPending) && styles.postButtonDisabled]}
                  onPress={() => postMutation.mutate()}
                  disabled={!newMessage.trim() || postMutation.isPending}
                >
                  {postMutation.isPending ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <>
                      <Send size={16} color={colors.white} />
                      <Text style={styles.postButtonText}>Post Win</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.composeButton} onPress={() => setShowCompose(true)}>
                <Text style={styles.composeButtonEmoji}>🌟</Text>
                <Text style={styles.composeButtonText}>Share Your Win</Text>
              </TouchableOpacity>
            )}

            <View style={styles.feedHeader}>
              <Text style={styles.feedTitle}>Recent Wins</Text>
              {winsQuery.isLoading && <ActivityIndicator size="small" color={colors.primary} />}
              {!winsQuery.isLoading && (
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>Live</Text>
                </View>
              )}
            </View>

            <View style={styles.winsList}>
              {communityWins.map(win => (
                <WinCard key={win.id} win={win} onCheer={cheerWin} />
              ))}
            </View>

            <View style={{ height: 20 }} />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
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
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
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
  statNumber: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  composeButton: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: colors.accentLight,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center' as const,
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    gap: 10,
  },
  composeButtonEmoji: {
    fontSize: 22,
  },
  composeButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
  },
  composeCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  composeHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 14,
  },
  composeTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
  },
  composeInput: {
    backgroundColor: colors.cardAlt,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top' as const,
    marginBottom: 12,
  },
  areaSelector: {
    marginBottom: 14,
  },
  areaPill: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.cardAlt,
    marginRight: 8,
  },
  areaPillActive: {
    backgroundColor: colors.primarySoft,
  },
  areaPillEmoji: {
    fontSize: 14,
  },
  areaPillText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  areaPillTextActive: {
    color: colors.primary,
  },
  postButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.white,
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
    color: colors.text,
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
    backgroundColor: colors.success,
  },
  liveText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600' as const,
  },
  winsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
});
