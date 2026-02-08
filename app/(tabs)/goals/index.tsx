import React, { useState, useRef, useEffect, useMemo } from 'react';
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
import { useColors } from '@/providers/ThemeProvider';
import { useApp } from '@/providers/AppProvider';
import { GOAL_COLORS, GOAL_EMOJIS } from '@/mocks/data';
import { Goal } from '@/types';
import HabitCard from '@/components/HabitCard';
import { ThemeColors } from '@/constants/colors';

type ActiveTab = 'goals' | 'habits';

export default function GoalsScreen() {
  const { goals, challenges, habits, addGoal, updateGoal, deleteGoal, addHabit, toggleHabitComplete } = useApp();
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<ActiveTab>('goals');
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitFrequency, setNewHabitFrequency] = useState<'daily' | 'weekly'>('daily');
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
    if (activeTab === 'habits') {
      setNewHabitTitle('');
      setNewHabitFrequency('daily');
      setShowAddHabit(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }
    if (goals.length >= 4) {
      Alert.alert('Limit Reached', 'You can have a maximum of 4 goals. Delete one to add another.');
      return;
    }
    resetForm();
    setShowAddGoal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSaveHabit = () => {
    if (!newHabitTitle.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addHabit(newHabitTitle.trim(), newHabitFrequency);
    setShowAddHabit(false);
    setNewHabitTitle('');
    setNewHabitFrequency('daily');
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

  const addBtnDisabled = activeTab === 'goals' && goals.length >= 4;

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Goals & Habits</Text>
              <Text style={styles.subtitle}>
                {activeTab === 'goals' ? `${goals.length}/4 goals created` : `${habits.length} habits tracked`}
              </Text>
            </View>
            <TouchableOpacity
              testID="add-btn"
              style={[styles.addBtn, addBtnDisabled && styles.addBtnDisabled]}
              onPress={handleOpenAdd}
              activeOpacity={0.7}
            >
              <Plus size={20} color={colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'goals' && styles.tabActive]}
              onPress={() => setActiveTab('goals')}
            >
              <Text style={[styles.tabText, activeTab === 'goals' && styles.tabTextActive]}>Goals</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'habits' && styles.tabActive]}
              onPress={() => setActiveTab('habits')}
            >
              <Text style={[styles.tabText, activeTab === 'habits' && styles.tabTextActive]}>Habits</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {activeTab === 'goals' ? (
              goals.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>🎯</Text>
                  <Text style={styles.emptyTitle}>No goals yet</Text>
                  <Text style={styles.emptySubtitle}>Create up to 4 goals to focus your journey</Text>
                  <TouchableOpacity style={styles.emptyBtn} onPress={handleOpenAdd}>
                    <Plus size={18} color={colors.white} />
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
                          {goal.description ? (
                            <Text style={styles.goalDesc} numberOfLines={1}>{goal.description}</Text>
                          ) : null}
                          <View style={styles.goalStats}>
                            <View style={styles.progressBarSmall}>
                              <View style={[styles.progressFillSmall, { width: `${progress * 100}%`, backgroundColor: goal.color }]} />
                            </View>
                            <Text style={styles.goalStatsText}>{completed}/{total} challenges</Text>
                          </View>
                        </View>
                        <ChevronRight size={20} color={colors.textMuted} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )
            ) : (
              habits.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>✨</Text>
                  <Text style={styles.emptyTitle}>No habits yet</Text>
                  <Text style={styles.emptySubtitle}>Build small daily or weekly habits to grow</Text>
                  <TouchableOpacity style={styles.emptyBtn} onPress={handleOpenAdd}>
                    <Plus size={18} color={colors.white} />
                    <Text style={styles.emptyBtnText}>Create First Habit</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.goalsList}>
                  {habits.map(habit => (
                    <HabitCard key={habit.id} habit={habit} onToggle={toggleHabitComplete} />
                  ))}
                </View>
              )
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
                      <Trash2 size={20} color={colors.error} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => { setShowAddGoal(false); resetForm(); }}>
                    <X size={22} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              <TextInput
                style={styles.modalInput}
                placeholder="What's your goal?"
                placeholderTextColor={colors.textMuted}
                value={newGoalTitle}
                onChangeText={setNewGoalTitle}
                autoFocus
                maxLength={50}
              />
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="Add a description (optional)"
                placeholderTextColor={colors.textMuted}
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
      <Modal visible={showAddHabit} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setShowAddHabit(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalContainer}
          >
            <Pressable style={styles.modalContent} onPress={() => {}}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Habit</Text>
                <TouchableOpacity onPress={() => setShowAddHabit(false)}>
                  <X size={22} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.modalInput}
                placeholder="What habit do you want to build?"
                placeholderTextColor={colors.textMuted}
                value={newHabitTitle}
                onChangeText={setNewHabitTitle}
                autoFocus
                maxLength={60}
              />

              <Text style={styles.modalLabel}>Frequency</Text>
              <View style={styles.freqRow}>
                <TouchableOpacity
                  style={[styles.freqPill, newHabitFrequency === 'daily' && styles.freqPillActive]}
                  onPress={() => setNewHabitFrequency('daily')}
                >
                  <Text style={[styles.freqPillText, newHabitFrequency === 'daily' && styles.freqPillTextActive]}>Daily</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.freqPill, newHabitFrequency === 'weekly' && styles.freqPillActive]}
                  onPress={() => setNewHabitFrequency('weekly')}
                >
                  <Text style={[styles.freqPillText, newHabitFrequency === 'weekly' && styles.freqPillTextActive]}>Weekly</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.modalBtn, !newHabitTitle.trim() && styles.modalBtnDisabled]}
                onPress={handleSaveHabit}
                disabled={!newHabitTitle.trim()}
              >
                <Text style={styles.modalBtnText}>Create Habit</Text>
              </TouchableOpacity>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
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
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  addBtnDisabled: {
    opacity: 0.5,
  },
  tabBar: {
    flexDirection: 'row' as const,
    marginHorizontal: 20,
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    padding: 3,
    marginBottom: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center' as const,
  },
  tabActive: {
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.text,
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
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  emptyBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
  },
  emptyBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.white,
  },
  goalsList: {
    gap: 12,
  },
  goalCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.card,
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
    color: colors.text,
    marginBottom: 2,
  },
  goalDesc: {
    fontSize: 13,
    color: colors.textSecondary,
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
    backgroundColor: colors.borderLight,
    overflow: 'hidden' as const,
  },
  progressFillSmall: {
    height: '100%',
    borderRadius: 2,
  },
  goalStatsText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end' as const,
  },
  modalContainer: {
    justifyContent: 'flex-end' as const,
  },
  modalContent: {
    backgroundColor: colors.card,
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
    color: colors.text,
  },
  modalInput: {
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    backgroundColor: colors.cardAlt,
  },
  modalTextArea: {
    minHeight: 60,
    textAlignVertical: 'top' as const,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
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
    backgroundColor: colors.cardAlt,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiPillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
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
    borderColor: colors.text,
  },
  previewCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    backgroundColor: colors.cardAlt,
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
    color: colors.text,
  },
  modalBtn: {
    backgroundColor: colors.primary,
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
    color: colors.white,
  },
  freqRow: {
    flexDirection: 'row' as const,
    gap: 10,
    marginBottom: 24,
  },
  freqPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.cardAlt,
    alignItems: 'center' as const,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  freqPillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  freqPillText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textMuted,
  },
  freqPillTextActive: {
    color: colors.primary,
  },
});
