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
import { Plus, X, Trash2, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import { GOAL_COLORS, GOAL_EMOJIS } from '@/mocks/data';
import { Goal } from '@/types';

export default function GoalsScreen() {
  const { goals, challenges, addGoal, updateGoal, deleteGoal } = useApp();
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDesc, setNewGoalDesc] = useState('');
  const [selectedColor, setSelectedColor] = useState(GOAL_COLORS[0]);
  const [selectedEmoji, setSelectedEmoji] = useState(GOAL_EMOJIS[0]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const resetForm = () => {
    setNewGoalTitle('');
    setNewGoalDesc('');
    setSelectedColor(GOAL_COLORS[0]);
    setSelectedEmoji(GOAL_EMOJIS[0]);
    setEditingGoal(null);
  };

  const handleOpenAdd = () => {
    if (goals.length >= 4) {
      Alert.alert('Limit Reached', 'You can have a maximum of 4 goals. Delete one to add another.');
      return;
    }
    resetForm();
    setShowAddGoal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleOpenEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setNewGoalTitle(goal.title);
    setNewGoalDesc(goal.description || '');
    setSelectedColor(goal.color);
    setSelectedEmoji(goal.emoji);
    setShowAddGoal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSaveGoal = () => {
    if (!newGoalTitle.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    if (editingGoal) {
      updateGoal(editingGoal.id, newGoalTitle.trim(), newGoalDesc.trim(), selectedColor, selectedEmoji);
    } else {
      addGoal(newGoalTitle.trim(), newGoalDesc.trim(), selectedColor, selectedEmoji);
    }
    
    setShowAddGoal(false);
    resetForm();
  };

  const handleDeleteGoal = (goal: Goal) => {
    const challengeCount = challenges.filter(c => c.goalId === goal.id).length;
    const message = challengeCount > 0 
      ? `This will also delete ${challengeCount} challenge${challengeCount > 1 ? 's' : ''} linked to this goal.`
      : 'Are you sure you want to delete this goal?';
    
    Alert.alert(
      'Delete Goal',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            deleteGoal(goal.id);
          }
        },
      ]
    );
  };

  const getChallengeCount = (goalId: string) => {
    return challenges.filter(c => c.goalId === goalId).length;
  };

  const getCompletedCount = (goalId: string) => {
    return challenges.filter(c => c.goalId === goalId && c.isCompleted).length;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>My Goals</Text>
              <Text style={styles.subtitle}>{goals.length}/4 goals created</Text>
            </View>
            <TouchableOpacity
              testID="add-goal-btn"
              style={[styles.addBtn, goals.length >= 4 && styles.addBtnDisabled]}
              onPress={handleOpenAdd}
              activeOpacity={0.7}
            >
              <Plus size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {goals.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🎯</Text>
                <Text style={styles.emptyTitle}>No goals yet</Text>
                <Text style={styles.emptySubtitle}>Create up to 4 goals to focus your journey</Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={handleOpenAdd}>
                  <Plus size={18} color={Colors.white} />
                  <Text style={styles.emptyBtnText}>Create First Goal</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.goalsList}>
                {goals.map(goal => {
                  const total = getChallengeCount(goal.id);
                  const completed = getCompletedCount(goal.id);
                  const progress = total > 0 ? completed / total : 0;
                  
                  return (
                    <TouchableOpacity 
                      key={goal.id} 
                      style={styles.goalCard}
                      onPress={() => handleOpenEdit(goal)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.goalIcon, { backgroundColor: goal.color + '20' }]}>
                        <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                      </View>
                      <View style={styles.goalContent}>
                        <Text style={styles.goalTitle}>{goal.title}</Text>
                        {goal.description && (
                          <Text style={styles.goalDesc} numberOfLines={1}>{goal.description}</Text>
                        )}
                        <View style={styles.goalStats}>
                          <View style={styles.progressBarSmall}>
                            <View style={[styles.progressFillSmall, { width: `${progress * 100}%`, backgroundColor: goal.color }]} />
                          </View>
                          <Text style={styles.goalStatsText}>{completed}/{total} challenges</Text>
                        </View>
                      </View>
                      <ChevronRight size={20} color={Colors.textMuted} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            <View style={{ height: 20 }} />
          </ScrollView>
        </Animated.View>
      </SafeAreaView>

      <Modal visible={showAddGoal} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => { setShowAddGoal(false); resetForm(); }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalContainer}
          >
            <Pressable style={styles.modalContent} onPress={() => {}}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingGoal ? 'Edit Goal' : 'New Goal'}</Text>
                <View style={styles.modalHeaderRight}>
                  {editingGoal && (
                    <TouchableOpacity 
                      onPress={() => { setShowAddGoal(false); handleDeleteGoal(editingGoal); }}
                      style={styles.deleteBtn}
                    >
                      <Trash2 size={20} color={Colors.error} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => { setShowAddGoal(false); resetForm(); }}>
                    <X size={22} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              <TextInput
                style={styles.modalInput}
                placeholder="What's your goal?"
                placeholderTextColor={Colors.textMuted}
                value={newGoalTitle}
                onChangeText={setNewGoalTitle}
                autoFocus
                maxLength={50}
              />
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="Add a description (optional)"
                placeholderTextColor={Colors.textMuted}
                value={newGoalDesc}
                onChangeText={setNewGoalDesc}
                multiline
                numberOfLines={2}
                maxLength={150}
              />

              <Text style={styles.modalLabel}>Pick an Emoji</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiScroll}>
                {GOAL_EMOJIS.map(emoji => (
                  <TouchableOpacity
                    key={emoji}
                    style={[styles.emojiPill, selectedEmoji === emoji && styles.emojiPillActive]}
                    onPress={() => setSelectedEmoji(emoji)}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.modalLabel}>Pick a Color</Text>
              <View style={styles.colorRow}>
                {GOAL_COLORS.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorDot,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorDotActive,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>

              <View style={styles.previewCard}>
                <View style={[styles.previewIcon, { backgroundColor: selectedColor + '20' }]}>
                  <Text style={styles.previewEmoji}>{selectedEmoji}</Text>
                </View>
                <Text style={styles.previewTitle}>{newGoalTitle || 'Your goal title'}</Text>
              </View>

              <TouchableOpacity
                style={[styles.modalBtn, !newGoalTitle.trim() && styles.modalBtnDisabled]}
                onPress={handleSaveGoal}
                disabled={!newGoalTitle.trim()}
              >
                <Text style={styles.modalBtnText}>{editingGoal ? 'Save Changes' : 'Create Goal'}</Text>
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
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
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
    marginTop: 2,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  addBtnDisabled: {
    opacity: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  emptyState: {
    alignItems: 'center' as const,
    paddingTop: 80,
    paddingBottom: 40,
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
  goalsList: {
    gap: 12,
  },
  goalCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  goalEmoji: {
    fontSize: 24,
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  goalDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  goalStats: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  progressBarSmall: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderLight,
    overflow: 'hidden' as const,
  },
  progressFillSmall: {
    height: '100%',
    borderRadius: 2,
  },
  goalStatsText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500' as const,
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
  modalHeaderRight: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 16,
  },
  deleteBtn: {
    padding: 4,
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
  emojiScroll: {
    marginBottom: 16,
  },
  emojiPill: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.cardAlt,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiPillActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  emojiText: {
    fontSize: 22,
  },
  colorRow: {
    flexDirection: 'row' as const,
    gap: 12,
    marginBottom: 20,
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorDotActive: {
    borderColor: Colors.text,
  },
  previewCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    backgroundColor: Colors.cardAlt,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  previewEmoji: {
    fontSize: 20,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
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
