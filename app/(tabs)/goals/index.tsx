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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Target, Flame, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import { FOCUS_AREAS } from '@/mocks/data';
import { FocusArea } from '@/types';
import DreamCard from '@/components/DreamCard';
import HabitCard from '@/components/HabitCard';

export default function GoalsScreen() {
  const { dreams, habits, toggleHabitComplete, addDream, addHabit } = useApp();
  const [activeTab, setActiveTab] = useState<'dreams' | 'habits'>('dreams');
  const [showAddDream, setShowAddDream] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newDreamTitle, setNewDreamTitle] = useState('');
  const [newDreamDesc, setNewDreamDesc] = useState('');
  const [newDreamArea, setNewDreamArea] = useState<FocusArea>('confidence');
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitFreq, setNewHabitFreq] = useState<'daily' | 'weekly'>('daily');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const handleAddDream = () => {
    if (!newDreamTitle.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addDream(newDreamTitle.trim(), newDreamDesc.trim(), newDreamArea);
    setNewDreamTitle('');
    setNewDreamDesc('');
    setShowAddDream(false);
  };

  const handleAddHabit = () => {
    if (!newHabitTitle.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addHabit(newHabitTitle.trim(), newHabitFreq);
    setNewHabitTitle('');
    setShowAddHabit(false);
  };

  const activeHabits = habits.filter(h => h.isActive);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Goals & Habits</Text>
            <TouchableOpacity
              testID="add-btn"
              style={styles.addBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (activeTab === 'dreams') { setShowAddDream(true); } else { setShowAddHabit(true); }
              }}
              activeOpacity={0.7}
            >
              <Plus size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'dreams' && styles.tabActive]}
              onPress={() => setActiveTab('dreams')}
            >
              <Target size={16} color={activeTab === 'dreams' ? Colors.primary : Colors.textMuted} />
              <Text style={[styles.tabText, activeTab === 'dreams' && styles.tabTextActive]}>Dreams</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'habits' && styles.tabActive]}
              onPress={() => setActiveTab('habits')}
            >
              <Flame size={16} color={activeTab === 'habits' ? Colors.primary : Colors.textMuted} />
              <Text style={[styles.tabText, activeTab === 'habits' && styles.tabTextActive]}>Habits</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {activeTab === 'dreams' ? (
              <View style={styles.dreamGrid}>
                {dreams.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>🌙</Text>
                    <Text style={styles.emptyTitle}>No dreams yet</Text>
                    <Text style={styles.emptySubtitle}>Tap + to add your first dream goal</Text>
                  </View>
                ) : (
                  dreams.map(dream => (
                    <View key={dream.id} style={styles.dreamGridItem}>
                      <DreamCard dream={dream} />
                    </View>
                  ))
                )}
              </View>
            ) : (
              <View style={styles.habitsList}>
                {activeHabits.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>🌱</Text>
                    <Text style={styles.emptyTitle}>No habits yet</Text>
                    <Text style={styles.emptySubtitle}>Start small — add your first habit</Text>
                  </View>
                ) : (
                  activeHabits.map(habit => (
                    <HabitCard key={habit.id} habit={habit} onToggle={toggleHabitComplete} />
                  ))
                )}
              </View>
            )}
            <View style={{ height: 20 }} />
          </ScrollView>
        </Animated.View>
      </SafeAreaView>

      <Modal visible={showAddDream} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setShowAddDream(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalContainer}
          >
            <Pressable style={styles.modalContent} onPress={() => {}}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Dream</Text>
                <TouchableOpacity onPress={() => setShowAddDream(false)}>
                  <X size={22} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.modalInput}
                placeholder="What's your dream?"
                placeholderTextColor={Colors.textMuted}
                value={newDreamTitle}
                onChangeText={setNewDreamTitle}
                autoFocus
              />
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="Describe it briefly..."
                placeholderTextColor={Colors.textMuted}
                value={newDreamDesc}
                onChangeText={setNewDreamDesc}
                multiline
                numberOfLines={3}
              />
              <Text style={styles.modalLabel}>Focus Area</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.areaScroll}>
                {FOCUS_AREAS.map(area => (
                  <TouchableOpacity
                    key={area.id}
                    style={[styles.areaPill, newDreamArea === area.id && styles.areaPillActive]}
                    onPress={() => setNewDreamArea(area.id)}
                  >
                    <Text style={styles.areaPillEmoji}>{area.emoji}</Text>
                    <Text style={[styles.areaPillText, newDreamArea === area.id && styles.areaPillTextActive]}>
                      {area.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={[styles.modalBtn, !newDreamTitle.trim() && styles.modalBtnDisabled]}
                onPress={handleAddDream}
                disabled={!newDreamTitle.trim()}
              >
                <Text style={styles.modalBtnText}>Create Dream</Text>
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
                  <X size={22} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.modalInput}
                placeholder="What habit do you want to build?"
                placeholderTextColor={Colors.textMuted}
                value={newHabitTitle}
                onChangeText={setNewHabitTitle}
                autoFocus
              />
              <Text style={styles.modalLabel}>Frequency</Text>
              <View style={styles.freqRow}>
                <TouchableOpacity
                  style={[styles.freqBtn, newHabitFreq === 'daily' && styles.freqBtnActive]}
                  onPress={() => setNewHabitFreq('daily')}
                >
                  <Text style={[styles.freqBtnText, newHabitFreq === 'daily' && styles.freqBtnTextActive]}>Daily</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.freqBtn, newHabitFreq === 'weekly' && styles.freqBtnActive]}
                  onPress={() => setNewHabitFreq('weekly')}
                >
                  <Text style={[styles.freqBtnText, newHabitFreq === 'weekly' && styles.freqBtnTextActive]}>Weekly</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.modalBtn, !newHabitTitle.trim() && styles.modalBtnDisabled]}
                onPress={handleAddHabit}
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
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  tabRow: {
    flexDirection: 'row' as const,
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 8,
  },
  tab: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: Colors.cardAlt,
  },
  tabActive: {
    backgroundColor: Colors.primarySoft,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  dreamGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
  },
  dreamGridItem: {
    width: '100%',
  },
  habitsList: {
    gap: 10,
  },
  emptyState: {
    alignItems: 'center' as const,
    paddingTop: 60,
    paddingBottom: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
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
    minHeight: 80,
    textAlignVertical: 'top' as const,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  areaScroll: {
    marginBottom: 20,
  },
  areaPill: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.cardAlt,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  areaPillActive: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
  },
  areaPillEmoji: {
    fontSize: 14,
  },
  areaPillText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  areaPillTextActive: {
    color: Colors.primary,
  },
  freqRow: {
    flexDirection: 'row' as const,
    gap: 10,
    marginBottom: 20,
  },
  freqBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center' as const,
    backgroundColor: Colors.cardAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  freqBtnActive: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
  },
  freqBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  freqBtnTextActive: {
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
