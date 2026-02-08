import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Zap, Check, Clock, Trash2, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import { Goal, Challenge } from '@/types';

const DURATION_OPTIONS = ['5 min', '10 min', '15 min', '30 min', '1 hour'];

export default function ChallengesScreen() {
  const { challenges, goals, profile, addChallenge, completeChallenge, deleteChallenge } = useApp();
  const [showAddChallenge, setShowAddChallenge] = useState(false);
  const [selectedGoalFilter, setSelectedGoalFilter] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[0]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const resetForm = () => {
    setNewTitle('');
    setNewDesc('');
    setSelectedGoalId(goals.length > 0 ? goals[0].id : '');
    setSelectedDuration(DURATION_OPTIONS[0]);
  };

  const handleOpenAdd = () => {
    if (goals.length === 0) {
      Alert.alert('Create a Goal First', 'You need at least one goal to create challenges.');
      return;
    }
    resetForm();
    setShowAddChallenge(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSaveChallenge = () => {
    if (!newTitle.trim() || !selectedGoalId) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addChallenge(newTitle.trim(), newDesc.trim(), selectedGoalId, selectedDuration);
    setShowAddChallenge(false);
    resetForm();
  };

  const handleComplete = (challengeId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeChallenge(challengeId);
  };

  const handleDelete = (challenge: Challenge) => {
    Alert.alert(
      'Delete Challenge',
      'Are you sure you want to delete this challenge?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            deleteChallenge(challenge.id);
          },
        },
      ]
    );
  };

  const filteredChallenges = selectedGoalFilter
    ? challenges.filter(c => c.goalId === selectedGoalFilter)
    : challenges;

  const pendingChallenges = filteredChallenges.filter(c => !c.isCompleted);
  const completedChallenges = filteredChallenges.filter(c => c.isCompleted);

  const getGoal = (goalId: string): Goal | undefined => goals.find(g => g.id === goalId);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Challenges</Text>
                <Text style={styles.subtitle}>
                  {completedChallenges.length} completed, {pendingChallenges.length} to go
                </Text>
              </View>
              <View style={styles.pointsBadge}>
                <Zap size={14} color={Colors.accent} />
                <Text style={styles.pointsText}>{profile.totalPoints} pts</Text>
              </View>
            </View>

            {goals.length > 0 && (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.filterScroll}
                contentContainerStyle={styles.filterContent}
              >
                <TouchableOpacity
                  style={[styles.filterPill, !selectedGoalFilter && styles.filterPillActive]}
                  onPress={() => setSelectedGoalFilter(null)}
                >
                  <Text style={[styles.filterText, !selectedGoalFilter && styles.filterTextActive]}>All</Text>
                </TouchableOpacity>
                {goals.map(goal => (
                  <TouchableOpacity
                    key={goal.id}
                    style={[styles.filterPill, selectedGoalFilter === goal.id && styles.filterPillActive]}
                    onPress={() => setSelectedGoalFilter(goal.id)}
                  >
                    <Text style={styles.filterEmoji}>{goal.emoji}</Text>
                    <Text style={[styles.filterText, selectedGoalFilter === goal.id && styles.filterTextActive]}>
                      {goal.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {challenges.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🎯</Text>
                <Text style={styles.emptyTitle}>No challenges yet</Text>
                <Text style={styles.emptySubtitle}>
                  {goals.length === 0 
                    ? 'Create a goal first, then add challenges to it'
                    : 'Add challenges to work toward your goals'}
                </Text>
                {goals.length > 0 && (
                  <TouchableOpacity style={styles.emptyBtn} onPress={handleOpenAdd}>
                    <Plus size={18} color={Colors.white} />
                    <Text style={styles.emptyBtnText}>Create Challenge</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <>
                {pendingChallenges.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Active ({pendingChallenges.length})</Text>
                    <View style={styles.challengesList}>
                      {pendingChallenges.map(challenge => {
                        const goal = getGoal(challenge.goalId);
                        return (
                          <View key={challenge.id} style={styles.challengeCard}>
                            <View style={styles.challengeHeader}>
                              {goal && (
                                <View style={[styles.goalTag, { backgroundColor: goal.color + '20' }]}>
                                  <Text style={styles.goalTagEmoji}>{goal.emoji}</Text>
                                  <Text style={[styles.goalTagText, { color: goal.color }]}>{goal.title}</Text>
                                </View>
                              )}
                              <TouchableOpacity onPress={() => handleDelete(challenge)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Trash2 size={16} color={Colors.textMuted} />
                              </TouchableOpacity>
                            </View>
                            <Text style={styles.challengeTitle}>{challenge.title}</Text>
                            {challenge.description ? (
                              <Text style={styles.challengeDesc}>{challenge.description}</Text>
                            ) : null}
                            <View style={styles.challengeFooter}>
                              <View style={styles.durationBadge}>
                                <Clock size={12} color={Colors.textMuted} />
                                <Text style={styles.durationText}>{challenge.duration}</Text>
                              </View>
                              <TouchableOpacity
                                style={styles.completeBtn}
                                onPress={() => handleComplete(challenge.id)}
                              >
                                <Check size={16} color={Colors.white} />
                                <Text style={styles.completeBtnText}>Complete</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}

                {completedChallenges.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Completed ({completedChallenges.length})</Text>
                    <View style={styles.challengesList}>
                      {completedChallenges.map(challenge => {
                        const goal = getGoal(challenge.goalId);
                        return (
                          <View key={challenge.id} style={[styles.challengeCard, styles.challengeCardCompleted]}>
                            <View style={styles.challengeHeader}>
                              {goal && (
                                <View style={[styles.goalTag, { backgroundColor: goal.color + '15' }]}>
                                  <Text style={styles.goalTagEmoji}>{goal.emoji}</Text>
                                  <Text style={[styles.goalTagText, { color: goal.color }]}>{goal.title}</Text>
                                </View>
                              )}
                              <View style={styles.completedBadge}>
                                <Check size={12} color={Colors.success} />
                              </View>
                            </View>
                            <Text style={[styles.challengeTitle, styles.challengeTitleCompleted]}>{challenge.title}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}
              </>
            )}

            <View style={{ height: 100 }} />
          </Animated.View>
        </ScrollView>

        {goals.length > 0 && (
          <TouchableOpacity style={styles.fab} onPress={handleOpenAdd} activeOpacity={0.8}>
            <Plus size={24} color={Colors.white} />
          </TouchableOpacity>
        )}
      </SafeAreaView>

      <Modal visible={showAddChallenge} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setShowAddChallenge(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalContainer}
          >
            <Pressable style={styles.modalContent} onPress={() => {}}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Challenge</Text>
                <TouchableOpacity onPress={() => setShowAddChallenge(false)}>
                  <X size={22} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.modalInput}
                placeholder="Challenge title"
                placeholderTextColor={Colors.textMuted}
                value={newTitle}
                onChangeText={setNewTitle}
                autoFocus
                maxLength={100}
              />
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="Description (optional)"
                placeholderTextColor={Colors.textMuted}
                value={newDesc}
                onChangeText={setNewDesc}
                multiline
                numberOfLines={2}
                maxLength={200}
              />

              <Text style={styles.modalLabel}>Link to Goal</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.goalScroll}>
                {goals.map(goal => (
                  <TouchableOpacity
                    key={goal.id}
                    style={[
                      styles.goalOption,
                      selectedGoalId === goal.id && { borderColor: goal.color, backgroundColor: goal.color + '15' },
                    ]}
                    onPress={() => setSelectedGoalId(goal.id)}
                  >
                    <Text style={styles.goalOptionEmoji}>{goal.emoji}</Text>
                    <Text style={[
                      styles.goalOptionText,
                      selectedGoalId === goal.id && { color: goal.color },
                    ]}>
                      {goal.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.modalLabel}>Duration</Text>
              <View style={styles.durationRow}>
                {DURATION_OPTIONS.map(dur => (
                  <TouchableOpacity
                    key={dur}
                    style={[styles.durationOption, selectedDuration === dur && styles.durationOptionActive]}
                    onPress={() => setSelectedDuration(dur)}
                  >
                    <Text style={[styles.durationOptionText, selectedDuration === dur && styles.durationOptionTextActive]}>
                      {dur}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.modalBtn, (!newTitle.trim() || !selectedGoalId) && styles.modalBtnDisabled]}
                onPress={handleSaveChallenge}
                disabled={!newTitle.trim() || !selectedGoalId}
              >
                <Text style={styles.modalBtnText}>Create Challenge</Text>
              </TouchableOpacity>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
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
  filterScroll: {
    marginTop: 12,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    backgroundColor: Colors.cardAlt,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: Colors.primarySoft,
  },
  filterEmoji: {
    fontSize: 14,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center' as const,
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
  },
  emptyBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  challengesList: {
    gap: 12,
  },
  challengeCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  challengeCardCompleted: {
    opacity: 0.7,
  },
  challengeHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 10,
  },
  goalTag: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goalTagEmoji: {
    fontSize: 12,
  },
  goalTagText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.secondaryLight,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  challengeTitleCompleted: {
    textDecorationLine: 'line-through' as const,
    color: Colors.textSecondary,
  },
  challengeDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  challengeFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginTop: 8,
  },
  durationBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  completeBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    backgroundColor: Colors.success,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  completeBtnText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  fab: {
    position: 'absolute' as const,
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end' as const,
  },
  modalContainer: {
    justifyContent: 'flex-end' as const,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  modalInput: {
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    backgroundColor: Colors.cardAlt,
  },
  modalTextArea: {
    minHeight: 60,
    textAlignVertical: 'top' as const,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 10,
    marginTop: 4,
  },
  goalScroll: {
    marginBottom: 16,
  },
  goalOption: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: Colors.cardAlt,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalOptionEmoji: {
    fontSize: 16,
  },
  goalOptionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  durationRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
    marginBottom: 20,
  },
  durationOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.cardAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  durationOptionActive: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
  },
  durationOptionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  durationOptionTextActive: {
    color: Colors.primary,
  },
  modalBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center' as const,
  },
  modalBtnDisabled: {
    opacity: 0.4,
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
